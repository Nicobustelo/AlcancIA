/**
 * Factoría de clientes viem para interactuar con Rootstock.
 * Provee un client público (lectura) y helpers para crear wallet clients (escritura).
 */
import { createPublicClient, http, type PublicClient, type Chain } from 'viem';
import { rootstockTestnet, rootstockMainnet } from '../config/chains';

let _publicClient: PublicClient | null = null;

/** Obtiene el chain activo según NEXT_PUBLIC_CHAIN_ID (default: 31 = testnet) */
export function getActiveChain(): Chain {
  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || '31');
  return chainId === 30 ? rootstockMainnet : rootstockTestnet;
}

/** Client público (lectura) — singleton */
export function getPublicClient(): PublicClient {
  if (!_publicClient) {
    const chain = getActiveChain();
    _publicClient = createPublicClient({
      chain,
      transport: http(chain.rpcUrls.default.http[0]),
    });
  }
  return _publicClient;
}

/** Resetea el singleton (útil para tests) */
export function resetPublicClient(): void {
  _publicClient = null;
}
