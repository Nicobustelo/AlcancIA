'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useAccount, useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';
import type { ExecutionPlan } from '@beexo/types';
import { Send, Sparkles } from 'lucide-react';
import { QUICK_PROMPTS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MockIndicator } from '@/components/shared/mock-indicator';
import type { ChatApiSuccess } from '@/app/api/chat/route';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  plan?: ExecutionPlan;
  planConfirmed?: boolean;
  source?: 'openai' | 'mock';
};

function PlanCard({
  plan,
  confirmed,
  loading,
  onConfirm,
}: {
  plan: ExecutionPlan;
  confirmed: boolean;
  loading?: boolean;
  onConfirm: () => void;
}) {
  // Acortamos la dirección solo para mostrarla en la UI
  const displaySummary = plan.summary.replace(
    /(0x[a-fA-F0-9]{40})/,
    (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`,
  );

  return (
    <Card className="mt-3 max-w-md border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-emerald-500/5">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">Plan de Ejecución</CardTitle>
          <Badge variant="outline">
            {plan.status === 'draft' ? 'Pendiente de Firma' : plan.status}
          </Badge>
          {plan.estimatedApy != null ? (
            <Badge variant="secondary">APY ~{plan.estimatedApy}%</Badge>
          ) : null}
        </div>
        <CardDescription>{displaySummary}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ol className="list-decimal space-y-2 pl-4 text-sm">
          {plan.steps.map((s) => (
            <li key={s.id}>
              <span className="font-medium">{s.description}</span>
              {s.estimatedValue != null ? (
                <span className="text-muted-foreground">
                  {' '}
                  — valor est. {s.estimatedValue} tRBTC
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </CardContent>
      {plan.requiresConfirmation ? (
        <CardFooter className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={confirmed || loading}
            onClick={onConfirm}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {loading
              ? 'Firmando en Wallet...'
              : confirmed
                ? 'Transacción Confirmada en Bloque'
                : 'Firmar y Enviar a Rootstock'}
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}

export default function ChatPage() {
  const { address } = useAccount();
  const {
    sendTransaction,
    data: txData,
    isPending: txLoading,
    isSuccess: txSuccess,
    error: txError,
  } = useSendTransaction();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '¡Hola! Soy tu asistente financiero de Beexo AgentYield. Elegí una sugerencia o escribí qué querés hacer con tus fondos en Rootstock.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Efecto para marcar el último plan como confirmado cuando la TX de la wallet es exitosa
  useEffect(() => {
    if (txSuccess && txData) {
      setMessages((m) =>
        m.map((msg, index) => (index === m.length - 1 ? { ...msg, planConfirmed: true } : msg)),
      );
    }
  }, [txSuccess, txData]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    const history = [...messages, userMsg]
      .filter((m) => m.id !== 'welcome')
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          walletAddress: address,
          history: history.slice(0, -1),
        }),
      });
      const data = (await res.json()) as ChatApiSuccess & { error?: unknown };
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Error');
      }
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.content,
        plan: data.plan,
        planConfirmed: false,
      };
      setMessages((m) => [...m, assistantMsg]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `e-${Date.now()}`,
          role: 'assistant',
          content:
            'Hubo un problema de conexión con la red de Rootstock. Por favor, reintenta en unos segundos.',
        },
      ]);
    } finally {
      setLoading(false);
      requestAnimationFrame(scrollToBottom);
    }
  };

  const confirmPlan = async (id: string, plan: ExecutionPlan) => {
    // Si es una transferencia (intención de remesa/envío)
    const transferStep = plan.steps.find((s) => s.action === 'execute_transfer');

    if (transferStep) {
      // Intentar extraer la dirección de la descripción (donde la pusimos en el mock)
      const addressMatch = plan.summary.match(/0x[a-fA-F0-9]{40}/);
      const destAddress = addressMatch ? addressMatch[0] : null;
      const amount = transferStep.estimatedValue ? String(transferStep.estimatedValue) : '0.005';

      if (destAddress) {
        try {
          sendTransaction({
            to: destAddress as `0x${string}`,
            value: parseEther(amount),
          });
          return; // El useEffect manejará la confirmación visual
        } catch (e) {
          console.error('Error al enviar transacción', e);
        }
      }
    }

    // Fallback para otros planes o si falla la extracción
    setMessages((m) =>
      m.map((msg) => (msg.id === id ? { ...msg, planConfirmed: true, plan: msg.plan } : msg)),
    );
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Asistente Inteligente</h1>
          <p className="text-sm text-muted-foreground">
            Gestión de inversiones y remesas mediante procesamiento de lenguaje natural.
          </p>
        </div>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden border-border/80 shadow-md">
        <CardHeader className="border-b border-border/60 py-4">
          <CardTitle className="flex items-center gap-2 text-lg text-violet-700">
            <Sparkles className="size-5" />
            Beexo AgentYield
          </CardTitle>
          <CardDescription>
            Optimización de rendimiento en Rootstock mediante inteligencia artificial.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4 p-0">
          <div className="px-4 pt-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Sugerencias de operación
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((p) => (
                <Button
                  key={p.label}
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="rounded-full bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/20"
                  disabled={loading}
                  onClick={() => void sendMessage(p.message)}
                >
                  <span className="mr-1.5" aria-hidden>
                    {p.icon}
                  </span>
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
          <Separator />
          <ScrollArea
            className="min-h-[420px] flex-1 px-4 pb-4"
            maxHeightClassName="max-h-[min(60vh,520px)]"
          >
            <div className="space-y-4 py-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm',
                      msg.role === 'user'
                        ? 'rounded-br-md bg-violet-700 text-white'
                        : 'rounded-bl-md border border-border bg-card text-card-foreground',
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.role === 'assistant' && msg.plan ? (
                      <PlanCard
                        plan={msg.plan}
                        confirmed={msg.planConfirmed ?? false}
                        loading={txLoading && msg.id === messages[messages.length - 1].id}
                        onConfirm={() => confirmPlan(msg.id, msg.plan!)}
                      />
                    ) : null}
                  </div>
                </div>
              ))}
              {loading ? (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                    <span className="flex gap-1">
                      <span className="size-2 animate-bounce rounded-full bg-violet-500 [animation-delay:-0.3s]" />
                      <span className="size-2 animate-bounce rounded-full bg-violet-500 [animation-delay:-0.15s]" />
                      <span className="size-2 animate-bounce rounded-full bg-violet-500" />
                    </span>
                    El agente está escribiendo…
                  </div>
                </div>
              ) : null}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>
          <div className="border-t border-border/60 p-4">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void sendMessage(input);
              }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribí tu mensaje…"
                disabled={loading}
                className="flex-1"
                autoComplete="off"
              />
              <Button type="submit" disabled={loading || !input.trim()}>
                <Send className="size-4" />
                <span className="sr-only">Enviar</span>
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
