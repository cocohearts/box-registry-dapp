/**
 * @file FILEPATH: /Users/alex-zhao/Coding/crypto/box-registry-dapp/frontend-box-registry/app/page.js
 * @desc This file contains the implementation of the Home component, which serves as the main page of the Box Registry application.
 * The Home component displays a list of boxes and provides functionality to connect to a provider, deposit funds, withdraw funds, and create new boxes.
 * It also includes helper functions for interacting with the Ethereum network using ethers.js library.
 */

'use client'

import React, { useState, useEffect } from 'react';
const ethers = require("ethers");
import { registry_abi, sepoliaContractAddress, localContractAddress, box_abi } from "./constants.js" 


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
  const [withdrawals, setWithdrawals] = useState([]);
  const [pendingCreations, setPendingCreations] = useState([]);

  const [account, setAccount] = useState();
  const [account_url, setAccountURL] = useState();
  const [network_name, setNetworkName] = useState();

  let contractAddress;

  /**
   * Handles the connect button click event
   * @returns {Promise<void>} A promise that resolves when the connection is established
   */
  const handleConnect = async () => {
    const { provider, signer } = await GetProviderSigner();
    const network = await provider.getNetwork();
    const accountAddress = await signer.getAddress();
    const account_url = `https://sepolia.etherscan.io/address/${accountAddress}`;
    setAccount(accountAddress);
    setAccountURL(account_url);
    switch (network.chainId) {
      case 31337: // Local network chain ID
        contractAddress = localContractAddress;
        setNetworkName("localhost");
        break;
      case 11155111: // Sepolia network chain ID
        contractAddress = sepoliaContractAddress;
        setNetworkName("Sepolia");
        // setAccount(`Your account: ${accountAddress} on Sepolia network`);
        break;
      default:
        console.error('Unsupported network');
        break;
    }

    let registryContract = new ethers.Contract(contractAddress, registry_abi, signer);

    const boxListPromise = new Promise((resolve) => {
      registryContract.once("BoxList", async (boxes) => {
        console.log("heard something!")
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

    const box_addresses = await registryContract.getUserBoxes();
    const url = `https://sepolia.etherscan.io/tx/${box_addresses.hash}`;
    setConnection({ text: "Connecting transaction pending, please wait", url });
    await box_addresses.wait();

    await boxListPromise;
    setConnection({ text: "Connecting transaction completed!", url });

    setContractState(registryContract);
    setButtonValue("Refresh registry");
  };

  return (
    <>
      <title>Box Registry</title>
      <h1>Box Registry</h1>
      <p>
        <a href='https://github.com/cocohearts/box-registry-dapp/blob/main/README.md'>README</a>
      </p>
      <MyConnectButton buttonValue={buttonValue} handleConnect={handleConnect} />
      {/* <p>{connection}</p> */}
      <p>
        {connection ? 
        <>
          <a href={connection.url} target="_blank" rel="noopener noreferrer">{connection.text}</a>
          <br/>
          Your account: {network_name=="Sepolia" ? <a href={account_url} target="_blank" rel="noopener noreferrer">{account}</a> : <>{account}</>} on {network_name} network
        </> 
        : null}
      </p>
      {contractState && boxes.length === 0 && <p>No boxes found</p>}
      {boxes.map((box) => (
        <BoxComponent key={box} box={box} balances={balances} setBalances={setBalances} boxes={boxes} setBoxes={setBoxes} setWithdrawals={setWithdrawals} />
      ))}
      
      <p>
        {withdrawals.map((withdrawal) => (
          <p key={withdrawal.box}><a href={withdrawal.url}>Withdrawal from box {withdrawal.box} for {ethers.utils.formatEther(withdrawal.amount)}</a></p>
        ))}
      </p>
      {contractState && <CreateBoxForm setBoxes={setBoxes} setBalances={setBalances} pendingCreations={pendingCreations} setPendingCreations={setPendingCreations} contract={contractState} />}
      <p>
        {pendingCreations.map((creation) => (
          <p key={creation.hash}><a href={creation.url}>Box creation pending, tx hash {creation.hash}</a></p>
        ))}
      </p>
    </>
  );
}

/**
 * Box component
 * @param {Object} props - The component props
 * @param {string} props.box - The address of the box
 * @param {Array<number>} props.balances - The balances of the boxes
 * @param {Function} props.setBalances - The function to update the balances
 * @param {Array<string>} props.boxes - The array of box addresses
 * @param {Function} props.setBoxes - The function to update the box addresses
 * @param {Function} props.setWithdrawals - The function to update the withdrawals
 * @returns {JSX.Element} The rendered Box component
*/
function BoxComponent({ box, balances, setBalances, boxes, setBoxes, setWithdrawals}) {
  const [isWithdrawn, setIsWithdrawn] = useState(false);
  return (
    <> 
      <DepositForm key={box} addr={box} boxes={boxes} balances={balances} setBalances={setBalances} isWithdrawn={isWithdrawn}/>
      <WithdrawForm key={box+1} addr={box} balances={balances} setBalances={setBalances} boxes={boxes} setBoxes={setBoxes} setWithdrawals={setWithdrawals} isWithdrawn={isWithdrawn} setIsWithdrawn={setIsWithdrawn}/>
    </>
  )
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
      const accounts = await provider.listAccounts();
      console.log("Connected with accounts:", accounts)
      signer = provider.getSigner();
    } else {
      console.error("No ethereum provider found")
    }
    return { provider,signer };
}

/**
 * Renders a link to the Etherscan transaction page
 * @param {string} txHash - The transaction hash
 * @param {string} text - The text to display for the link
 * @returns {JSX.Element} The rendered link to the Etherscan transaction page
 */
function EtherScanLink({ txHash, text }) {
  let url = `https://sepolia.etherscan.io/tx/${txHash}`;
  return (
    <a href={url}>{text}</a>
  )
}

/**
 * Renders information about a specific box including its address and balance.
 * @param {Object} props - The props object containing box and balance values.
 * @param {string} props.box - The address of the box.
 * @param {number} props.balance - The balance of the box.
 * @returns {JSX.Element} React component displaying box information with a link to Etherscan.
 */
function BoxInfo({ box, balance }) {
  let url = `https://sepolia.etherscan.io/address/${box}`;
  return (
    <>
      <p>
        <a href={url}>Etherscan Link</a> 
        <br />
        Box Balance: {balance}
        <br />
        Box Address: {box}
      </p>
    </>
  )
}

/**
 * Renders a deposit form for a specific box
 * @param {Object} props - The component props
 * @param {string} props.addr - The address of the box
 * @param {Array<string>} props.boxes - The array of box addresses
 * @param {Array<number>} props.balances - The balances of the boxes
 * @param {Function} props.setBalances - The function to update the balances
 * @param {boolean} props.isWithdrawn - The boolean value to check if the box has been withdrawn from
 * @returns {JSX.Element} The rendered deposit form
 */
function DepositForm({ addr, boxes, balances, setBalances, isWithdrawn}) {
  const [inputValue, setInputValue] = useState('');
  const [depositTxHash,setDepositTxHash] = useState();
  const [depositTxText,setDepositTxText] = useState();
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    let { provider, signer } = await GetProviderSigner();

    const transaction = {
      to: addr,
      value: ethers.utils.parseUnits(inputValue,"ether"),
    };

    const newDepositTx = await signer.sendTransaction(transaction);

    setDepositTxHash(newDepositTx['hash']);
    setDepositTxText(`Deposit of ${inputValue} pending`);
    setInputValue('');

    await newDepositTx.wait();

    setDepositTxText(`Deposit of ${inputValue} confirmed`);

    setBalances((currentBalances) => {
      const updatedBalances = [...currentBalances]; // Create a copy of the balances array
      const index = boxes.indexOf(addr);
      let balance = updatedBalances[index];
      if (balance === 0) {
        updatedBalances[index] = ethers.utils.parseEther(inputValue);
      } else {
        updatedBalances[index] = balance.add(ethers.utils.parseEther(inputValue));
      }
      setBalances(updatedBalances);
    });
  };

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <>
      {/* <p>Address: {addr}, Balance: {ethers.utils.formatEther(balances[index])}</p> */}
      <BoxInfo box={addr} balance={ethers.utils.formatEther(balances[boxes.indexOf(addr)])} />
      <form onSubmit={handleSubmit}>
        <label htmlFor="myInput">Add more:</label>
        <br/>
        <input
          type="text"
          id="myInput"
          value={inputValue}
          onChange={handleChange}
        />
        <br/>
        <button type="submit" disabled={isWithdrawn}>Deposit</button>
      </form>
      {depositTxHash && <EtherScanLink txHash={depositTxHash} text={depositTxText} />}
    </>
  );
}

