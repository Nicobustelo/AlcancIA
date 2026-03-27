import type { Abi } from 'viem';

import ERC20 from './ERC20.json';
import RemittanceScheduler from './RemittanceScheduler.json';
import StrategyExecutor from './StrategyExecutor.json';
import VaultManager from './VaultManager.json';

/** ABI tipado para VaultManager (AlcancIA) */
export const VaultManagerABI = VaultManager as Abi;
/** ABI tipado para StrategyExecutor */
export const StrategyExecutorABI = StrategyExecutor as Abi;
/** ABI tipado para RemittanceScheduler */
export const RemittanceSchedulerABI = RemittanceScheduler as Abi;
/** ABI estándar ERC-20 */
export const ERC20ABI = ERC20 as Abi;
