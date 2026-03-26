/**
 * Adaptador Money on Chain (MoC): interfaz + implementaciones real y mock.
 * La integración real usará viem contra el contrato MoC cuando esté desplegado.
 */

export interface IMocAdapter {
  mintDoc(rbtcAmount: bigint): Promise<{
    success: boolean;
    docReceived: bigint;
    txHash?: string;
    isMock: boolean;
  }>;
  getDocBalance(address: string): Promise<bigint>;
}

export class RealMocAdapter implements IMocAdapter {
  /** En producción: lectura/escritura vía viem al contrato MoC */
  async mintDoc(_rbtcAmount: bigint): Promise<{
    success: boolean;
    docReceived: bigint;
    txHash?: string;
    isMock: boolean;
  }> {
    throw new Error('Real MoC integration requires contract deployment');
  }

  async getDocBalance(_address: string): Promise<bigint> {
    return 0n;
  }
}

export class MockMocAdapter implements IMocAdapter {
  /** Precio simulado: 1 RBTC ≈ 65_000 DOC (escala 1:1 con USD) */
  private readonly btcUsdPrice = 65_000n;

  async mintDoc(rbtcAmount: bigint): Promise<{
    success: boolean;
    docReceived: bigint;
    txHash?: string;
    isMock: boolean;
  }> {
    await new Promise((r) => setTimeout(r, 500));
    // 1 RBTC en wei × USD/RBTC → DOC en wei (18 decimales)
    const docReceived = rbtcAmount * this.btcUsdPrice;
    return {
      success: true,
      docReceived,
      txHash: `0xmock_mint_${Date.now().toString(16)}`,
      isMock: true,
    };
  }

  async getDocBalance(_address: string): Promise<bigint> {
    return 1000n * 10n ** 18n;
  }
}

export const createMocAdapter = (useReal: boolean): IMocAdapter => {
  return useReal ? new RealMocAdapter() : new MockMocAdapter();
};
