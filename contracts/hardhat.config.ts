import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

dotenv.config();

const rskTestnetRpc =
  process.env.RSK_TESTNET_RPC ?? "https://public-node.testnet.rsk.co";
const rskMainnetRpc =
  process.env.RSK_MAINNET_RPC ?? "https://public-node.rsk.co";

function accountsFromEnv(): string[] | undefined {
  const key = process.env.DEPLOYER_PRIVATE_KEY;
  if (!key || key.length === 0) return undefined;
  return [key.startsWith("0x") ? key : `0x${key}`];
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    rskTestnet: {
      chainId: 31,
      url: rskTestnetRpc,
      accounts: accountsFromEnv(),
    },
    rskMainnet: {
      chainId: 30,
      url: rskMainnetRpc,
      accounts: accountsFromEnv(),
    },
  },
};

export default config;
