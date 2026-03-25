/** Feature flags para controlar modo real vs mock por integración */
export interface FeatureFlags {
  enableRealMoc: boolean;
  enableRealTropykus: boolean;
  enableRealPriceOracle: boolean;
  enableRealFiatRates: boolean;
}

const parseFlag = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
};

export const getFeatureFlags = (): FeatureFlags => ({
  enableRealMoc: parseFlag(process.env.NEXT_PUBLIC_ENABLE_REAL_MOC, false),
  enableRealTropykus: parseFlag(process.env.NEXT_PUBLIC_ENABLE_REAL_TROPYKUS, false),
  enableRealPriceOracle: parseFlag(process.env.NEXT_PUBLIC_ENABLE_REAL_PRICE_ORACLE, true),
  enableRealFiatRates: parseFlag(process.env.NEXT_PUBLIC_ENABLE_REAL_FIAT_RATES, false),
});

export const isUsingMock = (integration: keyof FeatureFlags): boolean => {
  const flags = getFeatureFlags();
  return !flags[integration];
};
