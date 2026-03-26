'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MockIndicator } from '@/components/shared/mock-indicator';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import type { RemittanceRecord, RemittanceStatus } from '@/lib/remittance-store';

const statusVariant: Record<
  RemittanceStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  programada: 'secondary',
  ejecutada: 'default',
  fallida: 'destructive',
  cancelada: 'outline',
};

const statusLabel: Record<RemittanceStatus, string> = {
  programada: 'Programada',
  ejecutada: 'Ejecutada',
  fallida: 'Fallida',
  cancelada: 'Cancelada',
};

export default function RemesasPage() {
  const [items, setItems] = useState<RemittanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    destinatario: '',
    montoUsd: '',
    frecuencia: 'Mensual — día 1',
    proximaEjecucion: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/remittances');
      const j = (await res.json()) as { items: RemittanceRecord[] };
      setItems(j.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function crearRemesa(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const monto = Number(form.montoUsd.replace(',', '.'));
      const res = await fetch('/api/remittances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinatario: form.destinatario,
          montoUsd: monto,
          frecuencia: form.frecuencia,
          proximaEjecucion: form.proximaEjecucion,
          estado: 'programada',
        }),
      });
      if (res.ok) {
        setForm({
          destinatario: '',
          montoUsd: '',
          frecuencia: 'Mensual — día 1',
          proximaEjecucion: '',
        });
        setShowForm(false);
        await load();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Remesas</h1>
          <p className="text-sm text-muted-foreground">
            Programá envíos recurrentes a tu familia (datos de demostración).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MockIndicator label="Demo" />
          <Button type="button" onClick={() => setShowForm((v) => !v)}>
            <Plus className="mr-2 size-4" />
            Nueva remesa
          </Button>
        </div>
      </div>

      {showForm ? (
        <Card className="border-violet-500/20">
          <CardHeader>
            <CardTitle>Nueva remesa</CardTitle>
            <CardDescription>
              Se guarda en memoria en el servidor solo para esta demo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={crearRemesa}>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium" htmlFor="dest">
                  Destinatario
                </label>
                <Input
                  id="dest"
                  required
                  value={form.destinatario}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, destinatario: e.target.value }))
                  }
                  placeholder="Ej. María G. (AR)"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="monto">
                  Monto (USD)
                </label>
                <Input
                  id="monto"
                  required
                  inputMode="decimal"
                  value={form.montoUsd}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, montoUsd: e.target.value }))
                  }
                  placeholder="50"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="freq">
                  Frecuencia
                </label>
                <Input
                  id="freq"
                  value={form.frecuencia}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, frecuencia: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium" htmlFor="fecha">
                  Próxima ejecución (AAAA-MM-DD)
                </label>
                <Input
                  id="fecha"
                  required
                  value={form.proximaEjecucion}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, proximaEjecucion: e.target.value }))
                  }
                  placeholder="2025-04-01"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Guardando…' : 'Guardar'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Listado</CardTitle>
          <CardDescription>Estado de cada remesa programada.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner label="Cargando remesas" />
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay remesas cargadas.</p>
          ) : (
            <ul className="space-y-4">
              {items.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-col gap-2 rounded-xl border border-border/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold">{r.destinatario}</p>
                    <p className="text-sm text-muted-foreground">
                      US$ {r.montoUsd} · {r.frecuencia}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Próxima: {r.proximaEjecucion} · Creado: {r.creado}
                    </p>
                  </div>
                  <Badge variant={statusVariant[r.estado]}>{statusLabel[r.estado]}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
