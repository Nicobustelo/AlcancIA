import { createFiatRateProvider } from '@beexo/blockchain';
import { agentConfig } from '../config';

const RBTC_DECIMALS = 18n;
const UNIT = 10n ** RBTC_DECIMALS;

/** Hash simple para datos mock determinísticos por dirección */
export function addressSeed(address: string): number {
  const normalized = address.toLowerCase().replace(/^0x/, '');
  let h = 2166136261;
  for (let i = 0; i < normalized.length; i++) {
    h ^= normalized.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Parsea cantidad RBTC legible (coma o punto decimal) */
export function parseRbtcHumanAmount(raw: string): number {
  const normalized = raw.trim().replace(',', '.');
  const n = Number.parseFloat(normalized);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error('Cantidad de RBTC inválida');
  }
  return n;
}

/** RBTC humano → wei (bigint) para adaptadores MoC mock */
export function rbtcHumanToWei(amount: number): bigint {
  const scaled = Math.floor(amount * 1e18);
  return BigInt(scaled);
}

export function formatBigDoc(docWei: bigint): string {
  const whole = docWei / UNIT;
  const frac = docWei % UNIT;
  if (frac === 0n) return whole.toString();
  const fracStr = frac.toString().padStart(18, '0').replace(/0+$/, '');
  return `${whole.toString()}.${fracStr}`;
}

/** Mock balances determinísticos */
export function mockBalancesForAddress(walletAddress: string): {
  rbtc: string;
  doc: string;
} {
  const seed = addressSeed(walletAddress);
  const rbtc = 0.002 + (seed % 10000) / 1_000_000;
  const doc = 120 + (seed % 5000) / 10;
  return {
    rbtc: rbtc.toFixed(6),
    doc: doc.toFixed(2),
  };
}

export async function usdToLocal(usd: number): Promise<{ local: number; code: string; rate: number; isMock: boolean }> {
  const fiat = createFiatRateProvider();
  const code = agentConfig.defaultLocalCurrency;
  const { rate, isMock } = await fiat.getRate('USD', code);
  return { local: usd * rate, code, rate, isMock };
}
