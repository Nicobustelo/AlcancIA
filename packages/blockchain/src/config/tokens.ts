export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  address?: string;
  isNative: boolean;
  logoUrl?: string;
}

export const TOKENS: Record<string, TokenInfo> = {
  RBTC: {
    symbol: 'RBTC',
    name: 'Smart Bitcoin',
    decimals: 18,
    isNative: true,
  },
  DOC: {
    symbol: 'DOC',
    name: 'Dollar on Chain',
    decimals: 18,
    isNative: false,
  },
  kDOC: {
    symbol: 'kDOC',
    name: 'Tropykus DOC',
    decimals: 18,
    isNative: false,
  },
};
