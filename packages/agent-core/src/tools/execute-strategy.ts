import { tool } from '@langchain/core/tools';
import {
  createMocAdapter,
  createTropykusAdapter,
  getFeatureFlags,
  MockMocAdapter,
  MockTropykusAdapter,
} from '@beexo/blockchain';
import { ExecuteStrategyInput } from '../schemas';
import { parseRbtcHumanAmount, rbtcHumanToWei } from './utils';

async function runWithMockFallback<T>(realFn: () => Promise<T>, mockFn: () => Promise<T>): Promise<T> {
  try {
    return await realFn();
  } catch {
    return mockFn();
  }
}

export const executeStrategyTool = tool(
  async (input) => {
    const rbtcHuman = parseRbtcHumanAmount(input.rbtcAmount);
    const wei = rbtcHumanToWei(rbtcHuman);
    const flags = getFeatureFlags();

    const mocResult = await runWithMockFallback(
      () => createMocAdapter(flags.enableRealMoc).mintDoc(wei),
      () => new MockMocAdapter().mintDoc(wei),
    );

    const tropResult = await runWithMockFallback(
      () => createTropykusAdapter(flags.enableRealTropykus).supply(mocResult.docReceived),
      () => new MockTropykusAdapter().supply(mocResult.docReceived),
    );

    return JSON.stringify({
      walletAddress: input.walletAddress,
      rbtcAmount: input.rbtcAmount,
      steps: [
        {
          name: 'moc_mint_doc',
          success: mocResult.success,
          txHash: mocResult.txHash ?? null,
          docReceivedWei: mocResult.docReceived.toString(),
          isMock: mocResult.isMock,
        },
        {
          name: 'tropykus_supply',
          success: tropResult.success,
          txHash: tropResult.txHash ?? null,
          kDocReceivedWei: tropResult.kDocReceived.toString(),
          isMock: tropResult.isMock,
        },
      ],
      overallSuccess: mocResult.success && tropResult.success,
      disclaimer:
        'Ejecución simulada o vía adaptadores según flags del entorno; las tx reales requieren wallet con fondos y gas en Rootstock.',
    });
  },
  {
    name: 'execute_strategy',
    description:
      'Ejecuta la estrategia completa demo RBTC→DOC (MoC)→depósito Tropykus (kDOC) tras confirmación del usuario. Puede usar adaptadores mock.',
    schema: ExecuteStrategyInput,
  },
);
