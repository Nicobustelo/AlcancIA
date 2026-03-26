/**
 * Servicio tipado para interactuar con RemittanceScheduler.sol
 */
import { type Address, parseEther } from 'viem';
import { getPublicClient } from '../clients/viem-client';
import { getAddresses } from '../config/addresses';
import { RemittanceSchedulerABI } from '../abis';

function abi() {
  return RemittanceSchedulerABI;
}

function address(): Address {
  const addrs = getAddresses(Number(process.env.NEXT_PUBLIC_CHAIN_ID || '31'));
  return addrs.remittanceScheduler as Address;
}

/** Obtiene los IDs de remesas de un usuario */
export async function getUserRemittanceIds(userAddress: Address) {
  const client = getPublicClient();
  const addr = address();
  if (!addr) return [];

  try {
    const result = await client.readContract({
      address: addr,
      abi: abi(),
      functionName: 'getUserRemittances',
      args: [userAddress],
    });
    return (result as bigint[]).map(Number);
  } catch {
    return [];
  }
}

/** Obtiene el detalle de una remesa por ID */
export async function getRemittance(remittanceId: number) {
  const client = getPublicClient();
  const addr = address();
  if (!addr) return null;

  try {
    const result = await client.readContract({
      address: addr,
      abi: abi(),
      functionName: 'getRemittance',
      args: [BigInt(remittanceId)],
    });
    return result;
  } catch {
    return null;
  }
}

/** Prepara tx para programar una remesa */
export function prepareScheduleRemittance(
  recipient: Address,
  amountDoc: string,
  dayOfMonth: number,
) {
  return {
    address: address(),
    abi: abi(),
    functionName: 'scheduleRemittance' as const,
    args: [recipient, parseEther(amountDoc), dayOfMonth],
  };
}

/** Prepara tx para cancelar una remesa */
export function prepareCancelRemittance(remittanceId: number) {
  return {
    address: address(),
    abi: abi(),
    functionName: 'cancelRemittance' as const,
    args: [BigInt(remittanceId)],
  };
}

/** Prepara tx para ejecutar una remesa (keeper-ready) */
export function prepareExecuteRemittance(remittanceId: number) {
  return {
    address: address(),
    abi: abi(),
    functionName: 'executeRemittance' as const,
    args: [BigInt(remittanceId)],
  };
}

/** Obtiene la cantidad de remesas de un usuario */
export async function getUserRemittanceCount(userAddress: Address) {
  const client = getPublicClient();
  const addr = address();
  if (!addr) return 0;

  try {
    const result = await client.readContract({
      address: addr,
      abi: abi(),
      functionName: 'getUserRemittanceCount',
      args: [userAddress],
    });
    return Number(result as bigint);
  } catch {
    return 0;
  }
}
