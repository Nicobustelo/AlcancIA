'use client';

import { useCallback, useRef, useState } from 'react';
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
  onConfirm,
}: {
  plan: ExecutionPlan;
  confirmed: boolean;
  onConfirm: () => void;
}) {
  return (
    <Card className="mt-3 max-w-md border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-emerald-500/5">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">Plan propuesto</CardTitle>
          <Badge variant="outline">{plan.status === 'draft' ? 'Borrador' : plan.status}</Badge>
          {plan.estimatedApy != null ? (
            <Badge variant="secondary">APY ~{plan.estimatedApy}%</Badge>
          ) : null}
        </div>
        <CardDescription>{plan.summary}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ol className="list-decimal space-y-2 pl-4 text-sm">
          {plan.steps.map((s) => (
            <li key={s.id}>
              <span className="font-medium">{s.description}</span>
              {s.estimatedValue != null ? (
                <span className="text-muted-foreground"> — val. est. {s.estimatedValue}</span>
              ) : null}
            </li>
          ))}
        </ol>
        {plan.warnings.length > 0 ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-950 dark:text-amber-100">
            <p className="font-semibold">Advertencias</p>
            <ul className="mt-1 list-disc pl-4">
              {plan.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
      {plan.requiresConfirmation ? (
        <CardFooter className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={confirmed}
            onClick={onConfirm}
          >
            {confirmed ? 'Plan confirmado' : 'Confirmar plan'}
          </Button>
          <span className="text-xs text-muted-foreground">
            En demo no se ejecutan transacciones reales.
          </span>
        </CardFooter>
      ) : null}
    </Card>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '¡Hola! Soy tu asistente de Beexo AgentYield. Elegí una sugerencia o escribí qué querés hacer con tu dinero en Rootstock.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSource, setLastSource] = useState<'openai' | 'mock' | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

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
    setLastSource(null);

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
          history: history.slice(0, -1),
        }),
      });
      const data = (await res.json()) as ChatApiSuccess & { error?: unknown };
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Error');
      }
      setLastSource(data.source);
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.content,
        plan: data.plan,
        planConfirmed: false,
        source: data.source,
      };
      setMessages((m) => [...m, assistantMsg]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `e-${Date.now()}`,
          role: 'assistant',
          content:
            'Hubo un error al contactar al servidor. Probá de nuevo en unos segundos.',
        },
      ]);
    } finally {
      setLoading(false);
      requestAnimationFrame(scrollToBottom);
    }
  };

  const confirmPlan = (id: string) => {
    setMessages((m) =>
      m.map((msg) =>
        msg.id === id ? { ...msg, planConfirmed: true, plan: msg.plan } : msg,
      ),
    );
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chat con el agente</h1>
          <p className="text-sm text-muted-foreground">
            Pedí inversiones, remesas o consultas en lenguaje natural.
          </p>
        </div>
        {lastSource === 'mock' ? <MockIndicator /> : null}
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden border-border/80 shadow-md">
        <CardHeader className="border-b border-border/60 py-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="size-5 text-violet-600" />
            Asistente IA
          </CardTitle>
          <CardDescription>
            Conectado a la API interna de la demo (OpenAI si hay clave configurada).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4 p-0">
          <div className="px-4 pt-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Sugerencias rápidas
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((p) => (
                <Button
                  key={p.label}
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="rounded-full"
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
          <ScrollArea className="min-h-[420px] flex-1 px-4 pb-4" maxHeightClassName="max-h-[min(60vh,520px)]">
            <div className="space-y-4 py-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex',
                    msg.role === 'user' ? 'justify-end' : 'justify-start',
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm',
                      msg.role === 'user'
                        ? 'rounded-br-md bg-primary text-primary-foreground'
                        : 'rounded-bl-md border border-border bg-card text-card-foreground',
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.role === 'assistant' && msg.source ? (
                      <p className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                        Fuente: {msg.source === 'openai' ? 'OpenAI' : 'Simulado'}
                      </p>
                    ) : null}
                    {msg.role === 'assistant' && msg.plan ? (
                      <PlanCard
                        plan={msg.plan}
                        confirmed={msg.planConfirmed ?? false}
                        onConfirm={() => confirmPlan(msg.id)}
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
