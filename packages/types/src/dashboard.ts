/**
 * Vista agregada del panel: balances, yield, remesas y estado de protocolos.
 */

import type { TransactionRecord } from './api';

/** Balances y valoración en USD y moneda local. */
export interface BalanceInfo {
  rbtc: string;
  doc: string;
  rbtcUsd: number;
  docUsd: number;
  totalUsd: number;
  localCurrencyValue: number;
  localCurrencyCode: string;
  isMock: boolean;
}

/** Métricas de yield en Tropykus (DOC suministrado). */
export interface YieldInfo {
  suppliedDoc: string;
  currentApy: number;
  accruedYield: string;
  estimatedMonthly: number;
  estimatedYearly: number;
  isMock: boolean;
}

/** Resumen de remesas programadas e histórico. */
export interface RemittanceSummary {
  totalScheduled: number;
  nextRemittance?: {
    recipientAddress: string;
    amount: string;
    dayOfMonth: number;
    daysUntil: number;
  };
  totalSent: number;
  totalFailed: number;
}

/**
 * Instantánea completa para el dashboard: saldos, yield, remesas, txs recientes y salud de protocolos.
 */
export interface DashboardSnapshot {
  balance: BalanceInfo;
  yield: YieldInfo;
  remittances: RemittanceSummary;
  recentTransactions: TransactionRecord[];
  protocolStatus: {
    mocOnline: boolean;
    tropykusOnline: boolean;
    priceOracleOnline: boolean;
  };
  lastUpdated: string;
}
