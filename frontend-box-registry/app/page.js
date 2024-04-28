/**
 * @file FILEPATH: /Users/alex-zhao/Coding/crypto/box-registry-dapp/frontend-box-registry/app/page.js
 * @desc This file contains the implementation of the Home component, which serves as the main page of the Box Registry application.
 * The Home component displays a list of boxes and provides functionality to connect to a provider, deposit funds, withdraw funds, and create new boxes.
 * It also includes helper functions for interacting with the Ethereum network using ethers.js library.
 */

'use client'

import React, { useState, useEffect } from 'react';
const ethers = require("ethers");   
import { registry_abi, contractAddress, box_abi } from "./constants.js" 

/**
 * Home component
 * @returns {JSX.Element} The rendered Home component
 */
export default function Home() {
  const [boxes, setBoxes] = useState([]);
  const [balances, setBalances] = useState([]);
  const [connection, setConnection] = useState();
  const [buttonValue, setButtonValue] = useState('Connect');
  const [contractState, setContractState] = useState();

  /**
   * Handles the connect button click event
   * @returns {Promise<void>} A promise that resolves when the connection is established
   */
  const handleConnect = async () => {
    const { provider, signer } = await GetProviderSigner();

    let registryContract = new ethers.Contract(contractAddress, registry_abi, signer);

    const boxListPromise = new Promise((resolve) => {
        registryContract.once("BoxList", async (boxes) => {
          console.log("heard something!")
          console.log(boxes);
          let newBalances = [];
          for (let index in boxes) {
            const balance = await provider.getBalance(boxes[index]);
            newBalances.push(balance);
          }
          setBalances(newBalances);
          setBoxes(boxes);
          setContractState(registryContract);
          resolve(); // Resolve the promise when the event is handled
        });
    });
    console.log("Listener set!")
    const box_addresses = await registryContract.getUserBoxes();
    setConnection("Connecting transaction pending, please wait")
    await box_addresses.wait();
    await boxListPromise;
    setConnection("Connecting transaction completed!")
    setButtonValue("Connected");
  };

  return (
    <>
      <title>My App</title>
      <h1>Box Registry</h1>
      <MyConnectButton buttonValue={buttonValue} setButtonValue={setButtonValue} handleConnect={handleConnect} />
      <p>{connection}</p>
      {boxes.map((box, index) => (
        <> 
          <DepositForm key={2*index} addr={box} balances={balances} setBalances={setBalances} index={index} />
          <WithdrawForm key={2*index+1} index={index} balances={balances} setBalances={setBalances} boxes={boxes} setBoxes={setBoxes} />
        </>
      ))}
      
      {contractState && <CreateBoxForm balances={balances} setBalances={setBalances} boxes={boxes} setBoxes={setBoxes} contract={contractState} />}
    </>
  );
}

/**
 * Retrieves the provider and signer for interacting with the Ethereum network
 * @returns {Promise<{provider: ethers.providers.Web3Provider, signer: ethers.Signer}>} A promise that resolves with the provider and signer objects
 */
async function GetProviderSigner() {
    let provider, signer;
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" })
      } catch (error) {
        console.log("Acct request error:", error)
      }
      provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log("connected!")
      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      console.log(`Connected accounts: ${accounts}`)
      signer = provider.getSigner();
    } else {
      setButtonValue("Please install MetaMask")
    }
    return { provider,signer };
}

/**
 * Renders a link to the Etherscan transaction page
 * @param {string} txHash - The transaction hash
 * @returns {JSX.Element} The rendered link to the Etherscan transaction page
 */
function EtherScanLink({ txHash }) {
  console.log(txHash);
  let url = `https://sepolia.etherscan.io/tx/${txHash}`;
  console.log(url);
  return (
    <a href={url}>Etherscan Link</a>
  )
}

/**
 * Renders a deposit form for a specific box
 * @param {Object} props - The component props
 * @param {string} props.addr - The address of the box
 * @param {Array<number>} props.balances - The balances of the boxes
 * @param {Function} props.setBalances - The function to update the balances
 * @param {number} props.index - The index of the box
 * @returns {JSX.Element} The rendered deposit form
 */
