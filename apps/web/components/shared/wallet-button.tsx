'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/**
 * Conecta la wallet vía wagmi (injected). Si en el futuro se integra AppKit,
 * se puede reemplazar por `useAppKit()` manteniendo la misma UI.
 */
export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const injected = connectors.find((c) => c.id === 'injected' || c.type === 'injected');

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden rounded-md border border-border bg-muted/50 px-3 py-1.5 font-mono text-xs sm:inline-block">
          {shortenAddress(address)}
        </span>
        <Button type="button" variant="outline" size="sm" onClick={() => disconnect()}>
          Desconectar
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (injected) connect({ connector: injected });
        else connect({ connector: connectors[0] });
      }}
    >
      {isPending ? 'Conectando…' : 'Conectar wallet'}
    </Button>
  );
}
