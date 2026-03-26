'use client';

import { useState, useCallback } from 'react';

type CurrencyCode = 'USD' | 'ARS' | 'PEN' | 'MXN';

const MOCK_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  ARS: 1250,
  PEN: 3.75,
  MXN: 17.5,
};

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: 'US$',
  ARS: 'AR$',
  PEN: 'S/',
  MXN: 'MX$',
};

/** Hook para conversión de moneda local */
export function useLocalCurrency(defaultCurrency: CurrencyCode = 'ARS') {
  const [currency, setCurrency] = useState<CurrencyCode>(defaultCurrency);
  const rate = MOCK_RATES[currency];
  const symbol = CURRENCY_SYMBOLS[currency];

  const convert = useCallback(
    (usdAmount: number): number => usdAmount * rate,
    [rate],
  );

  const format = useCallback(
    (usdAmount: number): string => {
      const local = usdAmount * rate;
      return `${symbol} ${new Intl.NumberFormat('es-AR', {
        maximumFractionDigits: currency === 'USD' ? 2 : 0,
      }).format(local)}`;
    },
    [rate, symbol, currency],
  );

  return {
    currency,
    setCurrency,
    rate,
    symbol,
    convert,
    format,
    availableCurrencies: Object.keys(MOCK_RATES) as CurrencyCode[],
  };
}
