/**
 * Renders a link to the Etherscan transaction page
 * @param {string} txHash - The transaction hash
 * @param {string} text - The text to display for the link
 * @returns {JSX.Element} The rendered link to the Etherscan transaction page
 */
export function EtherscanLink({ txHash, text }) {
  let url = `https://sepolia.etherscan.io/tx/${txHash}`;
  return (
    <a href={url}>{text}</a>
  )
}