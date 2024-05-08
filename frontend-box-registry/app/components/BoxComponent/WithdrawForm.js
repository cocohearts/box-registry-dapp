import { ethers, EtherscanLink, GetProviderSigner, useState } from '../../utils';
import { box_abi } from '../../constants';

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
export function WithdrawForm({ addr, balances, setBalances, boxes, setBoxes, setWithdrawals, blocked, setBlocked }) {
  const [withdrawText, setWithdrawText] = useState();
  const [withdrawHash, setWithdrawHash] = useState();

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    const { provider, signer } = await GetProviderSigner();
    const contract = new ethers.Contract(addr, box_abi, signer);
    let withdrawal_tx = await contract.withdraw({ gasLimit: 100000 });
    console.log("withdrawal transaction sent");
    setWithdrawHash(withdrawal_tx.hash);
    setWithdrawText(`Withdrawal transaction pending`);

    setBlocked(true);

    await withdrawal_tx.wait();
    console.log("withdrawal transaction confirmed");
    setWithdrawText(`Withdrawal transaction confirmed`);

    // push the new withdrawal object to the updatedWithdrawals array at the front
    setWithdrawals((currentWithdrawals) => {
      const newWithdrawal = { box: addr, amount: balances[boxes.indexOf(addr)] };
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

    setBlocked(false);
  }

  return (
    <>
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={blocked}>Withdraw</button>
    </form>
    {withdrawHash && <EtherscanLink txHash={withdrawHash} text={withdrawText} />}
    </>
  )
}