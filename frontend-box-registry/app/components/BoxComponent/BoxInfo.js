import { ethers, EtherscanLink, GetProviderSigner } from '../../utils';

/**
 * Renders information about a specific box including its address and balance.
 * @param {Object} props - The props object containing box and balance values.
 * @param {string} props.box - The address of the box.
 * @param {number} props.balance - The balance of the box.
 * @returns {JSX.Element} React component displaying box information with a link to Etherscan.
 */
export function BoxInfo({ box, balance }) {
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