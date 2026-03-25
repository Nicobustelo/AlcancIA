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

describe("RemittanceScheduler", function () {
  it("should schedule a remittance", async function () {
    const { alice, bob, remittanceScheduler } = await loadFixture(deployFixture);
    const amount = ethers.parseEther("10");
    const day = 15;
    const id = await remittanceScheduler
      .connect(alice)
      .scheduleRemittance.staticCall(bob.address, amount, day);
    await remittanceScheduler
      .connect(alice)
      .scheduleRemittance(bob.address, amount, day);
    const r = await remittanceScheduler.getRemittance(id);
    expect(r.sender).to.equal(alice.address);
    expect(r.recipient).to.equal(bob.address);
    expect(r.amountDoc).to.equal(amount);
    expect(r.dayOfMonth).to.equal(day);
    expect(r.status).to.equal(0);
  });

  it("should emit RemittanceScheduled event", async function () {
    const { alice, bob, remittanceScheduler } = await loadFixture(deployFixture);
    const amount = ethers.parseEther("5");
    const day = 10;
    const tx = await remittanceScheduler
      .connect(alice)
      .scheduleRemittance(bob.address, amount, day);
    const receipt = await tx.wait();
    const block = await ethers.provider.getBlock(receipt!.blockNumber);
    await expect(tx)
      .to.emit(remittanceScheduler, "RemittanceScheduled")
      .withArgs(0n, alice.address, bob.address, amount, day, block!.timestamp);
  });

  it("should cancel a remittance", async function () {
    const { alice, bob, remittanceScheduler } = await loadFixture(deployFixture);
    const amount = ethers.parseEther("1");
    await remittanceScheduler
      .connect(alice)
      .scheduleRemittance(bob.address, amount, 5);
    await remittanceScheduler.connect(alice).cancelRemittance(0);
    const r = await remittanceScheduler.getRemittance(0);
    expect(r.status).to.equal(3);
    await expect(
      remittanceScheduler.connect(bob).cancelRemittance(0)
    ).to.be.revertedWithCustomError(remittanceScheduler, "UnauthorizedCaller");
  });

  it("should not cancel already cancelled remittance", async function () {
    const { alice, bob, remittanceScheduler } = await loadFixture(deployFixture);
    await remittanceScheduler
      .connect(alice)
      .scheduleRemittance(bob.address, ethers.parseEther("1"), 5);
    await remittanceScheduler.connect(alice).cancelRemittance(0);
    await expect(
      remittanceScheduler.connect(alice).cancelRemittance(0)
    ).to.be.revertedWithCustomError(
      remittanceScheduler,
      "RemittanceAlreadyCancelled"
    );
  });

  it("should execute a remittance", async function () {
    const { alice, bob, doc, remittanceScheduler } = await loadFixture(
      deployFixture
    );
    const amount = ethers.parseEther("20");
    await remittanceScheduler
      .connect(alice)
      .scheduleRemittance(bob.address, amount, 12);
    const schedulerAddr = await remittanceScheduler.getAddress();
    await doc.connect(alice).approve(schedulerAddr, amount);
    const bobBefore = await doc.balanceOf(bob.address);
    await remittanceScheduler.executeRemittance(0);
    expect(await doc.balanceOf(bob.address)).to.equal(bobBefore + amount);
    const r = await remittanceScheduler.getRemittance(0);
    expect(r.status).to.equal(1);
  });

  it("should not execute already executed remittance", async function () {
    const { alice, bob, doc, remittanceScheduler } = await loadFixture(
      deployFixture
    );
    const amount = ethers.parseEther("3");
    await remittanceScheduler
      .connect(alice)
      .scheduleRemittance(bob.address, amount, 7);
    await doc.connect(alice).approve(await remittanceScheduler.getAddress(), amount);
    await remittanceScheduler.executeRemittance(0);
    await expect(
      remittanceScheduler.executeRemittance(0)
    ).to.be.revertedWithCustomError(
      remittanceScheduler,
      "RemittanceAlreadyExecuted"
    );
  });

  it("should not allow invalid dayOfMonth", async function () {
    const { alice, bob, remittanceScheduler } = await loadFixture(deployFixture);
    await expect(
      remittanceScheduler
        .connect(alice)
        .scheduleRemittance(bob.address, ethers.parseEther("1"), 0)
    ).to.be.revertedWithCustomError(remittanceScheduler, "InvalidAmount");
    await expect(
      remittanceScheduler
        .connect(alice)
        .scheduleRemittance(bob.address, ethers.parseEther("1"), 29)
    ).to.be.revertedWithCustomError(remittanceScheduler, "InvalidAmount");
  });

  it("should track user remittances correctly", async function () {
    const { alice, bob, remittanceScheduler } = await loadFixture(deployFixture);
    await remittanceScheduler
      .connect(alice)
      .scheduleRemittance(bob.address, ethers.parseEther("1"), 1);
    await remittanceScheduler
      .connect(alice)
      .scheduleRemittance(bob.address, ethers.parseEther("2"), 2);
    const ids = await remittanceScheduler.getUserRemittances(alice.address);
    expect(ids.length).to.equal(2);
    expect(ids[0]).to.equal(0n);
    expect(ids[1]).to.equal(1n);
    expect(
      await remittanceScheduler.getUserRemittanceCount(alice.address)
    ).to.equal(2n);
  });
});
