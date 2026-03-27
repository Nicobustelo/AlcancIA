/**
 * Tipos de cadena, tokens y resultados de transacciones para Rootstock (mainnet/testnet)
 * y protocolos Money on Chain / Tropykus.
 */

/** Rootstock mainnet (30) o testnet (31). */
export type SupportedChainId = 30 | 31;

/** Configuración de red para clientes RPC y enlaces al explorador. */
export interface ChainConfig {
  id: SupportedChainId;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  isTestnet: boolean;
}

export type TokenSymbol = 'RBTC' | 'DOC' | 'kDOC';

/** Metadatos de un token soportado por la plataforma. */
export interface TokenInfo {
  symbol: TokenSymbol;
  name: string;
  decimals: number;
  address?: string;
  /** RBTC es nativo; DOC/kDOC suelen ser ERC-20. */
  isNative: boolean;
}

export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

/** Resultado de una transacción enviada o simulada. */
export interface TransactionResult {
  success: boolean;
  txHash?: string;
  blockNumber?: number;
  error?: string;
  /** `true` si no se envió a la red (modo demo o dry-run). */
  isMock: boolean;
}

/**
 * Direcciones de contratos propios y de protocolos externos usados por AlcancIA.
 * Los campos opcionales permiten entornos parcialmente configurados.
 */
export interface ProtocolAddresses {
  vaultManager: string;
  strategyExecutor: string;
  remittanceScheduler: string;
  mocContract?: string;
  mocDocToken?: string;
  mocVendors?: string;
  tropykusKDoc?: string;
  tropykusComptroller?: string;
}

/** Posición agregada del usuario on-chain y en Tropykus. */
export interface UserPosition {
  rbtcBalance: string;
  docBalance: string;
  rbtcValueUsd: number;
  docValueUsd: number;
  totalValueUsd: number;
  tropykusSupplied: string;
  tropykusYield: string;
  lastUpdated: string;
}

/** Resultado de ejecutar la estrategia RBTC→DOC→supply en Tropykus. */
export interface StrategyResult {
  docMinted: string;
  docSupplied: string;
  apy: number;
  txHashes: string[];
  isMock: boolean;
}
