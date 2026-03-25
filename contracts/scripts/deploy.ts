import * as fs from "fs";
import * as path from "path";
import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const doc = await MockERC20.deploy("Mock DOC", "DOC");
  await doc.waitForDeployment();
  const docAddress = await doc.getAddress();

  const VaultManager = await ethers.getContractFactory("VaultManager");
  const vaultManager = await VaultManager.deploy(docAddress);
  await vaultManager.waitForDeployment();
  const vaultManagerAddress = await vaultManager.getAddress();

  const StrategyExecutor = await ethers.getContractFactory("StrategyExecutor");
  const strategyExecutor = await StrategyExecutor.deploy(
    vaultManagerAddress,
    ethers.ZeroAddress,
    ethers.ZeroAddress,
    docAddress
  );
  await strategyExecutor.waitForDeployment();
  const strategyExecutorAddress = await strategyExecutor.getAddress();

  await vaultManager.setStrategyExecutor(strategyExecutorAddress);

  const RemittanceScheduler = await ethers.getContractFactory(
    "RemittanceScheduler"
  );
  const remittanceScheduler = await RemittanceScheduler.deploy(docAddress);
  await remittanceScheduler.waitForDeployment();
  const remittanceSchedulerAddress = await remittanceScheduler.getAddress();

  const network = await ethers.provider.getNetwork();
  const deployment = {
    network: hre.network.name,
    chainId: Number(network.chainId),
    deployer: await deployer.getAddress(),
    mockDoc: docAddress,
    vaultManager: vaultManagerAddress,
    strategyExecutor: strategyExecutorAddress,
    remittanceScheduler: remittanceSchedulerAddress,
  };

  console.log("Mock DOC:", docAddress);
  console.log("VaultManager:", vaultManagerAddress);
  console.log("StrategyExecutor:", strategyExecutorAddress);
  console.log("RemittanceScheduler:", remittanceSchedulerAddress);

  const outDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${hre.network.name}.json`);
  fs.writeFileSync(outPath, JSON.stringify(deployment, null, 2));
  console.log("Saved:", outPath);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
