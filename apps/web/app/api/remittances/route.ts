import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  addRemittance,
  getRemittances,
  type RemittanceStatus,
} from '@/lib/remittance-store';

const createSchema = z.object({
  destinatario: z.string().min(1),
  montoUsd: z.number().positive(),
  frecuencia: z.string().min(1),
  proximaEjecucion: z.string().min(1),
  estado: z
    .enum(['programada', 'ejecutada', 'fallida', 'cancelada'])
    .optional()
    .default('programada'),
});

export async function GET() {
  return NextResponse.json({ items: getRemittances() });
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Cuerpo JSON inválido' },
      { status: 400 },
    );
  }

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const estado = parsed.data.estado as RemittanceStatus;
  const row = addRemittance({
    destinatario: parsed.data.destinatario,
    montoUsd: parsed.data.montoUsd,
    frecuencia: parsed.data.frecuencia,
    proximaEjecucion: parsed.data.proximaEjecucion,
    estado,
  });

  return NextResponse.json({ item: row }, { status: 201 });
}
