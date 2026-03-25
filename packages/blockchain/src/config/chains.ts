import { type Chain } from 'viem';

export const rootstockTestnet: Chain = {
  id: 31,
  name: 'Rootstock Testnet',
  nativeCurrency: { name: 'Test RBTC', symbol: 'tRBTC', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RSK_TESTNET_RPC || 'https://public-node.testnet.rsk.co'] },
    public: { http: ['https://public-node.testnet.rsk.co'] },
  },
  blockExplorers: {
    default: {
      name: 'RSK Explorer',
      url: process.env.NEXT_PUBLIC_RSK_EXPLORER_TESTNET || 'https://explorer.testnet.rootstock.io',
    },
  },
  testnet: true,
};

export const rootstockMainnet: Chain = {
  id: 30,
  name: 'Rootstock',
  nativeCurrency: { name: 'RBTC', symbol: 'RBTC', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RSK_MAINNET_RPC || 'https://public-node.rsk.co'] },
    public: { http: ['https://public-node.rsk.co'] },
  },
  blockExplorers: {
    default: {
      name: 'RSK Explorer',
      url: process.env.NEXT_PUBLIC_RSK_EXPLORER_MAINNET || 'https://explorer.rootstock.io',
    },
  },
  testnet: false,
};

export const getChain = (chainId: number): Chain => {
  switch (chainId) {
    case 31:
      return rootstockTestnet;
    case 30:
      return rootstockMainnet;
    default:
      return rootstockTestnet;
  }
};

export const getExplorerUrl = (chainId: number): string => {
  const chain = getChain(chainId);
  return chain.blockExplorers?.default.url ?? 'https://explorer.testnet.rootstock.io';
};

export const getExplorerTxUrl = (chainId: number, txHash: string): string => {
  return `${getExplorerUrl(chainId)}/tx/${txHash}`;
};

export const getExplorerAddressUrl = (chainId: number, address: string): string => {
  return `${getExplorerUrl(chainId)}/address/${address}`;
};
