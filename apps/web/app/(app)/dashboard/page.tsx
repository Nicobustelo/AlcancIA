'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, PiggyBank, Repeat, TrendingUp } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MockIndicator } from '@/components/shared/mock-indicator';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

type DashboardPayload = {
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
};

function fmt(n: number, maxFrac = 4) {
  return new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: maxFrac,
  }).format(n);
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) throw new Error('Error al cargar');
        const j = (await res.json()) as DashboardPayload;
        if (!cancelled) setData(j);
      } catch {
        if (!cancelled) setErr('No se pudo cargar el dashboard.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (err) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm">
        {err}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <LoadingSpinner label="Cargando dashboard" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const anyMock =
    data.balances.rbtc.mock ||
    data.yield.mock ||
    data.nextRemittance.mock;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Vista general de balances, rendimiento y actividad reciente.
          </p>
        </div>
        {anyMock ? <MockIndicator /> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>RBTC</CardDescription>
            <CardTitle className="text-2xl font-mono">
              {fmt(data.balances.rbtc.value)} {data.balances.rbtc.unit}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.balances.rbtc.mock ? <MockIndicator className="text-[10px]" /> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>DOC</CardDescription>
            <CardTitle className="text-2xl font-mono">
              {fmt(data.balances.doc.value, 2)} {data.balances.doc.unit}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.balances.doc.mock ? <MockIndicator className="text-[10px]" /> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>USD (ref.)</CardDescription>
            <CardTitle className="text-2xl font-mono">
              US$ {fmt(data.balances.usd.value, 2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.balances.usd.mock ? <MockIndicator className="text-[10px]" /> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Moneda local</CardDescription>
            <CardTitle className="text-2xl font-mono">
              {fmt(data.balances.local.value, 0)} {data.balances.local.unit}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.balances.local.mock ? <MockIndicator className="text-[10px]" /> : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="size-5 text-emerald-600" />
              <CardTitle>Rendimiento</CardTitle>
            </div>
            <CardDescription>Estimaciones de la demo (no son garantías).</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">APY indicativo</p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {data.yield.apyPercent}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Yield acumulado (USD)</p>
              <p className="text-xl font-semibold">US$ {fmt(data.yield.accruedUsd, 2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Est. mensual</p>
              <p className="font-medium">US$ {fmt(data.yield.estimatedMonthlyUsd, 2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Est. anual</p>
              <p className="font-medium">US$ {fmt(data.yield.estimatedYearlyUsd, 2)}</p>
            </div>
          </CardContent>
          {data.yield.mock ? (
            <CardContent className="pt-0">
              <MockIndicator />
            </CardContent>
          ) : null}
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Repeat className="size-5 text-violet-600" />
              <CardTitle>Próxima remesa</CardTitle>
            </div>
            <CardDescription>Recordatorio de envío programado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-lg font-semibold">{data.nextRemittance.destinatario}</p>
            <p className="text-muted-foreground">
              Monto: <span className="font-mono">US$ {data.nextRemittance.montoUsd}</span>
            </p>
            <p className="text-muted-foreground">
              Fecha: <span className="font-mono">{data.nextRemittance.fecha}</span>
            </p>
            <Badge variant="secondary">{data.nextRemittance.estado}</Badge>
            {data.nextRemittance.mock ? (
              <div className="pt-2">
                <MockIndicator />
              </div>
            ) : null}
          </CardContent>
          <CardContent className="pt-0">
            <Link
              href="/remesas"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'inline-flex')}
            >
              Gestionar remesas
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PiggyBank className="size-5" />
            <CardTitle>Actividad reciente</CardTitle>
          </div>
          <CardDescription>Últimos movimientos (simulados).</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Tipo</th>
                <th className="pb-2 pr-4 font-medium">Monto</th>
                <th className="pb-2 pr-4 font-medium">Estado</th>
                <th className="pb-2 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {data.recentActivity.map((row) => (
                <tr key={row.id} className="border-b border-border/60">
                  <td className="py-3 pr-4">{row.tipo}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{row.monto}</td>
                  <td className="py-3 pr-4">
                    <Badge variant="outline">{row.estado}</Badge>
                  </td>
                  <td className="py-3 font-mono text-xs">{row.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
