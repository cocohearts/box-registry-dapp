import { ethers, GetProviderSigner } from '../utils';
import { localContractAddress, sepoliaContractAddress, registry_abi } from '../constants';

/**
 * Renders a connect button
 * @param {Object} props - The component props
 * @param {string} props.buttonValue - The value of the button
 * @param {Function} props.handleConnect - The function to handle the connect button click event
 * @returns {JSX.Element} The rendered connect button
 */
export function ConnectButton({ buttonValue, setBalances, setBoxes, setContractState, setAccount, setAccountURL, setNetworkName, setConnectionHash, setConnectionText, setButtonValue }) {
  /**
   * Handles the connect button click event
   * @returns {Promise<void>} A promise that resolves when the connection is established
   */
  let contractAddress;

  const handleConnect = async () => {
    const { provider, signer } = await GetProviderSigner();
    const accounts = await provider.listAccounts();
    console.log("Connected with accounts:", accounts)
    const network = await provider.getNetwork();
    const accountAddress = await signer.getAddress();
    const account_url = `https://sepolia.etherscan.io/address/${accountAddress}`;
    setAccount(accountAddress);
    setAccountURL(account_url);
    switch (network.chainId) {
      case 31337: // Local network chain ID
        contractAddress = localContractAddress;
        setNetworkName("localhost");
        console.log(`Your account: ${accountAddress} on localhost network`);
        break;
      case 11155111: // Sepolia network chain ID
        contractAddress = sepoliaContractAddress;
        setNetworkName("Sepolia");
        console.log(`Your account: ${accountAddress} on Sepolia network`);
        break;
      default:
        console.error('Unsupported network, not Sepolia or hardhat localhost');
        break;
    }

    let registryContract = new ethers.Contract(contractAddress, registry_abi, signer);

    const boxListPromise = new Promise((resolve) => {
      registryContract.once("BoxList", async (boxes) => {
        console.log("heard list of boxes", boxes);
        let newBalances = [];
        for (let index in boxes) {
          const balance = await provider.getBalance(boxes[index]);
          newBalances.push(balance);
        }
        console.log("balances", newBalances);
        setBalances(newBalances);
        setBoxes(boxes);
        setContractState(registryContract);
        resolve(); // Resolve the promise when the event is handled
      });
    });

    const box_addresses = await registryContract.getUserBoxes();
    setConnectionHash(box_addresses.hash);
    console.log("connecting transaction sent");
    setConnectionText("Connecting transaction pending, please wait");
    await box_addresses.wait();
    console.log("connecting transaction confirmed");

    await boxListPromise;
    setConnectionText("Connecting transaction completed");

    setContractState(registryContract);
    setButtonValue("Refresh registry");
  };

  return (
    <button onClick={handleConnect}>{buttonValue}</button>
  )
}