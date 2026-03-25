/**
 * Tipos del agente de IA para interpretar intenciones, planificar y comunicar con el usuario.
 */

/** Intenciones reconocidas a partir del mensaje natural del usuario. */
export enum IntentType {
  DEPOSIT = 'DEPOSIT',
  CONVERT_TO_DOC = 'CONVERT_TO_DOC',
  SUPPLY_TROPYKUS = 'SUPPLY_TROPYKUS',
  SCHEDULE_REMITTANCE = 'SCHEDULE_REMITTANCE',
  EXECUTE_STRATEGY = 'EXECUTE_STRATEGY',
  CHECK_BALANCE = 'CHECK_BALANCE',
  CHECK_YIELD = 'CHECK_YIELD',
  CANCEL_REMITTANCE = 'CANCEL_REMITTANCE',
  EXECUTE_REMITTANCE = 'EXECUTE_REMITTANCE',
  GENERAL_QUESTION = 'GENERAL_QUESTION',
}

/** Resultado del análisis de lenguaje natural antes de construir un plan. */
export interface ParsedIntent {
  /** Tipo de intención detectada. */
  type: IntentType;
  /** Cantidad mencionada, si aplica. */
  amount?: string;
  /** Activo (p. ej. RBTC, DOC), si se identificó. */
  asset?: string;
  /** Dirección de destino para remesas u operaciones similares. */
  recipientAddress?: string;
  /** Día del mes para remesas recurrentes (1–31). */
  dayOfMonth?: number;
  /** Texto original del usuario. */
  rawMessage: string;
  /** Confianza del modelo en la clasificación (0–1 o escala acordada). */
  confidence: number;
}

/** Estado de un paso dentro del plan de ejecución. */
export type PlanStepStatus =
  | 'pending'
  | 'executing'
  | 'completed'
  | 'failed'
  | 'skipped';

/**
 * Un paso atómico del plan (p. ej. swap, supply, firma).
 * La descripción va en español para mostrarla en la UI.
 */
export interface PlanStep {
  id: string;
  order: number;
  /** Identificador o nombre técnico de la acción (p. ej. `swap_rbtc_doc`). */
  action: string;
  /** Texto legible en español para el usuario. */
  description: string;
  /** Valor estimado del paso en la moneda de referencia del plan, si aplica. */
  estimatedValue?: number;
  status: PlanStepStatus;
  txHash?: string;
  error?: string;
}

/**
 * Plan completo generado por el agente: pasos, riesgos, advertencias y totales estimados.
 */
export interface ExecutionPlan {
  id: string;
  intent: ParsedIntent;
  /** Resumen breve en español del objetivo del plan. */
  summary: string;
  steps: PlanStep[];
  /** Valor total estimado en USD (o stable de referencia). */
  estimatedTotalUsd: number;
  estimatedApy?: number;
  warnings: string[];
  risks: string[];
  /** Si es true, la UI debe pedir confirmación explícita antes de ejecutar on-chain. */
  requiresConfirmation: boolean;
  status: 'draft' | 'confirmed' | 'executing' | 'completed' | 'failed';
  createdAt: string;
  confirmedAt?: string;
  executedAt?: string;
}

export type AgentMessageRole = 'user' | 'assistant' | 'system';

/**
 * Mensaje en el hilo de conversación con el agente; puede adjuntar un plan propuesto.
 */
export interface AgentMessage {
  id: string;
  role: AgentMessageRole;
  content: string;
  plan?: ExecutionPlan;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/** Advertencia estructurada con severidad para la UI o logs. */
export interface Warning {
  code: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

/** Cifra estimada o mostrada (p. ej. APY, balance) con indicador mock vs datos reales. */
export interface Estimate {
  label: string;
  value: number;
  unit: string;
  /** `true` si proviene de datos simulados o cache de demostración. */
  isReal: boolean;
}
