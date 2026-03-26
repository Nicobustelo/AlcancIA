/**
 * Tasas fiat USD → moneda local: API pública con caché (real) o tabla fija (mock).
 * Frankfurter no lista ARS; usamos open.er-api.com (sin clave para uso básico).
 */

import { getFeatureFlags } from '../feature-flags';

const CACHE_TTL_MS = 5 * 60 * 1000;

/** Tasas mock fijas respecto a USD (1 USD = rate unidades locales) */
const MOCK_RATES: Record<string, number> = {
  ARS: 1250,
  PEN: 3.75,
  MXN: 17.5,
  USD: 1,
};

export interface FiatRateQuote {
  rate: number;
  isMock: boolean;
}

export interface IFiatRateProvider {
  getRate(from: string, to: string): Promise<FiatRateQuote>;
}

interface ErApiResponse {
  result?: string;
  rates?: Record<string, number>;
}

let ratesCache: { base: string; rates: Record<string, number>; fetchedAt: number } | null = null;

function normalize(code: string): string {
  return code.trim().toUpperCase();
}

function readCache(base: string): Record<string, number> | null {
  if (!ratesCache || normalize(ratesCache.base) !== normalize(base)) return null;
  if (Date.now() - ratesCache.fetchedAt > CACHE_TTL_MS) {
    ratesCache = null;
    return null;
  }
  return ratesCache.rates;
}

async function fetchUsdRates(): Promise<Record<string, number>> {
  const cached = readCache('USD');
  if (cached) return cached;

  const url = 'https://open.er-api.com/v6/latest/USD';
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Exchange rate API HTTP ${res.status}`);
  }
  const data = (await res.json()) as ErApiResponse;
  if (data.result !== 'success' || !data.rates) {
    throw new Error('Exchange rate API: invalid payload');
  }

  ratesCache = { base: 'USD', rates: data.rates, fetchedAt: Date.now() };
  return data.rates;
}

export class RealFiatRateProvider implements IFiatRateProvider {
  async getRate(from: string, to: string): Promise<FiatRateQuote> {
    const f = normalize(from);
    const t = normalize(to);
    if (f === t) {
      return { rate: 1, isMock: false };
    }

    const rates = await fetchUsdRates();

    if (f === 'USD') {
      const direct = rates[t];
      if (direct === undefined) {
        throw new Error(`Unknown currency code: ${t}`);
      }
      return { rate: direct, isMock: false };
    }

    if (t === 'USD') {
      const unitsOfFromPerUsd = rates[f];
      if (unitsOfFromPerUsd === undefined) {
        throw new Error(`Unknown currency code: ${f}`);
      }
      return { rate: 1 / unitsOfFromPerUsd, isMock: false };
    }

    // API devuelve "cuántas unidades de X por 1 USD"
    const perUsdF = rates[f];
    const perUsdT = rates[t];
    if (perUsdF === undefined || perUsdT === undefined) {
      throw new Error(`Unknown currency pair: ${f}/${t}`);
    }
    return { rate: perUsdT / perUsdF, isMock: false };
  }
}

export class MockFiatRateProvider implements IFiatRateProvider {
  async getRate(from: string, to: string): Promise<FiatRateQuote> {
    const f = normalize(from);
    const t = normalize(to);
    if (f === t) {
      return { rate: 1, isMock: true };
    }

    const fromRate = MOCK_RATES[f] ?? 1;
    const toRate = MOCK_RATES[t] ?? 1;
    // Convierte 1 unidad `from` → cuántas unidades `to` (ambas vs USD)
    const rate = toRate / fromRate;
    return { rate, isMock: true };
  }
}

/** Factory según feature flag `enableRealFiatRates` */
export function createFiatRateProvider(): IFiatRateProvider {
  const { enableRealFiatRates } = getFeatureFlags();
  return enableRealFiatRates ? new RealFiatRateProvider() : new MockFiatRateProvider();
}
