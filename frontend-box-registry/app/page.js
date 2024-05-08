/**
 * @file FILEPATH: /Users/alex-zhao/Coding/crypto/box-registry-dapp/frontend-box-registry/app/page.js
 * @desc This file contains the implementation of the Home component, which serves as the main page of the Box Registry application.
 * The Home component displays a list of boxes and provides functionality to connect to a provider, deposit funds, withdraw funds, and create new boxes.
 * It also includes helper functions for interacting with the Ethereum network using ethers.js library.
 */

'use client'

import React, { useState } from 'react';
const ethers = require("ethers");
import { GetProviderSigner, EtherscanLink } from "./utils";
import { ConnectButton } from "./components/ConnectButton.js";
import { BoxComponent } from "./components/BoxComponent/BoxComponent.js";
import { CreateBoxForm } from "./components/CreateBoxForm.js";


/**
 * Home component
 * @returns {JSX.Element} The rendered Home component
 */
export default function Home() {
  const [boxes, setBoxes] = useState([]);
  const [balances, setBalances] = useState([]);
  const [connectionText, setConnectionText] = useState();
  const [connectionHash, setConnectionHash] = useState();
  const [buttonValue, setButtonValue] = useState('Connect');
  const [contractState, setContractState] = useState();
  const [withdrawals, setWithdrawals] = useState([]);
  const [pendingCreations, setPendingCreations] = useState([]);

  const [account, setAccount] = useState();
  const [network_name, setNetworkName] = useState();

  return (
    <>
      <title>Box Registry</title>
      <h1>Box Registry</h1>
      <p>
        <a href='https://github.com/cocohearts/box-registry-dapp/blob/main/README.md'>README</a>
        <br/>
        Open console for logs
      </p>
      <ConnectButton 
        buttonValue={buttonValue} 
        setBalances={setBalances} 
        setBoxes={setBoxes}
        setContractState={setContractState}
        setAccount={setAccount}
        setNetworkName={setNetworkName}
        setConnectionHash={setConnectionHash}
        setConnectionText={setConnectionText}
        setButtonValue={setButtonValue}
      />
      <p>
        {connectionHash ? 
        <>
          <EtherscanLink txHash={connectionHash} text={connectionText} />
          <br/>
          Your account: {network_name=="Sepolia" ? <a href={ `https://sepolia.etherscan.io/address/${account}`} target="_blank" rel="noopener noreferrer">{account}</a> : <>{account}</>} on {network_name} network
        </> 
        : null}
      </p>
      {contractState && boxes.length === 0 && <p>No boxes found</p>}
      {boxes.map((box) => (
        <BoxComponent key={box} box={box} balances={balances} setBalances={setBalances} boxes={boxes} setBoxes={setBoxes} setWithdrawals={setWithdrawals} />
      ))}
      
      <p key="completed_withdrawals">
        {withdrawals.map((withdrawal) => (
          <>
            <EtherscanLink key={withdrawal.box} txHash={withdrawal.box} text={`Withdrawal from box ${withdrawal.box} for ${ethers.utils.formatEther(withdrawal.amount)}`} />
            <br/>
          </>
        ))}
      </p>
      {contractState && <CreateBoxForm setBoxes={setBoxes} setBalances={setBalances} pendingCreations={pendingCreations} setPendingCreations={setPendingCreations} contract={contractState} />}
      
      {pendingCreations.map((creation) => (
        <p key={creation.hash}><EtherscanLink txHash={creation.hash} text={`Box creation pending, tx hash ${creation.hash}`} /></p>
      ))}
      
    </>
  );
}