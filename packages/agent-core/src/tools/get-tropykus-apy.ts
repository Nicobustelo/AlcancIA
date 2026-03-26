import { tool } from '@langchain/core/tools';
import { createTropykusAdapter, getFeatureFlags, MockTropykusAdapter } from '@beexo/blockchain';
import { GetTropykusApyInput } from '../schemas';

async function resolveApy(): Promise<{ apy: number; isMock: boolean }> {
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

export const getTropykusApyTool = tool(
  async () => {
    const result = await resolveApy();
    return JSON.stringify({
      apy: result.apy,
      isMock: result.isMock,
      protocol: 'Tropykus',
      asset: 'kDOC (depósito DOC)',
    });
  },
  {
    name: 'get_tropykus_apy',
    description:
      'Consulta el APY estimado actual del mercado Tropykus para depósitos de DOC (rendimiento). Puede ser dato on-chain real o simulado para demo.',
    schema: GetTropykusApyInput,
  },
);
