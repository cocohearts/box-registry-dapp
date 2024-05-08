import { ethers, EtherscanLink, GetProviderSigner, useState } from '../../utils';

/**
 * Renders a deposit form for a specific box
 * @param {Object} props - The component props
 * @param {string} props.addr - The address of the box
 * @param {Array<string>} props.boxes - The array of box addresses
 * @param {Function} props.setBalances - The function to update the balances
 * @param {boolean} props.isWithdrawn - The boolean value to check if the box has been withdrawn from
 * @returns {JSX.Element} The rendered deposit form
 */
export function DepositForm({ addr, boxes, setBalances, blocked, setBlocked}) {
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
    console.log("deposit transaction sent");


    setDepositTxHash(newDepositTx['hash']);
    setDepositTxText(`Deposit of ${inputValue} pending`);
    setInputValue('');

    await newDepositTx.wait();
    console.log("deposit transaction confirmed");
    setBlocked(true);

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
    setBlocked(false);
  };

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label htmlFor="depositInput">Add more:</label>
        <br/>
        <input
          type="text"
          id="depositInput"
          value={inputValue}
          onChange={handleChange}
        />
        <br/>
        <button type="submit" disabled={blocked}>Deposit</button>
      </form>
      {depositTxHash && <EtherscanLink txHash={depositTxHash} text={depositTxText} />}
    </>
  );
}