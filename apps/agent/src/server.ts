import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { processMessage } from '@beexo/agent-core';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.AGENT_PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const chatSchema = z.object({
  message: z.string().min(1),
  walletAddress: z.string().min(1),
  conversationId: z.string().optional(),
  history: z
    .array(
      z.object({
        role: z.string(),
        content: z.string(),
      }),
    )
    .optional(),
});

app.post('/api/chat', async (req, res) => {
  try {
    const body = chatSchema.parse(req.body);
    const result = await processMessage(body.message, body.walletAddress, body.history ?? []);

    res.json({
      success: true,
      data: {
        content: result.content,
        conversationId: body.conversationId ?? `conv_${Date.now()}`,
        toolCalls: result.toolCalls,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.message },
      });
      return;
    }
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error procesando el mensaje. Intentá de nuevo.',
      },
    });
  }
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' },
  });
});

app.listen(Number(PORT) || 3001, () => {
  console.log(`🤖 AlcancIA Agent running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Chat:   POST http://localhost:${PORT}/api/chat`);
});
