import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

async function deployFixture() {
  const [owner, alice, bob] = await ethers.getSigners();

  const MockERC20Factory = await ethers.getContractFactory("MockERC20");
  const doc = await MockERC20Factory.deploy("Mock DOC", "DOC");
  await doc.waitForDeployment();
  const docAddress = await doc.getAddress();

  const VaultManagerFactory = await ethers.getContractFactory("VaultManager");
  const vaultManager = await VaultManagerFactory.deploy(docAddress);
  await vaultManager.waitForDeployment();

  const StrategyExecutorFactory = await ethers.getContractFactory(
    "StrategyExecutor"
  );
  const strategyExecutor = await StrategyExecutorFactory.deploy(
    await vaultManager.getAddress(),
    ethers.ZeroAddress,
    ethers.ZeroAddress,
    docAddress
  );
  await strategyExecutor.waitForDeployment();
  await vaultManager.setStrategyExecutor(await strategyExecutor.getAddress());

  const RemittanceSchedulerFactory = await ethers.getContractFactory(
    "RemittanceScheduler"
  );
  const remittanceScheduler = await RemittanceSchedulerFactory.deploy(
    docAddress
  );
  await remittanceScheduler.waitForDeployment();

  const mintAmount = ethers.parseEther("1000000");
  await doc.mint(alice.address, mintAmount);
  await doc.mint(bob.address, mintAmount);
  await doc.mint(owner.address, mintAmount);

  return {
    owner,
    alice,
    bob,
    doc,
    docAddress,
    vaultManager,
    strategyExecutor,
    remittanceScheduler,
  };
}

describe("StrategyExecutor", function () {
  it("should execute strategy in fallback mode", async function () {
    const { owner, alice, strategyExecutor, vaultManager } = await loadFixture(
      deployFixture
    );
    await strategyExecutor.connect(owner).setFallbackMode(true);
    const rbtcAmount = ethers.parseEther("1");
    await strategyExecutor.executeStrategy(rbtcAmount, alice.address, {
      value: rbtcAmount,
    });
    const expectedDoc = (rbtcAmount * 65000n) / ethers.parseEther("1");
    const pos = await vaultManager.getUserPosition(alice.address);
    expect(pos.depositedDoc).to.equal(expectedDoc);
    expect(pos.shares).to.equal(expectedDoc);
  });

  it("should emit StrategyExecuted event", async function () {
    const { owner, alice, strategyExecutor } = await loadFixture(deployFixture);
    await strategyExecutor.connect(owner).setFallbackMode(true);
    const rbtcAmount = ethers.parseEther("1");
    const expectedDoc = (rbtcAmount * 65000n) / ethers.parseEther("1");
    const tx = await strategyExecutor.executeStrategy(rbtcAmount, alice.address, {
      value: rbtcAmount,
    });
    const receipt = await tx.wait();
    const block = await ethers.provider.getBlock(receipt!.blockNumber);
    await expect(tx)
      .to.emit(strategyExecutor, "StrategyExecuted")
      .withArgs(
        alice.address,
        rbtcAmount,
        expectedDoc,
        0n,
        block!.timestamp
      );
  });

  it("should emit ExternalProtocolFallbackUsed in fallback mode", async function () {
    const { owner, alice, strategyExecutor } = await loadFixture(deployFixture);
    await strategyExecutor.connect(owner).setFallbackMode(true);
    const rbtcAmount = ethers.parseEther("0.1");
    const tx = await strategyExecutor.executeStrategy(rbtcAmount, alice.address, {
      value: rbtcAmount,
    });
    const receipt = await tx.wait();
    const block = await ethers.provider.getBlock(receipt!.blockNumber);
    await expect(tx)
      .to.emit(strategyExecutor, "ExternalProtocolFallbackUsed")
      .withArgs("MoneyOnChain", "Fallback mode active", block!.timestamp);
  });

  it("should estimate DOC output", async function () {
    const { strategyExecutor } = await loadFixture(deployFixture);
    const rbtc = ethers.parseEther("2");
    const out = await strategyExecutor.estimateDocOutput(rbtc);
    expect(out).to.equal((rbtc * 65000n) / ethers.parseEther("1"));
  });

  it("should return current APY", async function () {
    const { strategyExecutor } = await loadFixture(deployFixture);
    expect(await strategyExecutor.getCurrentApy()).to.equal(550n);
  });
});
