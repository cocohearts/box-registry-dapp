import { ethers, EtherscanLink, GetProviderSigner, useState } from '../utils';

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
export function CreateBoxForm({ setBoxes, setBalances, pendingCreations, setPendingCreations, contract }) {
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

    const createBoxTx = await contract.createBox();
    console.log("create box transaction sent");

    setPendingCreations((currentPendingCreations) => {
      const updatedPendingCreations = [...currentPendingCreations]; // Create a copy of the pendingCreations array
      updatedPendingCreations.push({ hash:createBoxTx.hash });
      return updatedPendingCreations;
    });

    await createBoxTx.wait();
    console.log("create box transaction confirmed");
    await boxCreationPromise;

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
}