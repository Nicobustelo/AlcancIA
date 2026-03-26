import { NextResponse } from 'next/server';
import { z } from 'zod';

// In-memory user settings store for demo
let userSettings: Record<
  string,
  {
    walletAddress: string;
    localCurrency: string;
    localCurrencyRate: number;
    displayName: string;
  }
> = {};

const updateSchema = z.object({
  walletAddress: z.string().min(1),
  localCurrency: z.enum(['USD', 'ARS', 'PEN', 'MXN']).optional(),
  displayName: z.string().optional(),
});

const CURRENCY_RATES: Record<string, number> = {
  USD: 1,
  ARS: 1250,
  PEN: 3.75,
  MXN: 17.5,
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get('walletAddress') || 'default';

  const settings = userSettings[wallet] || {
    walletAddress: wallet,
    localCurrency: 'ARS',
    localCurrencyRate: CURRENCY_RATES['ARS'],
    displayName: '',
  };

  return NextResponse.json({ success: true, data: settings });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos' },
        },
        { status: 400 },
      );
    }

    const wallet = parsed.data.walletAddress;
    const existing = userSettings[wallet] || {
      walletAddress: wallet,
      localCurrency: 'ARS',
      localCurrencyRate: CURRENCY_RATES['ARS'],
      displayName: '',
    };

    if (parsed.data.localCurrency) {
      existing.localCurrency = parsed.data.localCurrency;
      existing.localCurrencyRate =
        CURRENCY_RATES[parsed.data.localCurrency] || 1;
    }
    if (parsed.data.displayName !== undefined) {
      existing.displayName = parsed.data.displayName;
    }

    userSettings[wallet] = existing;
    return NextResponse.json({ success: true, data: existing });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al guardar configuración',
        },
      },
      { status: 500 },
    );
  }
}
