/**
 * Oráculo de precios: BTC/USD y DOC/USD via CoinGecko (real) o valores fijos (mock).
 * Caché en memoria ~5 minutos para no saturar la API gratuita.
 */

import { getFeatureFlags } from '../feature-flags';

const CACHE_TTL_MS = 5 * 60 * 1000;

const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,rootstock,tether&vs_currencies=usd';

export interface PriceQuote {
  price: number;
  isMock: boolean;
}

export interface IPriceOracle {
  getBtcUsdPrice(): Promise<PriceQuote>;
  getDocUsdPrice(): Promise<PriceQuote>;
}

type CachedPrices = { btc: number; doc: number; fetchedAt: number };

let priceCache: CachedPrices | null = null;

function readCache(): CachedPrices | null {
  if (!priceCache) return null;
  if (Date.now() - priceCache.fetchedAt > CACHE_TTL_MS) {
    priceCache = null;
    return null;
  }
  return priceCache;
}

function writeCache(btc: number, doc: number): void {
  priceCache = { btc, doc, fetchedAt: Date.now() };
}

/** Respuesta mínima de CoinGecko para los ids solicitados */
interface CoinGeckoSimplePrice {
  bitcoin?: { usd?: number };
  rootstock?: { usd?: number };
  tether?: { usd?: number };
}

async function fetchCoinGeckoPrices(): Promise<{ btc: number; doc: number }> {
  const res = await fetch(COINGECKO_URL);
  if (!res.ok) {
    throw new Error(`CoinGecko HTTP ${res.status}`);
  }
  const data = (await res.json()) as CoinGeckoSimplePrice;
  const btc = data.bitcoin?.usd ?? data.rootstock?.usd;
  if (btc === undefined || Number.isNaN(btc)) {
    throw new Error('CoinGecko: missing bitcoin/rootstock USD price');
  }
  // DOC sigue al dólar; usamos USDT como proxy de 1 USD en oráculo spot
  const doc = data.tether?.usd ?? 1;
  return { btc, doc };
}

export class RealPriceOracle implements IPriceOracle {
  async getBtcUsdPrice(): Promise<PriceQuote> {
    const cached = readCache();
    if (cached) {
      return { price: cached.btc, isMock: false };
    }
    const { btc, doc } = await fetchCoinGeckoPrices();
    writeCache(btc, doc);
    return { price: btc, isMock: false };
  }

  async getDocUsdPrice(): Promise<PriceQuote> {
    const cached = readCache();
    if (cached) {
      return { price: cached.doc, isMock: false };
    }
    const { btc, doc } = await fetchCoinGeckoPrices();
    writeCache(btc, doc);
    return { price: doc, isMock: false };
  }
}

export class MockPriceOracle implements IPriceOracle {
  async getBtcUsdPrice(): Promise<PriceQuote> {
    return { price: 65_000, isMock: true };
  }

  async getDocUsdPrice(): Promise<PriceQuote> {
    return { price: 1, isMock: true };
  }
}

/**
 * Factory según feature flag `enableRealPriceOracle`.
 * Incluye bitcoin + rootstock + tether en la misma petición (DOC ≈ USD).
 */
export function createPriceOracle(): IPriceOracle {
  const { enableRealPriceOracle } = getFeatureFlags();
  return enableRealPriceOracle ? new RealPriceOracle() : new MockPriceOracle();
}
