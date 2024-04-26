'use client'
import React, { useState, useEffect } from 'react';
const ethers = require("ethers");   
import { registry_abi, contractAddress, box_abi } from "./constants.js" 

export default async function Home() {
  const [boxes, setBoxes] = useState([]);
  const [balances, setBalances] = useState([]);
  const [connection, setConnection] = useState();
  const [buttonValue, setButtonValue] = useState('Connect');
  // let provider, signer;
  const { provider, signer } = await GetProviderSigner();

  const handleConnect = async () => {
    const contract = new ethers.Contract(contractAddress, registry_abi, signer);

    const boxListPromise = new Promise((resolve) => {
        contract.once("BoxList", async (boxes) => {
          console.log("heard something!")
          console.log(boxes);
          let newBalances = [];
          for (let index in boxes) {
            const balance = await provider.getBalance(boxes[index]);
            newBalances.push(balance);
          }
          setBalances(newBalances);
          setBoxes(boxes);
          resolve(); // Resolve the promise when the event is handled
        });
    });
    console.log("Listener set!")
    const box_addresses = await contract.getUserBoxes();
    setConnection("Connecting transaction pending, please wait")
    await box_addresses.wait();
    setConnection("Connecting transaction completed!")
    await boxListPromise;
  };

  return (
    <>
      <title>My App</title>
      <h1>Box Registry</h1>
      <MyConnectButton buttonValue={buttonValue} setButtonValue={setButtonValue} handleConnect={handleConnect} />
      <p>{connection}</p>
      {boxes.map((box, index) => (
        <DepositForm key={index} addr={box} balances={balances} setBalances={setBalances} index={index} />
      ))}
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

function EtherScanLink(tx) {
  if (![null,undefined].includes(tx)) {
    let txHash = tx['hash'];
    let url = `https://sepolia.etherscan.io/tx/${txHash}`;
    if (![null,undefined].includes(txHash)) {
      return (
        <a href={url}>Etherscan Link</a>
      )
    }
  }
}

function DepositForm({ addr, balances, setBalances, index }) {
  const [inputValue, setInputValue] = useState('');
  let depositTx;
  // const [depositTx,setDepositTx] = useState();
  const [triggerUpdate, setTriggerUpdate] = useState(false); // New state to trigger updates

  useEffect(() => {
    if (depositTx) {
      // Perform any necessary updates or side effects here
      // For example, fetching new data or updating the UI
      console.log('Transaction submitted:', depositTx);
      // Optionally, toggle triggerUpdate to force a re-render if needed
      setTriggerUpdate(!triggerUpdate);
    }
  }, [depositTx, triggerUpdate]); // Listen for changes to depositTx and triggerUpdate

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    let { provider, signer } = await GetProviderSigner();

    const transaction = {
      to: addr,
      value: ethers.utils.parseUnits(inputValue,"ether"),
    };
    depositTx = await signer.sendTransaction(transaction);
    // setDepositTx(txResp);

    console.log(`Form submitted with value: ${inputValue}`);
    await depositTx.wait();
    const updatedBalances = [...balances]; // Create a copy of the balances array
    updatedBalances[index] = updatedBalances[index].add(ethers.utils.parseEther(inputValue));
    setBalances(updatedBalances);
    console.log(balances.map((balance)=>(ethers.utils.formatEther(balance))));
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
      {depositTx && <EtherScanLink tx={depositTx} />}
      {/* <EtherScanLink tx={depositTx} /> */}
    </>
  );
}

function MyConnectButton({ buttonValue, setButtonValue, handleConnect }) {
  return (
    <button onClick={handleConnect}>{buttonValue}</button>
  )
}

// function MyFormComponent({ addr, balance }) {
//   const [inputValue, setInputValue] = useState('');

//   const handleSubmit = async (event) => {
//     event.preventDefault(); // Prevent the default form submission behavior
//     console.log(`Form submitted with value: ${inputValue}`);

//     if (typeof window.ethereum !== "undefined") {
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       await provider.send('eth_requestAccounts', [])
//       const signer = provider.getSigner();
//       const contract = new ethers.Contract(contractAddress, abi, signer);
//       contract.connect(signer);
//       try {
//         const transactionResponse = await contract.play({
//           value: ethers.utils.parseEther(inputValue)
//         });
//         transactionResponse.wait().then(async (receipt) => {
//           console.log(transactionResponse);
//         })
//       } catch (error) {
//         console.log(error)
//       }
//     } else {
//       alert("Please install MetaMask")
//     }
//   };

//   const handleChange = (event) => {
//     setInputValue(event.target.value);
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <label htmlFor="myInput">Add ETH:</label>
//       <br></br>
//       <input
//         type="text"
//         id="myInput"
//         value={inputValue}
//         onChange={handleChange}
//       /><br></br>
//       <button type="submit">Submit</button>
//     </form>
//   );
// }
