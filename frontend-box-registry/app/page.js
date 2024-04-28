'use client'
import React, { useState, useEffect } from 'react';
const ethers = require("ethers");   
import { registry_abi, contractAddress, box_abi } from "./constants.js" 

export default function Home() {
  const [boxes, setBoxes] = useState([]);
  const [balances, setBalances] = useState([]);
  const [connection, setConnection] = useState();
  const [buttonValue, setButtonValue] = useState('Connect');
  const [contractState, setContractState] = useState();

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

function EtherScanLink({ txHash }) {
  console.log(txHash);
  let url = `https://sepolia.etherscan.io/tx/${txHash}`;
  console.log(url);
  return (
    <a href={url}>Etherscan Link</a>
  )
}

function DepositForm({ addr, balances, setBalances, index }) {
  const [inputValue, setInputValue] = useState('');
  // const [depositTx, setDepositTx] = useState('');
  // let depositTx;
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
    // console.log(depositTx);
    // setTriggerUpdate(!triggerUpdate);
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

function MyConnectButton({ buttonValue, setButtonValue, handleConnect }) {
  return (
    <button onClick={handleConnect}>{buttonValue}</button>
  )
}

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