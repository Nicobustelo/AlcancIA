import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    items: [
      {
        id: 'tx-1',
        tipo: 'Supply',
        monto: '0.015',
        asset: 'RBTC',
        estado: 'confirmada',
        fecha: '2025-03-22T14:32:00.000Z',
        txHash:
          '0xabc123def456789012345678901234567890123456789012345678901234abcd',
      },
      {
        id: 'tx-2',
        tipo: 'Remesa programada',
        monto: '50',
        asset: 'USD',
        estado: 'confirmada',
        fecha: '2025-03-01T09:00:00.000Z',
        txHash:
          '0xdef456789012345678901234567890123456789012345678901234567890abcd',
      },
      {
        id: 'tx-3',
        tipo: 'Swap',
        monto: '0.002',
        asset: 'RBTC → DOC',
        estado: 'fallida',
        fecha: '2025-03-20T18:10:00.000Z',
        txHash: null,
      },
    ],
  });
}
