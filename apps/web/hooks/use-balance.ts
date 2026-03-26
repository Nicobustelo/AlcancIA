'use client';

import { useAccount, useBalance as useWagmiBalance } from 'wagmi';

/** Hook para leer el balance RBTC nativo del usuario */
export function useBalance() {
  const { address } = useAccount();
  const { data, isLoading, error, refetch } = useWagmiBalance({
    address,
  });

  return {
    balance: data,
    formatted: data ? data.formatted : '0',
    symbol: data ? data.symbol : 'RBTC',
    isLoading,
    error,
    refetch,
  };
}
