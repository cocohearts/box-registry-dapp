'use client'
import React, { useState } from 'react';
const ethers = require("ethers");   
import { abi, contractAddress } from "./constants.js" 

export default function Home() {
  const [boxes, setBoxes] = useState([]);
  const [balances, setBalances] = useState([]);
  const [connection, setConnection] = useState();
  const [buttonValue, setButtonValue] = useState('Connect');

  const handleConnect = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" })
      } catch (error) {
        console.log("Acct request error:", error)
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log("connected!")
      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      console.log(`Connected accounts: ${accounts}`)
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      contract.once("BoxList", async (boxes)=>{
        console.log("heard something!")
        console.log(boxes);
        let newBalances = [];
        for (let index in boxes) {
          const balance = await provider.getBalance(boxes[index]);
          newBalances.push(balance);
        }
        setBalances(newBalances);
        setBoxes(boxes);
      })
      console.log("Listener set!")
      const gasPrice = ethers.utils.parseUnits('2', 'gwei'); // 50 gwei
      const gasLimit = 50000; // Example gas limit, adjust as necessary
      const transactionOptions = {
        gasPrice: gasPrice,
        gasLimit: gasLimit,
      };
      const box_addresses = await contract.getUserBoxes(transactionOptions);
      setConnection("Connecting transaction pending, please wait")
      await box_addresses.wait();
      setConnection("Connecting transaction completed!")
      
      console.log("Contract call return:", box_addresses);
      setButtonValue("Connected");
    } else {
      setButtonValue("Please install MetaMask")
    }
  };

  return (
    <>
      <title>My App</title>
      <h1>Box Registry</h1>
      <MyConnectButton buttonValue={buttonValue} setButtonValue={setButtonValue} handleConnect={handleConnect} />
      <MyFormComponent/>
      <p>{connection}</p>
      {boxes.map((box, index) => (
        <MyBoxComponent key={index} addr={box} balance={ethers.utils.formatEther(balances[index])} />
      ))}
    </>
  );
}

function MyBoxComponent({ addr, balance }) {
  return (
    <p>Box at address {addr} with balance {balance} ETH!</p>
  )
}

function MyConnectButton({ buttonValue, setButtonValue, handleConnect }) {
  return (
    <button onClick={handleConnect}>{buttonValue}</button>
  )
}

function MyFormComponent() {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    console.log(`Form submitted with value: ${inputValue}`);

    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', [])
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      contract.connect(signer);
      try {
        const transactionResponse = await contract.play({
          value: ethers.utils.parseEther(inputValue)
        });
        transactionResponse.wait().then(async (receipt) => {
          console.log(transactionResponse);
        })
      } catch (error) {
        console.log(error)
      }
    } else {
      alert("Please install MetaMask")
    }
  };

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="myInput">Add ETH:</label>
      <br></br>
      <input
        type="text"
        id="myInput"
        value={inputValue}
        onChange={handleChange}
      /><br></br>
      <button type="submit">Submit</button>
    </form>
  );
}
