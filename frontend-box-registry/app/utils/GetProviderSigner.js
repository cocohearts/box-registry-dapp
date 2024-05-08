import { ethers } from "ethers";

/**
 * Retrieves the provider and signer for interacting with the Ethereum network
 * @returns {Promise<{provider: ethers.providers.Web3Provider, signer: ethers.Signer}>} A promise that resolves with the provider and signer objects
 */
export async function GetProviderSigner() {
  let provider, signer;
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" })
    } catch (error) {
      console.error("Account request error:", error)
    }
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
  } else {
    console.error("Install MetaMask")
  }
  return { provider,signer };
}