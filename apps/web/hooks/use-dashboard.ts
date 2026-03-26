'use client';

import { useQuery } from '@tanstack/react-query';

interface DashboardData {
  balances: {
    rbtc: { value: number; unit: string; mock: boolean };
    doc: { value: number; unit: string; mock: boolean };
    usd: { value: number; unit: string; mock: boolean };
    local: { value: number; unit: string; mock: boolean };
  };
  yield: {
    apyPercent: number;
    accruedUsd: number;
    estimatedMonthlyUsd: number;
    estimatedYearlyUsd: number;
    mock: boolean;
  };
  nextRemittance: {
    destinatario: string;
    montoUsd: number;
    fecha: string;
    estado: string;
    mock: boolean;
  };
  recentActivity: Array<{
    id: string;
    tipo: string;
    monto: string;
    estado: string;
    fecha: string;
  }>;
}

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch('/api/dashboard');
  if (!res.ok) throw new Error('Error al cargar dashboard');
  return (await res.json()) as DashboardData;
}

/** Hook TanStack Query para datos del dashboard */
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    staleTime: 30_000, // 30s
    refetchInterval: 60_000, // 1min
  });
}
