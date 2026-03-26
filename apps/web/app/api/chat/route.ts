import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { ExecutionPlan } from '@beexo/types';
import { buildMockReply } from '@/lib/mock-chat-response';

const bodySchema = z.object({
  message: z.string().min(1, 'El mensaje no puede estar vacío'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      }),
    )
    .max(40)
    .optional(),
});

export type ChatApiSuccess = {
  content: string;
  plan?: ExecutionPlan;
  source: 'openai' | 'mock';
};

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Cuerpo JSON inválido' },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const { message, history = [] } = parsed.data;
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const { processMessage } = await import('@beexo/agent-core');
      const conversationHistory = history.map((h) => ({
        role: h.role,
        content: h.content,
      }));
      const { content } = await processMessage(
        message,
        '',
        conversationHistory,
      );
      const payload: ChatApiSuccess = {
        content,
        source: 'openai',
      };
      return NextResponse.json(payload);
    } catch (e) {
      console.error('[api/chat] OpenAI error', e);
      const fallback = buildMockReply(message);
      const payload: ChatApiSuccess = {
        ...fallback,
        source: 'mock',
      };
      return NextResponse.json(payload);
    }
  }

  const mock = buildMockReply(message);
  const payload: ChatApiSuccess = { ...mock, source: 'mock' };
  return NextResponse.json(payload);
}
