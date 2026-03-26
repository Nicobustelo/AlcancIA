/**
 * Servicio tipado para interactuar con VaultManager.sol
 * Lectura vía publicClient. Escritura requiere walletClient del frontend.
 */
import { type Address, formatEther, parseEther } from 'viem';
import { getPublicClient } from '../clients/viem-client';
import { getAddresses } from '../config/addresses';
import { VaultManagerABI } from '../abis';

function abi() {
  return VaultManagerABI;
}

function address(): Address {
  const addrs = getAddresses(Number(process.env.NEXT_PUBLIC_CHAIN_ID || '31'));
  return addrs.vaultManager as Address;
}

/** Obtiene la posición de un usuario en el vault */
export async function getUserPosition(userAddress: Address) {
  const client = getPublicClient();
  const addr = address();
  if (!addr) return null;

  try {
    const result = await client.readContract({
      address: addr,
      abi: abi(),
      functionName: 'getUserPosition',
      args: [userAddress],
    });
    const [rbtc, doc, tropykusShares, tropykusDeposited] = result as [bigint, bigint, bigint, bigint];
    return {
      rbtc: formatEther(rbtc),
      doc: formatEther(doc),
      tropykusShares: formatEther(tropykusShares),
      tropykusDeposited: formatEther(tropykusDeposited),
    };
  } catch {
    return null;
  }
}

/** Obtiene el yield estimado de un usuario */
export async function getEstimatedYield(userAddress: Address) {
  const client = getPublicClient();
  const addr = address();
  if (!addr) return null;

  try {
    const result = await client.readContract({
      address: addr,
      abi: abi(),
      functionName: 'getYield',
      args: [userAddress],
    });
    return { estimatedYield: formatEther(result as bigint) };
  } catch {
    return null;
  }
}

/** Prepara los datos de la transacción para depositRBTC (el usuario firma en frontend) */
export function prepareDepositRBTC(amount: string) {
  return {
    address: address(),
    abi: abi(),
    functionName: 'depositRBTC' as const,
    value: parseEther(amount),
  };
}

/** Prepara los datos de la transacción para withdrawRBTC */
export function prepareWithdrawRBTC(amount: string) {
  return {
    address: address(),
    abi: abi(),
    functionName: 'withdrawRBTC' as const,
    args: [parseEther(amount)],
  };
}
