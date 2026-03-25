/**
 * Contratos de API REST/Web: respuestas genéricas, chat del agente y dashboard.
 */

import type { AgentMessage, ExecutionPlan } from './agent';

/** Envoltorio estándar para respuestas JSON. */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

/** Petición al endpoint de chat del agente. */
export interface ChatRequest {
  message: string;
  conversationId?: string;
  walletAddress: string;
}

export interface ChatResponse {
  message: AgentMessage;
  conversationId: string;
}

export interface ConfirmPlanRequest {
  planId: string;
  walletAddress: string;
}

export interface ConfirmPlanResponse {
  plan: ExecutionPlan;
}

export interface DashboardRequest {
  walletAddress: string;
}

/** Registro de transacción para listados e historial. */
export interface TransactionRecord {
  id: string;
  type: string;
  amount: string;
  asset: string;
  txHash?: string;
  status: string;
  timestamp: string;
  explorerUrl?: string;
  isMock: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
