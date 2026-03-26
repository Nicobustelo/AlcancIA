'use client';

import { useAccount, useChainId } from 'wagmi';
import { cn } from '@/lib/utils';

const RSK_TESTNET_ID = 31;

export function NetworkBadge() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const ok = isConnected && chainId === RSK_TESTNET_ID;
  const label = !isConnected
    ? 'Wallet no conectada'
    : ok
      ? 'Rootstock Testnet'
      : 'Red incorrecta';

  const neutral = !isConnected;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium',
        neutral &&
          'border-muted-foreground/30 bg-muted/50 text-muted-foreground',
        !neutral &&
          ok &&
          'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200',
        !neutral &&
          !ok &&
          'border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-200',
      )}
    >
      <span
        className={cn(
          'size-2 shrink-0 rounded-full',
          neutral && 'bg-muted-foreground/50',
          !neutral && ok && 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
          !neutral && !ok && 'bg-red-500',
        )}
        aria-hidden
      />
      {label}
    </div>
  );
}
