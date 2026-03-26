import { tool } from '@langchain/core/tools';
import { createPriceOracle, createTropykusAdapter, getFeatureFlags, MockTropykusAdapter } from '@beexo/blockchain';
import { GetPortfolioStatusInput } from '../schemas';
import { agentConfig } from '../config';
import { formatBigDoc, mockBalancesForAddress, parseRbtcHumanAmount, usdToLocal } from './utils';

async function tropykusPosition(walletAddress: string): Promise<{
  kDocBalance: string;
  underlyingDoc: string;
  isMock: boolean;
}> {
  const { enableRealTropykus } = getFeatureFlags();
  if (!enableRealTropykus) {
    const m = new MockTropykusAdapter();
    const b = await m.getBalance(walletAddress);
    return {
      kDocBalance: formatBigDoc(b.kDocBalance),
      underlyingDoc: formatBigDoc(b.underlyingBalance),
      isMock: b.isMock,
    };
  }
  try {
    const adapter = createTropykusAdapter(true);
    const b = await adapter.getBalance(walletAddress);
    return {
      kDocBalance: formatBigDoc(b.kDocBalance),
      underlyingDoc: formatBigDoc(b.underlyingBalance),
      isMock: b.isMock,
    };
  } catch {
    const m = new MockTropykusAdapter();
    const b = await m.getBalance(walletAddress);
    return {
      kDocBalance: formatBigDoc(b.kDocBalance),
      underlyingDoc: formatBigDoc(b.underlyingBalance),
      isMock: true,
    };
  }
}

async function currentApy(): Promise<{ apy: number; isMock: boolean }> {
  const { enableRealTropykus } = getFeatureFlags();
  if (!enableRealTropykus) {
    return new MockTropykusAdapter().getApy();
  }
  try {
    return await createTropykusAdapter(true).getApy();
  } catch {
    return new MockTropykusAdapter().getApy();
  }
}

export const getPortfolioStatusTool = tool(
  async (input) => {
    const { rbtc, doc } = mockBalancesForAddress(input.walletAddress);
    const oracle = createPriceOracle();
    const btcQuote = await oracle.getBtcUsdPrice();
    const docQuote = await oracle.getDocUsdPrice();
    const rbtcN = parseRbtcHumanAmount(rbtc);
    const docN = Number.parseFloat(doc);
    const walletRbtcUsd = rbtcN * btcQuote.price;
    const walletDocUsd = docN * docQuote.price;

    const position = await tropykusPosition(input.walletAddress);
    const underlyingUsd = Number.parseFloat(position.underlyingDoc) * docQuote.price;
    const apy = await currentApy();

    const totalUsd = walletRbtcUsd + walletDocUsd + underlyingUsd;
    const localTotal = await usdToLocal(totalUsd);

    const warnings: string[] = [];
    if (apy.apy < agentConfig.minApyWarningThreshold) {
      warnings.push(
        `APY Tropykus (${apy.apy.toFixed(2)}%) por debajo del umbral de referencia ${agentConfig.minApyWarningThreshold}%.`,
      );
    }

    return JSON.stringify({
      walletAddress: input.walletAddress,
      wallet: {
        rbtc,
        doc,
        rbtcUsd: walletRbtcUsd,
        docUsd: walletDocUsd,
      },
      tropykus: {
        kDocBalance: position.kDocBalance,
        underlyingDoc: position.underlyingDoc,
        underlyingUsd,
        apyPercent: apy.apy,
        apyIsMock: apy.isMock,
        positionIsMock: position.isMock,
      },
      totals: {
        usd: totalUsd,
        localCurrency: localTotal.code,
        local: localTotal.local,
      },
      warnings,
      note: 'Resumen para planificación; posiciones reales dependen de lectura on-chain firmada por el usuario.',
    });
  },
  {
    name: 'get_portfolio_status',
    description:
      'Devuelve estado de cartera: saldos de wallet (RBTC/DOC), posición en Tropykus, APY y totales en USD y moneda local.',
    schema: GetPortfolioStatusInput,
  },
);
