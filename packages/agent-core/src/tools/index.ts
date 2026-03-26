import { getRbtcPriceTool } from './get-rbtc-price';
import { getTropykusApyTool } from './get-tropykus-apy';
import { estimateDocOutputTool } from './estimate-doc-output';
import { getWalletBalanceTool } from './get-wallet-balance';
import { getPortfolioStatusTool } from './get-portfolio-status';
import { buildExecutionPlanTool } from './build-execution-plan';
import { scheduleRemittanceTool } from './schedule-remittance';
import { executeStrategyTool } from './execute-strategy';
import { executeRemittanceTool } from './execute-remittance';
import { getTransactionStatusTool } from './get-transaction-status';

export const allTools = [
  getRbtcPriceTool,
  getTropykusApyTool,
  estimateDocOutputTool,
  getWalletBalanceTool,
  getPortfolioStatusTool,
  buildExecutionPlanTool,
  scheduleRemittanceTool,
  executeStrategyTool,
  executeRemittanceTool,
  getTransactionStatusTool,
];

export { getRbtcPriceTool } from './get-rbtc-price';
export { getTropykusApyTool } from './get-tropykus-apy';
export { estimateDocOutputTool } from './estimate-doc-output';
export { getWalletBalanceTool } from './get-wallet-balance';
export { getPortfolioStatusTool } from './get-portfolio-status';
export { buildExecutionPlanTool } from './build-execution-plan';
export { scheduleRemittanceTool } from './schedule-remittance';
export { executeStrategyTool } from './execute-strategy';
export { executeRemittanceTool } from './execute-remittance';
export { getTransactionStatusTool } from './get-transaction-status';
