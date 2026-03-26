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

describe("VaultManager", function () {
  describe("RBTC", function () {
    it("should deposit RBTC", async function () {
      const { alice, vaultManager } = await loadFixture(deployFixture);
      const amount = ethers.parseEther("1");
      await vaultManager.connect(alice).depositRBTC({ value: amount });
      expect(await vaultManager.rbtcBalances(alice.address)).to.equal(amount);
    });

    it("should emit Deposited event on RBTC deposit", async function () {
      const { alice, vaultManager } = await loadFixture(deployFixture);
      const amount = ethers.parseEther("1");
      const tx = await vaultManager.connect(alice).depositRBTC({ value: amount });
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);
      await expect(tx)
        .to.emit(vaultManager, "Deposited")
        .withArgs(alice.address, "RBTC", amount, block!.timestamp);
    });

    it("should withdraw RBTC", async function () {
      const { alice, vaultManager } = await loadFixture(deployFixture);
      const amount = ethers.parseEther("1");
      await vaultManager.connect(alice).depositRBTC({ value: amount });
      const before = await ethers.provider.getBalance(alice.address);
      const tx = await vaultManager.connect(alice).withdrawRBTC(amount);
      const receipt = await tx.wait();
      const gas = receipt!.fee;
      const after = await ethers.provider.getBalance(alice.address);
      expect(after + gas - before).to.equal(amount);
      expect(await vaultManager.rbtcBalances(alice.address)).to.equal(0n);
    });

    it("should revert withdraw with insufficient balance", async function () {
      const { alice, vaultManager } = await loadFixture(deployFixture);
      await expect(
        vaultManager.connect(alice).withdrawRBTC(1n)
      ).to.be.revertedWithCustomError(vaultManager, "InsufficientBalance");
    });

    it("should receive RBTC via receive()", async function () {
      const { alice, vaultManager } = await loadFixture(deployFixture);
      const amount = ethers.parseEther("0.5");
      await alice.sendTransaction({
        to: await vaultManager.getAddress(),
        value: amount,
      });
      expect(await vaultManager.rbtcBalances(alice.address)).to.equal(amount);
    });
  });

  describe("DOC", function () {
    it("should deposit DOC", async function () {
      const { alice, doc, vaultManager } = await loadFixture(deployFixture);
      const amount = ethers.parseEther("100");
      await doc.connect(alice).approve(await vaultManager.getAddress(), amount);
      await vaultManager.connect(alice).depositDOC(amount);
      expect(await vaultManager.docBalances(alice.address)).to.equal(amount);
    });
  });

  describe("Views", function () {
    it("should return user position correctly", async function () {
      const { alice, doc, vaultManager } = await loadFixture(deployFixture);
      const rbtc = ethers.parseEther("2");
      const docAmt = ethers.parseEther("50");
      await vaultManager.connect(alice).depositRBTC({ value: rbtc });
      await doc.connect(alice).approve(await vaultManager.getAddress(), docAmt);
      await vaultManager.connect(alice).depositDOC(docAmt);

      const pos = await vaultManager.getUserPosition(alice.address);
      expect(pos.rbtc).to.equal(rbtc);
      expect(pos.doc).to.equal(docAmt);
      expect(pos.shares).to.equal(0n);
      expect(pos.depositedDoc).to.equal(0n);
    });
  });
});
