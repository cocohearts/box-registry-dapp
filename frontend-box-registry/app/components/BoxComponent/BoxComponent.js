import { ethers, EtherscanLink, GetProviderSigner, useState } from '../../utils';
import { BoxInfo } from './BoxInfo';
import { DepositForm } from './DepositForm';
import { WithdrawForm } from './WithdrawForm';

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
export function BoxComponent({ box, balances, setBalances, boxes, setBoxes, setWithdrawals}) {
  const [blocked, setBlocked] = useState(false);
  return (
    <> 
      <BoxInfo box={box} balance={ethers.utils.formatEther(balances[boxes.indexOf(box)])} />
      <DepositForm key={box} addr={box} boxes={boxes} balances={balances} setBalances={setBalances} blocked={blocked} setBlocked={setBlocked}/>
      <WithdrawForm key={box+1} addr={box} balances={balances} setBalances={setBalances} boxes={boxes} setBoxes={setBoxes} setWithdrawals={setWithdrawals} blocked={blocked} setBlocked={setBlocked}/>
    </>
  )
}