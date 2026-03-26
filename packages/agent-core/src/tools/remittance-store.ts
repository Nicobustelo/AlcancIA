export type RemittanceRecord = {
  id: string;
  recipientAddress: string;
  amountUsd: number;
  dayOfMonth: number;
  status: 'scheduled' | 'executed' | 'failed';
  createdAt: string;
  executedTxHash?: string;
};

const store = new Map<string, RemittanceRecord>();

export function saveRemittance(rec: RemittanceRecord): void {
  store.set(rec.id, rec);
}

export function getRemittance(id: string): RemittanceRecord | undefined {
  return store.get(id);
}

export function updateRemittance(id: string, patch: Partial<RemittanceRecord>): void {
  const cur = store.get(id);
  if (!cur) return;
  store.set(id, { ...cur, ...patch });
}
