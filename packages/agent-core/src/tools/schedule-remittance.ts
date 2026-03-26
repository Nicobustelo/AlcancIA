import { tool } from '@langchain/core/tools';
import { ScheduleRemittanceInput } from '../schemas';
import { saveRemittance } from './remittance-store';

export const scheduleRemittanceTool = tool(
  async (input) => {
    const id = `rem_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const record = {
      id,
      recipientAddress: input.recipientAddress,
      amountUsd: input.amountUsd,
      dayOfMonth: input.dayOfMonth,
      status: 'scheduled' as const,
      createdAt: new Date().toISOString(),
    };
    saveRemittance(record);

    return JSON.stringify({
      remittanceId: id,
      recipientAddress: input.recipientAddress,
      amountUsd: input.amountUsd,
      dayOfMonth: input.dayOfMonth,
      status: record.status,
      createdAt: record.createdAt,
      isMock: true,
      note: 'Remesa programada en memoria del servidor (demo). En producción persistiría en base de datos y contrato RemittanceScheduler.',
    });
  },
  {
    name: 'schedule_remittance',
    description:
      'Programa una remesa recurrente (demo): destinatario, monto en USD y día del mes (1-28). Devuelve un id para ejecutarla después con confirmación.',
    schema: ScheduleRemittanceInput,
  },
);
