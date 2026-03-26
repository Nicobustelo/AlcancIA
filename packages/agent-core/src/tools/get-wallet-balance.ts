import { tool } from '@langchain/core/tools';
import { createPriceOracle } from '@beexo/blockchain';
import { GetWalletBalanceInput } from '../schemas';
import { mockBalancesForAddress, parseRbtcHumanAmount, usdToLocal } from './utils';

export const getWalletBalanceTool = tool(
  async (input) => {
    const { rbtc, doc } = mockBalancesForAddress(input.walletAddress);
    const oracle = createPriceOracle();
    const btcQuote = await oracle.getBtcUsdPrice();
    const docQuote = await oracle.getDocUsdPrice();

    const rbtcN = parseRbtcHumanAmount(rbtc);
    const docN = Number.parseFloat(doc);
    const rbtcUsd = rbtcN * btcQuote.price;
    const docUsd = docN * docQuote.price;
    const totalUsd = rbtcUsd + docUsd;

    const localRbtc = await usdToLocal(rbtcUsd);
    const localDoc = await usdToLocal(docUsd);
    const localTotal = await usdToLocal(totalUsd);

    return JSON.stringify({
      walletAddress: input.walletAddress,
      rbtc,
      doc,
      rbtcUsd,
      docUsd,
      totalUsd,
      localCurrency: localTotal.code,
      rbtcLocal: localRbtc.local,
      docLocal: localDoc.local,
      totalLocal: localTotal.local,
      priceOracleMock: btcQuote.isMock || docQuote.isMock,
      fiatRatesMock: localTotal.isMock,
      disclaimer:
        'Balances on-chain reales requieren firma en el cliente; estos valores son representativos para planificación en este servidor.',
    });
  },
  {
    name: 'get_wallet_balance',
    description:
      'Obtiene un resumen de saldos RBTC y DOC con equivalentes en USD y moneda local (demo/planificación). Para operaciones reales el usuario firma en su wallet.',
    schema: GetWalletBalanceInput,
  },
);
