const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("BoxRegistry", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  let signers, owner, addr1, addr2, additionalSigners, registry, contract;

  beforeEach(async function () {
    starting = ethers.parseEther("100.0");
    // Contracts are deployed using the first signer/account by default
    signers = await ethers.getSigners();
    [owner, addr1, addr2, ...additionalSigners] = signers;

    const BoxRegistry = await ethers.getContractFactory("BoxRegistry",owner);
    // const registry = await BoxRegistry.deploy();
    registry = await BoxRegistry.deploy({ value: starting });
    await registry.waitForDeployment();
    contract = await registry.connect(addr1);
  });

  describe("Deployment", function () {
    it("Should have right starting amount", async function () {
      // const { registry, } = await loadFixture(deployDefaultRegistryFixture);
      const balance = await ethers.provider.getBalance(registry.target);
      expect(balance).to.equal(ethers.parseEther("100.0"));
    });
  });

  describe("Initialization", function () {
    it("Should emit log when creating box", async function () {
      await expect(contract.createBox())
        .to.emit(contract, "BoxCreation");
    })
    it("Should emit log when getting boxes", async function () {
      await expect(contract.getUserBoxes())
        .to.emit(contract, "BoxList");
    })
  })
});