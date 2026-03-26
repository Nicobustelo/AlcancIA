'use client';

import { useQuery } from '@tanstack/react-query';

interface ActivityItem {
  id: string;
  tipo: string;
  monto: string;
  activo: string;
  estado: string;
  fecha: string;
  hash?: string;
  explorerUrl?: string;
}

async function fetchActivity(): Promise<ActivityItem[]> {
  const res = await fetch('/api/activity');
  if (!res.ok) throw new Error('Error al cargar actividad');
  const data: {
    items: Array<{
      id: string;
      tipo: string;
      monto: string;
      asset: string;
      estado: string;
      fecha: string;
      txHash?: string | null;
      explorerUrl?: string;
    }>;
  } = await res.json();
  return data.items.map((item) => ({
    id: item.id,
    tipo: item.tipo,
    monto: item.monto,
    activo: item.asset,
    estado: item.estado,
    fecha: item.fecha,
    hash: item.txHash ?? undefined,
    explorerUrl: item.explorerUrl,
  }));
}

/** Hook TanStack Query para historial de actividad */
export function useActivity() {
  return useQuery({
    queryKey: ['activity'],
    queryFn: fetchActivity,
    staleTime: 30_000,
  });
}
