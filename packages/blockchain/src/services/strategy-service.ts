/**
 * Servicio tipado para interactuar con StrategyExecutor.sol
 */
import { type Address, formatEther, parseEther } from 'viem';
import { getPublicClient } from '../clients/viem-client';
import { getAddresses } from '../config/addresses';
import { StrategyExecutorABI } from '../abis';

function abi() {
  return StrategyExecutorABI;
}

function address(): Address {
  const addrs = getAddresses(Number(process.env.NEXT_PUBLIC_CHAIN_ID || '31'));
  return addrs.strategyExecutor as Address;
}

/** Estima cuántos DOC se obtendrían al convertir cierta cantidad de RBTC */
export async function estimateDocOutput(rbtcAmount: string) {
  const client = getPublicClient();
  const addr = address();
  if (!addr) return null;

  try {
    const result = await client.readContract({
      address: addr,
      abi: abi(),
      functionName: 'estimateDocOutput',
      args: [parseEther(rbtcAmount)],
    });
    return { estimatedDoc: formatEther(result as bigint) };
  } catch {
    return null;
  }
}

/** Obtiene el APY actual (devuelve con 2 decimales, ej: 550 = 5.50%) */
export async function getCurrentApy() {
  const client = getPublicClient();
  const addr = address();
  if (!addr) return null;

  try {
    const result = await client.readContract({
      address: addr,
      abi: abi(),
      functionName: 'getCurrentApy',
      args: [],
    });
    return { apyBps: Number(result as bigint), apyPercent: Number(result as bigint) / 100 };
  } catch {
    return null;
  }
}

/** Prepara tx para ejecutar estrategia completa (RBTC → DOC → Tropykus) */
export function prepareExecuteStrategy(rbtcAmount: string, userAddress: Address) {
  return {
    address: address(),
    abi: abi(),
    functionName: 'executeStrategy' as const,
    args: [parseEther(rbtcAmount), userAddress],
    value: parseEther(rbtcAmount),
  };
}

/** Consulta si el modo fallback está activo */
export async function isFallbackMode() {
  const client = getPublicClient();
  const addr = address();
  if (!addr) return null;

  try {
    const result = await client.readContract({
      address: addr,
      abi: abi(),
      functionName: 'useFallbackMode',
      args: [],
    });
    return result as boolean;
  } catch {
    return null;
  }
}
