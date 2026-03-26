import { tool } from '@langchain/core/tools';
import { ExecuteRemittanceInput } from '../schemas';
import { getRemittance, updateRemittance } from './remittance-store';

export const executeRemittanceTool = tool(
  async (input) => {
    const rec = getRemittance(input.remittanceId);
    if (!rec) {
      return JSON.stringify({
        success: false,
        error: 'Remesa no encontrada. Verificá el id o volvé a programarla.',
        remittanceId: input.remittanceId,
      });
    }

    if (rec.status !== 'scheduled') {
      return JSON.stringify({
        success: false,
        error: `La remesa ya está en estado ${rec.status}.`,
        remittanceId: input.remittanceId,
        record: rec,
      });
    }

    const txHash = `0xmock_remittance_${Date.now().toString(16)}`;
    updateRemittance(input.remittanceId, {
      status: 'executed',
      executedTxHash: txHash,
    });

    const updated = getRemittance(input.remittanceId);

    return JSON.stringify({
      success: true,
      remittanceId: input.remittanceId,
      txHash,
      record: updated,
      isMock: true,
      note: 'Ejecución simulada en servidor; en producción interactuaría con RemittanceScheduler en Rootstock.',
    });
  },
  {
    name: 'execute_remittance',
    description:
      'Ejecuta una remesa previamente programada (demo) usando su remittanceId. Solo proceder tras confirmación explícita del usuario.',
    schema: ExecuteRemittanceInput,
  },
);
