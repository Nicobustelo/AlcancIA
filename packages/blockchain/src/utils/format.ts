import { formatUnits, parseUnits } from 'viem';

const RBTC_DECIMALS = 18;
const DOC_DECIMALS = 18;

/** Recorta la parte fraccionaria a `max` dígitos (sin redondeo bancario). */
function trimFractional(unitsStr: string, max: number): string {
  const negative = unitsStr.startsWith('-');
  const raw = negative ? unitsStr.slice(1) : unitsStr;
  const [intPart, frac = ''] = raw.split('.');
  const trimmed = frac.slice(0, max).replace(/0+$/, '');
  const sign = negative ? '-' : '';
  if (!trimmed) return `${sign}${intPart}`;
  return `${sign}${intPart}.${trimmed}`;
}

/** Formatea saldo RBTC en wei a string con hasta 6 decimales */
export function formatRbtc(wei: bigint): string {
  return trimFractional(formatUnits(wei, RBTC_DECIMALS), 6);
}

/** Formatea saldo DOC en wei a string con hasta 2 decimales */
export function formatDoc(wei: bigint): string {
  return trimFractional(formatUnits(wei, DOC_DECIMALS), 2);
}

/** Formatea cantidad en USD: $X,XXX.XX */
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Formatea número en moneda local (código ISO 4217) */
export function formatLocalCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  }
}

/** Convierte entrada humana RBTC → wei (18 decimales) */
export function parseRbtc(value: string): bigint {
  const normalized = value.trim().replace(/,/g, '');
  if (!normalized || normalized === '.') {
    throw new Error('Invalid RBTC amount');
  }
  return parseUnits(normalized, RBTC_DECIMALS);
}

/** Convierte entrada humana DOC → wei (18 decimales) */
export function parseDoc(value: string): bigint {
  const normalized = value.trim().replace(/,/g, '');
  if (!normalized || normalized === '.') {
    throw new Error('Invalid DOC amount');
  }
  return parseUnits(normalized, DOC_DECIMALS);
}

const ADDR_PREFIX_LEN = 6;
const ADDR_SUFFIX_LEN = 4;

/** Dirección corta estilo 0x1234…5678 */
export function shortenAddress(address: string): string {
  const a = address.trim();
  if (a.length <= ADDR_PREFIX_LEN + ADDR_SUFFIX_LEN) return a;
  return `${a.slice(0, ADDR_PREFIX_LEN)}…${a.slice(-ADDR_SUFFIX_LEN)}`;
}

const TX_PREFIX_LEN = 10;
const TX_SUFFIX_LEN = 8;

/** Hash de tx corto para UI */
export function shortenTxHash(hash: string): string {
  const h = hash.trim();
  if (h.length <= TX_PREFIX_LEN + TX_SUFFIX_LEN) return h;
  return `${h.slice(0, TX_PREFIX_LEN)}…${h.slice(-TX_SUFFIX_LEN)}`;
}