function DepositForm({ addr, balances, setBalances, index }) {
  const [inputValue, setInputValue] = useState('');
  const [depositTxHash,setDepositTxHash] = useState();
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    let { provider, signer } = await GetProviderSigner();

    const transaction = {
      to: addr,
      value: ethers.utils.parseUnits(inputValue,"ether"),
    };
    console.log(`Form submitted with value: ${inputValue}`);
    const newDepositTx = await signer.sendTransaction(transaction);
    console.log(`Transaction sent with value: ${inputValue}`);
    console.log(newDepositTx['hash']);
    setDepositTxHash(newDepositTx['hash']);
    setInputValue('');
    await newDepositTx.wait();
    console.log(`Transaction with value ${inputValue} confirmed`);
    const updatedBalances = [...balances]; // Create a copy of the balances array
    let balance = updatedBalances[index];
    console.log(balance);
    if (balance === 0) {
      updatedBalances[index] = ethers.utils.parseEther(inputValue);
    } else {
      updatedBalances[index] = balance.add(ethers.utils.parseEther(inputValue));
    }
    setBalances(updatedBalances);
  };

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <>
      <p>Address: {addr}, Balance: {ethers.utils.formatEther(balances[index])}</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="myInput">Add more:</label>
        <br></br>
        <input
          type="text"
          id="myInput"
          value={inputValue}
          onChange={handleChange}
        /><br></br>
        <button type="submit">Submit</button>
      </form>
      {depositTxHash && <EtherScanLink txHash={depositTxHash} />}
    </>
  );
}

/**
 * Renders a withdraw form for a specific box
 * @param {Object} props - The component props
 * @param {number} props.index - The index of the box
 * @param {Array<number>} props.balances - The balances of the boxes
 * @param {Function} props.setBalances - The function to update the balances
 * @param {Array<string>} props.boxes - The array of box addresses
 * @param {Function} props.setBoxes - The function to update the box addresses
 * @returns {JSX.Element} The rendered withdraw form
 */
function WithdrawForm({ index, balances, setBalances, boxes, setBoxes }) {
  const [withdrawStatus, setWithdrawStatus] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    let { provider, signer } = await GetProviderSigner();
    const contract = new ethers.Contract(boxes[index], box_abi, signer);
    console.log(contract);
    const withdrawal_tx = await contract.withdraw();
    console.log(withdrawal_tx);
    setWithdrawStatus("Withdrawal transaction pending");
    await withdrawal_tx.wait();
    setWithdrawStatus("Withdrawal complete");

    const updatedBalances = [...balances]; // Create a copy of the balances array
    updatedBalances.splice(index, 1);
    setBalances(updatedBalances);
    const updatedBoxes = [...boxes]; // Create a copy of the balances array
    updatedBoxes.splice(index, 1);
    setBoxes(updatedBoxes);
    setWithdrawStatus('');
  }

  return (
    <>
    <form onSubmit={handleSubmit}>
      <button type="submit">Withdraw</button>
    </form>
    <p>{withdrawStatus}</p>
    </>
  )
}

/**
 * Renders a connect button
 * @param {Object} props - The component props
 * @param {string} props.buttonValue - The value of the button
 * @param {Function} props.setButtonValue - The function to update the button value
 * @param {Function} props.handleConnect - The function to handle the connect button click event
 * @returns {JSX.Element} The rendered connect button
 */
function MyConnectButton({ buttonValue, setButtonValue, handleConnect }) {
  return (
    <button onClick={handleConnect}>{buttonValue}</button>
  )
}

/**
 * Renders a form to create a new box
 * @param {Object} props - The component props
 * @param {Array<number>} props.balances - The balances of the boxes
 * @param {Function} props.setBalances - The function to update the balances
 * @param {Array<string>} props.boxes - The array of box addresses
 * @param {Function} props.setBoxes - The function to update the box addresses
 * @param {Object} props.contract - The contract object
 * @returns {JSX.Element} The rendered create box form
 */
function CreateBoxForm({ boxes, setBoxes, balances, setBalances, contract }) {
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    console.log("Creating box!")

    const boxCreationPromise = new Promise((resolve) => {
        contract.once("BoxCreation", async (box) => {
          console.log("heard something!")
          console.log(box);
          let updatedBalances = [...balances]; // Create a copy of the balances array
          updatedBalances.push(0.0);
          setBalances(updatedBalances);
          let updatedBoxes = [...boxes]; // Create a copy of the balances array
          updatedBoxes.push(box);
          setBoxes(updatedBoxes);
          console.log("states updated!")
          resolve(); // Resolve the promise when the event is handled
        });
    });

    let { provider, signer } = await GetProviderSigner();
    const boxContract = new ethers.Contract(contractAddress, registry_abi, signer);
    const createBoxTx = await boxContract.createBox();
    await createBoxTx.wait();
    await boxCreationPromise;
  }
  return (
    <>
      <form onSubmit={handleSubmit}>
        <button type="submit">Create New Box</button>
      </form>
    </>
  )
}