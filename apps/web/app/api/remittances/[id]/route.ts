import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  deleteRemittance,
  updateRemittanceAction,
} from '@/lib/remittance-store';

const updateSchema = z.object({
  action: z.enum(['cancel', 'execute']),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Acción inválida' },
        },
        { status: 400 },
      );
    }

    const updated = updateRemittanceAction(id, parsed.data.action);
    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Remesa no encontrada' },
        },
        { status: 404 },
      );
    }

    const action = parsed.data.action;
    const result = {
      id,
      action,
      status: action === 'cancel' ? 'cancelada' : 'ejecutada',
      updatedAt: new Date().toISOString(),
      message:
        action === 'cancel'
          ? 'Remesa cancelada exitosamente.'
          : 'Remesa ejecutada exitosamente (simulado en demo).',
      txHash:
        action === 'execute'
          ? `0xdemo_${Date.now().toString(16)}`
          : undefined,
    };

    return NextResponse.json({ success: true, data: result });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error al procesar remesa' },
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const removed = deleteRemittance(id);
  if (!removed) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Remesa no encontrada' },
      },
      { status: 404 },
    );
  }
  return NextResponse.json({
    success: true,
    data: { id, deleted: true, message: 'Remesa eliminada.' },
  });
}
