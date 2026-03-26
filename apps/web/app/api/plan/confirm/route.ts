import { NextResponse } from 'next/server';
import { z } from 'zod';

const confirmSchema = z.object({
  planId: z.string().min(1),
  walletAddress: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = confirmSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos' },
        },
        { status: 400 },
      );
    }

    // En demo, simulamos la confirmación del plan
    // En producción, esto dispararía la ejecución on-chain
    const confirmedPlan = {
      id: parsed.data.planId,
      status: 'confirmed',
      confirmedAt: new Date().toISOString(),
      walletAddress: parsed.data.walletAddress,
      message:
        'Plan confirmado exitosamente. En modo demo, las transacciones se simulan.',
    };

    return NextResponse.json({ success: true, data: confirmedPlan });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error al confirmar el plan' },
      },
      { status: 500 },
    );
  }
}
