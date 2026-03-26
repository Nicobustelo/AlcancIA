'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const schema = z.object({
  moneda: z.enum(['USD', 'ARS', 'PEN', 'MXN']),
});

type FormValues = z.infer<typeof schema>;

const flags = [
  { key: 'chat_openai', label: 'Chat con OpenAI', real: 'Si hay OPENAI_API_KEY' },
  { key: 'balances', label: 'Balances en dashboard', real: 'Mock' },
  { key: 'remesas_api', label: 'Remesas POST', real: 'Memoria en servidor (demo)' },
  { key: 'onchain', label: 'Ejecución on-chain', real: 'No conectado en esta UI' },
];

export default function ConfiguracionPage() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitSuccessful },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { moneda: 'ARS' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Preferencias de visualización e información del entorno demo.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Moneda de referencia</CardTitle>
          <CardDescription>
            Elegí en qué moneda local preferís ver montos estimados en la interfaz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4 sm:flex-row sm:items-end"
            onSubmit={handleSubmit(() => undefined)}
          >
            <div className="flex-1">
              <label htmlFor="moneda" className="text-sm font-medium">
                Moneda
              </label>
              <select
                id="moneda"
                className="mt-1 flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register('moneda')}
              >
                <option value="USD">USD — Dólar estadounidense</option>
                <option value="ARS">ARS — Peso argentino</option>
                <option value="PEN">PEN — Sol peruano</option>
                <option value="MXN">MXN — Peso mexicano</option>
              </select>
            </div>
            <Button type="submit">Guardar preferencia</Button>
          </form>
          {isSubmitSuccessful ? (
            <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">
              Preferencia guardada (solo en esta sesión del formulario).
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Entorno</CardTitle>
          <CardDescription>
            Qué partes de la app usan datos reales vs simulados en esta build.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
            <p>
              <strong>Red:</strong> Rootstock Testnet (chain id 31)
            </p>
            <p className="mt-1 text-muted-foreground">
              RPC público: public-node.testnet.rsk.co · Explorador configurado vía{' '}
              <code className="rounded bg-muted px-1 text-xs">NEXT_PUBLIC_RSK_EXPLORER_TESTNET</code>
            </p>
          </div>
          <Separator />
          <ul className="space-y-3">
            {flags.map((f) => (
              <li
                key={f.key}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/80 px-3 py-2"
              >
                <span className="font-medium">{f.label}</span>
                <Badge variant="secondary">{f.real}</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature flags (demo)</CardTitle>
          <CardDescription>
            Valores estáticos para la presentación; en producción vendrían del backend.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge>agent_chat: on</Badge>
          <Badge variant="outline">tropykus_exec: off</Badge>
          <Badge variant="outline">moc_swap: off</Badge>
          <Badge variant="secondary">remittance_scheduler: mock</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
