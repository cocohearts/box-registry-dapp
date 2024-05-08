# Box Registry DApp

Combined Solidity source contract and Next JS frontend allowing interface with the box-registry Sepolia smart contract located [here](https://sepolia.etherscan.io/address/0x892dC5A07F80bAB62Ed2c3B7E53f16e8a497810a).
The box registry allows Sepolia/localhost users to create new boxes, deposit ETH, and withdraw ETH from those boxes.

## Minimal required setup
Add the Metamask extension, connect to the Sepolia Ethereum network, and get Sepolia ETH from the [Alchemy ETH Sepolia faucet](https://www.alchemy.com/faucets/ethereum-sepolia). Then you can start interacting with the online hosted frontend.

## Localhost network setup
Reinstall dependencies in `contract-box-registry` with `npm install`. Then run `npx hardhat node && npx hardhat ignition deploy ignition/modules/BoxRegistry.js --network localhost` to start your localhost Ethereum instance and deploy the box registry to it.
Then using one of the private keys output in console to connect to the localhost network, and start interacting with the frontend on that network. Of course Etherscan links will not work from the localhost network.

## Localhost frontend setup
Reinstall dependencies n `frontend-box-registry` with `npm install`, then run dapp locally with `npm run dev` from `frontend-box-registry/`.