/**
 * Renders a withdraw form for a specific box
 * @param {Object} props - The component props
 * @param {number} props.addr - The address of the box
 * @param {Array<number>} props.balances - The balances of the boxes
 * @param {Function} props.setBalances - The function to update the balances
 * @param {Array<string>} props.boxes - The array of box addresses
 * @param {Function} props.setBoxes - The function to update the box addresses
 * @param {Function} props.setWithdrawals - The function to update the withdrawals
 * @param {boolean} props.isWithdrawn - The boolean value to check if the box has been withdrawn from
 * @param {Function} props.setIsWithdrawn - The function to update the isWithdrawn value
 * @returns {JSX.Element} The rendered withdraw form
 */
function WithdrawForm({ addr, balances, setBalances, boxes, setBoxes, setWithdrawals, isWithdrawn, setIsWithdrawn }) {
  const [withdrawStatus, setWithdrawStatus] = useState();
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    const { provider, signer } = await GetProviderSigner();
    const contract = new ethers.Contract(addr, box_abi, signer);
    let withdrawal_tx = await contract.withdraw({ gasLimit: 100000 });
    const withdrawal_tx_url = `https://sepolia.etherscan.io/tx/${withdrawal_tx.hash}`;
    let withdrawalText = { text: "Withdrawal transaction pending", url: withdrawal_tx_url }

    setWithdrawStatus(withdrawalText);
    setIsWithdrawn(true);

    await withdrawal_tx.wait();
    withdrawalText = { text:"Withdrawal complete", url: withdrawal_tx_url }
    setWithdrawStatus(withdrawalText);

    // push the new withdrawal object to the updatedWithdrawals array at the front
    setWithdrawals((currentWithdrawals) => {
      const newWithdrawal = { box: addr, amount: balances[boxes.indexOf(addr)], url: withdrawal_tx_url };
      const updatedWithdrawals = [...currentWithdrawals]; // Create a copy of the withdrawals array
      updatedWithdrawals.unshift(newWithdrawal);
      return updatedWithdrawals;
    });

    setBalances((currentBalances) => {
      const updatedBalances = [...currentBalances]; // Create a copy of the balances array
      updatedBalances.splice(boxes.indexOf(addr), 1);
      return updatedBalances;
    });
    
    setBoxes((currentBoxes) => {
      const updatedBoxes = [...currentBoxes]; // Create a copy of the boxes array
      updatedBoxes.splice(currentBoxes.indexOf(addr), 1);
      return updatedBoxes;
    });

    setWithdrawStatus('');
    setIsWithdrawn(false);
  }

  return (
    <>
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={isWithdrawn}>Withdraw</button>
    </form>
    {withdrawStatus && <a href={withdrawStatus.url}>{withdrawStatus.text}</a>}
    </>
  )
}

