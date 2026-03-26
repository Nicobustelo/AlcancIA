import { z } from 'zod';

export const GetWalletBalanceInput = z.object({
  walletAddress: z.string().describe('Dirección de wallet del usuario'),
});

export const GetRbtcPriceInput = z.object({});

export const EstimateDocOutputInput = z.object({
  rbtcAmount: z.string().describe('Cantidad de RBTC a convertir (en formato legible, ej: "0.01")'),
});

export const GetTropykusApyInput = z.object({});

export const GetPortfolioStatusInput = z.object({
  walletAddress: z.string().describe('Dirección de wallet del usuario'),
});

export const BuildExecutionPlanInput = z.object({
  intent: z.string().describe('Intención del usuario en lenguaje natural'),
  walletAddress: z.string().describe('Dirección de wallet'),
  amount: z.string().optional().describe('Monto si se especificó'),
  asset: z.string().optional().describe('Activo si se especificó'),
  recipientAddress: z.string().optional().describe('Dirección de destinatario para remesa'),
  dayOfMonth: z.number().optional().describe('Día del mes para remesa'),
});

export const ScheduleRemittanceInput = z.object({
  recipientAddress: z.string(),
  amountUsd: z.number(),
  dayOfMonth: z.number().min(1).max(28),
});

export const ExecuteStrategyInput = z.object({
  rbtcAmount: z.string(),
  walletAddress: z.string(),
});

export const ExecuteRemittanceInput = z.object({
  remittanceId: z.string(),
});

export const GetTransactionStatusInput = z.object({
  txHash: z.string(),
});

export type GetWalletBalanceInputType = z.infer<typeof GetWalletBalanceInput>;
export type EstimateDocOutputInputType = z.infer<typeof EstimateDocOutputInput>;
export type BuildExecutionPlanInputType = z.infer<typeof BuildExecutionPlanInput>;
export type ScheduleRemittanceInputType = z.infer<typeof ScheduleRemittanceInput>;
export type ExecuteStrategyInputType = z.infer<typeof ExecuteStrategyInput>;
export type ExecuteRemittanceInputType = z.infer<typeof ExecuteRemittanceInput>;
export type GetTransactionStatusInputType = z.infer<typeof GetTransactionStatusInput>;
