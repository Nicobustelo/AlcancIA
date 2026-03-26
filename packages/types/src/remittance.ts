/**
 * Remesas programadas: modelo de dominio y DTOs de creación/listado.
 */

export type RemittanceStatus =
  | 'scheduled'
  | 'executing'
  | 'executed'
  | 'failed'
  | 'cancelled';

/**
 * Remesa recurrente o puntual vinculada a un usuario y monto en USD/DOC.
 */
export interface Remittance {
  id: string;
  userId: string;
  recipientAddress: string;
  amountUsd: number;
  amountDoc: string;
  dayOfMonth: number;
  status: RemittanceStatus;
  txHash?: string;
  onChainId?: string;
  nextExecution?: string;
  createdAt: string;
  updatedAt: string;
  executedAt?: string;
}

/** Payload para crear una nueva remesa desde la API o la UI. */
export interface CreateRemittanceInput {
  recipientAddress: string;
  amountUsd: number;
  dayOfMonth: number;
}

/** Fila de lista con etiqueta opcional para mostrar alias del destinatario. */
export interface RemittanceListItem extends Remittance {
  recipientLabel?: string;
}
