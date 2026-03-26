import { tool } from '@langchain/core/tools';
import { GetTransactionStatusInput } from '../schemas';

function pseudoRandomConfirmations(txHash: string): number {
  let h = 0;
  for (let i = 0; i < txHash.length; i++) {
    h = (h * 31 + txHash.charCodeAt(i)) >>> 0;
  }
  return 1 + (h % 20);
}

export const getTransactionStatusTool = tool(
  async (input) => {
    const hash = input.txHash.trim();
    const lower = hash.toLowerCase();

    if (lower.includes('fail') || lower.includes('revert')) {
      return JSON.stringify({
        txHash: hash,
        status: 'failed',
        confirmations: 0,
        summary: 'La transacción no se completó (simulación). Revisá el monto, el gas o la red.',
        isMock: true,
      });
    }

    if (lower.includes('pending')) {
      return JSON.stringify({
        txHash: hash,
        status: 'pending',
        confirmations: 0,
        summary: 'Transacción pendiente de minado en Rootstock (estimación demo).',
        isMock: true,
      });
    }

    const confirmations = pseudoRandomConfirmations(hash);

    return JSON.stringify({
      txHash: hash,
      status: 'confirmed',
      confirmations,
      summary: `Transacción confirmada (demo) con ${confirmations} confirmaciones estimadas.`,
      isMock: true,
      note: 'Estado simulado: en producción se consultaría el RPC de Rootstock.',
    });
  },
  {
    name: 'get_transaction_status',
    description:
      'Consulta el estado de una transacción por hash en Rootstock (respuesta simulada para demo: pending/confirmed/failed).',
    schema: GetTransactionStatusInput,
  },
);
