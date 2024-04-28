const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
// import { registry_abi, contractAddress, box_abi } from "./constants.js" 
const { box_abi } = require("./constants.js");

async function createGetBox (contract) {
  let boxes;
  let balances = [];
  const boxListPromise = new Promise((resolve) => {
    contract.on("BoxList", async (args) => {
      boxes = [...args];
      for (let index in boxes) {
        const balance = await ethers.provider.getBalance(boxes[index]);
        balances.push(balance);
      }
      resolve(); // Resolve the promise when the event is handled
    });
  });

  await contract.createBox();
  contract.getUserBoxes();
  await boxListPromise;

  return { boxes, balances };
}

async function depositMoneyToBox (addr, signer, amt) {
  const transferAmt = ethers.parseEther(amt);
  const tx = await signer.sendTransaction({
    to: addr,
    value: transferAmt
  });
  await tx.wait();
  return transferAmt;
}

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
    it("Should allow anyone to create multiple boxes", async function () {

    })
  })

  describe("Deposit", function () {
    it("Should allow deposits by owner", async function () {
      const { boxes, balances } = await createGetBox(contract);
      let transferAmt = await depositMoneyToBox(boxes[0],addr1,"1.0");

      let balance = await ethers.provider.getBalance(boxes[0]);
      expect(balance).to.equal(transferAmt);

      await depositMoneyToBox(boxes[0],addr1,"1.0");

      balance = await ethers.provider.getBalance(boxes[0]);
      expect(balance).to.equal(BigInt(2)*transferAmt);
    })
  })

  describe("Withdrawal", function () {
    it("Should allow withdrawal by owner, and sums should match", async function () {
      const { boxes, balances } = await createGetBox(contract);

      let initial_addr1Balance = await ethers.provider.getBalance(addr1);
      let initial_addr2Balance = await ethers.provider.getBalance(addr2);

      let transferAmt = await depositMoneyToBox(boxes[0],addr2,"1.0");
      const boxContract = new ethers.Contract(boxes[0],box_abi,addr1);
      let withdrawal_tx = await boxContract.withdraw();
      await withdrawal_tx.wait();

      let balance = await ethers.provider.getBalance(boxes[0]);
      expect(balance).to.equal(BigInt(0));

      let final_addr1Balance = await ethers.provider.getBalance(addr1);
      let final_addr2Balance = await ethers.provider.getBalance(addr2);

      let addr1Gain = final_addr1Balance-initial_addr1Balance;
      let addr2Loss = initial_addr2Balance-final_addr2Balance;

      const delta = ethers.parseEther("0.0001");
      expect(addr1Gain).to.be.closeTo(transferAmt,delta);
      expect(addr2Loss).to.be.closeTo(transferAmt,delta);
    })

    it("Should update withdrawals in registry", async function () {
      let { boxes, balances } = await createGetBox(contract);

      let transferAmt = await depositMoneyToBox(boxes[0],addr2,"1.0");
      const boxContract = new ethers.Contract(boxes[0],box_abi,addr1);
      let withdrawal_tx = await boxContract.withdraw();
      await withdrawal_tx.wait();

      ({ boxes, balances } = await createGetBox(contract));

      expect(boxes.length).to.equal(1);
      expect(balances.length).to.equal(1);
      // let balance = await ethers.provider.getBalance(boxes[0]);
      // expect(balance).to.equal(BigInt(0));

      // let final_addr1Balance = await ethers.provider.getBalance(addr1);
      // let final_addr2Balance = await ethers.provider.getBalance(addr2);

      // let addr1Gain = final_addr1Balance-initial_addr1Balance;
      // let addr2Loss = initial_addr2Balance-final_addr2Balance;

      // const delta = ethers.parseEther("0.0001");
      // expect(addr1Gain).to.be.closeTo(transferAmt,delta);
      // expect(addr2Loss).to.be.closeTo(transferAmt,delta);
    })

  })
});