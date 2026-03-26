'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface RemittanceRecord {
  id: string;
  destinatario: string;
  montoUsd: number;
  frecuencia: string;
  proximaEjecucion: string;
  estado: string;
  creado: string;
}

async function fetchRemittances(): Promise<RemittanceRecord[]> {
  const res = await fetch('/api/remittances');
  if (!res.ok) throw new Error('Error al cargar remesas');
  const data = await res.json();
  return data.items;
}

async function createRemittance(input: {
  destinatario: string;
  montoUsd: number;
  frecuencia: string;
  proximaEjecucion: string;
}) {
  const res = await fetch('/api/remittances', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, estado: 'programada' }),
  });
  if (!res.ok) throw new Error('Error al crear remesa');
  return res.json();
}

async function updateRemittance(id: string, action: 'cancel' | 'execute') {
  const res = await fetch(`/api/remittances/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error('Error al actualizar remesa');
  return res.json();
}

/** Hook TanStack Query para remesas */
export function useRemittances() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['remittances'],
    queryFn: fetchRemittances,
    staleTime: 10_000,
  });

  const createMutation = useMutation({
    mutationFn: createRemittance,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['remittances'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'cancel' | 'execute' }) =>
      updateRemittance(id, action),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['remittances'] }),
  });

  return {
    remittances: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    update: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
