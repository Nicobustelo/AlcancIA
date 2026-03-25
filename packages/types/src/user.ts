/**
 * Usuario conectado por wallet y preferencias de moneda local.
 */

export type LocalCurrency = 'USD' | 'ARS' | 'PEN' | 'MXN';

/** Perfil mínimo del usuario en el sistema. */
export interface User {
  id: string;
  walletAddress: string;
  localCurrency: LocalCurrency;
  displayName?: string;
  createdAt: string;
  updatedAt: string;
}

/** Ajustes editables (moneda, tipo de cambio cacheado, nombre visible). */
export interface UserSettings {
  localCurrency: LocalCurrency;
  localCurrencyRate: number;
  displayName?: string;
}
