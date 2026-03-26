/**
 * Adaptador Tropykus (kDOC / Compound fork): interfaz + real (viem) + mock.
 */

const MOCK_APY = 5.5;
const SUPPLY_DELAY_MS = 400;
const REDEEM_DELAY_MS = 400;

export interface SupplyResult {
  success: boolean;
  kDocReceived: bigint;
  txHash?: string;
  isMock: boolean;
}

export interface RedeemResult {
  success: boolean;
  docReceived: bigint;
  txHash?: string;
  isMock: boolean;
}

export interface ApyResult {
  apy: number;
  isMock: boolean;
}

export interface TropykusBalanceResult {
  kDocBalance: bigint;
  underlyingBalance: bigint;
  isMock: boolean;
}

export interface ITropykusAdapter {
  supply(docAmount: bigint): Promise<SupplyResult>;
  redeem(kDocAmount: bigint): Promise<RedeemResult>;
  getApy(): Promise<ApyResult>;
  getBalance(address: string): Promise<TropykusBalanceResult>;
}

export class RealTropykusAdapter implements ITropykusAdapter {
  /** Placeholder: llamaría a kDOC / cToken vía viem con RPC y cuenta firmada */
  async supply(_docAmount: bigint): Promise<SupplyResult> {
    throw new Error('Real Tropykus integration requires wallet client and deployed markets');
  }

  async redeem(_kDocAmount: bigint): Promise<RedeemResult> {
    throw new Error('Real Tropykus integration requires wallet client and deployed markets');
  }

  async getApy(): Promise<ApyResult> {
    throw new Error('Real Tropykus APY requires on-chain market data');
  }

  async getBalance(_address: string): Promise<TropykusBalanceResult> {
    throw new Error('Real Tropykus balance requires public client and contract reads');
  }
}

export class MockTropykusAdapter implements ITropykusAdapter {
  async supply(docAmount: bigint): Promise<SupplyResult> {
    await new Promise((r) => setTimeout(r, SUPPLY_DELAY_MS));
    return {
      success: true,
      kDocReceived: docAmount,
      txHash: `0xmock_supply_${Date.now().toString(16)}`,
      isMock: true,
    };
  }

  async redeem(kDocAmount: bigint): Promise<RedeemResult> {
    await new Promise((r) => setTimeout(r, REDEEM_DELAY_MS));
    return {
      success: true,
      docReceived: kDocAmount,
      txHash: `0xmock_redeem_${Date.now().toString(16)}`,
      isMock: true,
    };
  }

  async getApy(): Promise<ApyResult> {
    return { apy: MOCK_APY, isMock: true };
  }

  async getBalance(_address: string): Promise<TropykusBalanceResult> {
    const unit = 10n ** 18n;
    return {
      kDocBalance: 500n * unit,
      underlyingBalance: 500n * unit,
      isMock: true,
    };
  }
}

export const createTropykusAdapter = (useReal: boolean): ITropykusAdapter => {
  return useReal ? new RealTropykusAdapter() : new MockTropykusAdapter();
};
