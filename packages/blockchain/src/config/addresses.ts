export interface ProtocolAddresses {
  vaultManager: string;
  strategyExecutor: string;
  remittanceScheduler: string;
  mocContract: string;
  mocDocToken: string;
  mocVendors: string;
  tropykusKDoc: string;
  tropykusComptroller: string;
}

const env = (key: string, fallback: string = ''): string => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || fallback;
  }
  return fallback;
};

export const TESTNET_ADDRESSES: ProtocolAddresses = {
  vaultManager: env('NEXT_PUBLIC_VAULT_MANAGER_ADDRESS', ''),
  strategyExecutor: env('NEXT_PUBLIC_STRATEGY_EXECUTOR_ADDRESS', ''),
  remittanceScheduler: env('NEXT_PUBLIC_REMITTANCE_SCHEDULER_ADDRESS', ''),
  mocContract: env('NEXT_PUBLIC_MOC_CONTRACT_ADDRESS', '0x2820f6d4D199B8D8838A4B26F9917754B86a0c1F'),
  mocDocToken: env('NEXT_PUBLIC_MOC_DOC_TOKEN_ADDRESS', ''),
  mocVendors: env('NEXT_PUBLIC_MOC_VENDORS_ADDRESS', '0x84b895A1b7be8fAc64d43757479281Bf0b5E3719'),
  tropykusKDoc: env('NEXT_PUBLIC_TROPYKUS_KDOC_ADDRESS', '0x26905F629D17C6ECCE71bC017a9518993Bbbc579'),
  tropykusComptroller: env('NEXT_PUBLIC_TROPYKUS_COMPTROLLER_ADDRESS', '0xb1BEc5376929b4E0235F1353819DBa92c4B0C6bb'),
};

export const MAINNET_ADDRESSES: ProtocolAddresses = {
  vaultManager: '',
  strategyExecutor: '',
  remittanceScheduler: '',
  mocContract: '',
  mocDocToken: '0xe700691dA7b9851F2F35f8b8182c69c53CcAD9Db',
  mocVendors: '',
  tropykusKDoc: '0x544eb90e766b405134b3B3f62b6B4c23fCd5FdA2',
  tropykusComptroller: '0x962308Fef8EdfAdD705384840e7701f8F39ed0c0',
};

export const getAddresses = (chainId: number): ProtocolAddresses => {
  return chainId === 30 ? MAINNET_ADDRESSES : TESTNET_ADDRESSES;
};
