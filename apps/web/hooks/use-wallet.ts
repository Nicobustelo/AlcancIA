'use client';

import { useAccount, useChainId, useDisconnect, useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

/** Hook de conveniencia para estado de wallet */
export function useWallet() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();
  const { connect } = useConnect();

  const isRskTestnet = chainId === 31;
  const isRskMainnet = chainId === 30;
  const isCorrectNetwork = isRskTestnet || isRskMainnet;

  const shortenedAddress = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : null;

  const connectWallet = () => {
    connect({ connector: injected() });
  };

  return {
    address,
    isConnected,
    isConnecting: isConnecting || isReconnecting,
    chainId,
    isRskTestnet,
    isRskMainnet,
    isCorrectNetwork,
    shortenedAddress,
    connectWallet,
    disconnect,
  };
}