/**
 * Renders a connect button
 * @param {Object} props - The component props
 * @param {string} props.buttonValue - The value of the button
 * @param {Function} props.handleConnect - The function to handle the connect button click event
 * @returns {JSX.Element} The rendered connect button
 */
function MyConnectButton({ buttonValue, handleConnect }) {
  return (
    <button onClick={handleConnect}>{buttonValue}</button>
  )
}

/**
 * Renders a form to create a new box
 * @param {Object} props - The component props
 * @param {Function} props.setBoxes - The function to update the box addresses
 * @param {Function} props.setBalances - The function to update the balances
 * @param {Array<Object>} props.pendingCreations - The array of pending creations
 * @param {Function} props.setPendingCreations - The function to update the pending creations
 * @param {Object} props.contract - The ethers.js contract object
 * @returns {JSX.Element} The rendered create box form
 */
function CreateBoxForm({ setBoxes, setBalances, pendingCreations, setPendingCreations, contract }) {
  const [boxCreationPromises, setBoxCreationPromises] = useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    const boxCreationPromise = new Promise((resolve) => {
      contract.once("BoxCreation", async (box) => {
        console.log("heard box creation", box);

        setBoxes((currentBoxes) => [...currentBoxes, box]);
        setBalances((currentBalances) => [...currentBalances, 0.0]);

        console.log("states updated")
        resolve(); // Resolve the promise when the event is handled
      });
    });

    setBoxCreationPromises((currentPromises) => [...currentPromises, boxCreationPromise]);

    const createBoxTx = await contract.createBox();
    const url = `https://sepolia.etherscan.io/tx/${createBoxTx.hash}`;

    setPendingCreations((currentPendingCreations) => {
      const updatedPendingCreations = [...currentPendingCreations]; // Create a copy of the pendingCreations array
      updatedPendingCreations.push({ url:url, hash:createBoxTx.hash });
      return updatedPendingCreations;
    });

    await createBoxTx.wait();
    await boxCreationPromises.shift();

    setPendingCreations((currentPendingCreations) => {
      const updatedPendingCreations = [...currentPendingCreations]; // Create a copy of the pendingCreations array
      updatedPendingCreations.shift();
      return updatedPendingCreations;
    });
  }

  let existingCreations = pendingCreations.length > 0;
  return (
    <>
      <form onSubmit={handleSubmit}>
        <button type="submit" disabled={existingCreations}>Create New Box</button>
      </form>
    </>
  );
};