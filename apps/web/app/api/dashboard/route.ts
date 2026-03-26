import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    balances: {
      rbtc: { value: 0.042, unit: 'RBTC', mock: true },
      doc: { value: 1250.5, unit: 'DOC', mock: true },
      usd: { value: 1280.2, unit: 'USD', mock: true },
      local: { value: 1_120_000, unit: 'ARS', mock: true },
    },
    yield: {
      apyPercent: 7.4,
      accruedUsd: 12.8,
      estimatedMonthlyUsd: 8.1,
      estimatedYearlyUsd: 94.2,
      mock: true,
    },
    nextRemittance: {
      destinatario: 'María G.',
      montoUsd: 50,
      fecha: '2025-04-01',
      estado: 'programada',
      mock: true,
    },
    recentActivity: [
      {
        id: 'a1',
        tipo: 'Depósito Tropykus',
        monto: '0.01 RBTC',
        estado: 'confirmada',
        fecha: '2025-03-22',
      },
      {
        id: 'a2',
        tipo: 'Remesa',
        monto: '50 USD',
        estado: 'confirmada',
        fecha: '2025-03-01',
      },
      {
        id: 'a3',
        tipo: 'Swap RBTC → DOC',
        monto: '0.002 RBTC',
        estado: 'pendiente',
        fecha: '2025-03-24',
      },
    ],
  });
}
