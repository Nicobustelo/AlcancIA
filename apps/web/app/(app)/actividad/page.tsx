'use client';

import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EXPLORER_BASE_URL } from '@/lib/constants';
import { MockIndicator } from '@/components/shared/mock-indicator';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

type ActivityRow = {
  id: string;
  tipo: string;
  monto: string;
  asset: string;
  estado: string;
  fecha: string;
  txHash: string | null;
};

export default function ActividadPage() {
  const [items, setItems] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/activity');
        const j = (await res.json()) as { items: ActivityRow[] };
        if (!cancelled) setItems(j.items);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Actividad</h1>
          <p className="text-sm text-muted-foreground">
            Historial de operaciones (simulado para la demo).
          </p>
        </div>
        <MockIndicator />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimientos</CardTitle>
          <CardDescription>
            Tipos de transacción, montos y enlaces al explorador cuando hay hash.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <LoadingSpinner label="Cargando actividad" />
          ) : (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Tipo</th>
                  <th className="pb-2 pr-4 font-medium">Monto</th>
                  <th className="pb-2 pr-4 font-medium">Activo</th>
                  <th className="pb-2 pr-4 font-medium">Estado</th>
                  <th className="pb-2 pr-4 font-medium">Fecha</th>
                  <th className="pb-2 font-medium">Tx</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.id} className="border-b border-border/60">
                    <td className="py-3 pr-4">{row.tipo}</td>
                    <td className="py-3 pr-4 font-mono">{row.monto}</td>
                    <td className="py-3 pr-4">{row.asset}</td>
                    <td className="py-3 pr-4">
                      <Badge variant="outline">{row.estado}</Badge>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs">
                      {new Date(row.fecha).toLocaleString('es-AR')}
                    </td>
                    <td className="py-3">
                      {row.txHash ? (
                        <a
                          href={`${EXPLORER_BASE_URL}/tx/${row.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                        >
                          Ver
                          <ExternalLink className="size-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
