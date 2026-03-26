export type RemittanceStatus =
  | 'programada'
  | 'ejecutada'
  | 'fallida'
  | 'cancelada';

export interface RemittanceRecord {
  id: string;
  destinatario: string;
  montoUsd: number;
  frecuencia: string;
  proximaEjecucion: string;
  estado: RemittanceStatus;
  creado: string;
}

const seed: RemittanceRecord[] = [
  {
    id: 'r1',
    destinatario: 'María G. (AR)',
    montoUsd: 50,
    frecuencia: 'Mensual — día 1',
    proximaEjecucion: '2025-04-01',
    estado: 'programada',
    creado: '2025-03-10',
  },
  {
    id: 'r2',
    destinatario: 'Carlos P. (PE)',
    montoUsd: 120,
    frecuencia: 'Quincenal',
    proximaEjecucion: '2025-03-28',
    estado: 'ejecutada',
    creado: '2025-02-01',
  },
  {
    id: 'r3',
    destinatario: 'Ana L. (MX)',
    montoUsd: 80,
    frecuencia: 'Mensual — día 15',
    proximaEjecucion: '—',
    estado: 'fallida',
    creado: '2025-01-12',
  },
];

let store = [...seed];

export function getRemittances(): RemittanceRecord[] {
  return [...store];
}

export function addRemittance(
  input: Omit<RemittanceRecord, 'id' | 'creado'>,
): RemittanceRecord {
  const id = `r-${Date.now()}`;
  const row: RemittanceRecord = {
    ...input,
    id,
    creado: new Date().toISOString().slice(0, 10),
  };
  store = [row, ...store];
  return row;
}
