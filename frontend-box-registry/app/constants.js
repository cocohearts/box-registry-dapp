// export const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
// export const sepoliaContractAddress = "0x789AB964b80a704222F369cDb6E385974DFa2305";
export const sepoliaContractAddress = "0x914eDfb26F40d446B60Bc0a64988E5ef860efD79";
export const localContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const registry_abi = [
    {
        "inputs": [],
        "stateMutability": "payable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
        {
            "indexed": false,
            "internalType": "contract Box",
            "name": "",
            "type": "address"
        }
        ],
        "name": "BoxCreation",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
        {
            "indexed": false,
            "internalType": "contract Box[]",
            "name": "",
            "type": "address[]"
        }
        ],
        "name": "BoxList",
        "type": "event"
    },
    {
        "stateMutability": "payable",
        "type": "fallback"
    },
    {
        "inputs": [],
        "name": "createBox",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getUserBoxes",
        "outputs": [
        {
            "internalType": "contract Box[]",
            "name": "",
            "type": "address[]"
        }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
        {
            "internalType": "address",
            "name": "owner",
            "type": "address"
        },
        {
            "internalType": "uint256",
            "name": "index",
            "type": "uint256"
        }
        ],
        "name": "removeBox",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
        {
            "internalType": "address",
            "name": "",
            "type": "address"
        },
        {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }
        ],
        "name": "userBoxes",
        "outputs": [
        {
            "internalType": "contract Box",
            "name": "",
            "type": "address"
        }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
    ]; 
    export const box_abi = [
    {
        "inputs": [
        {
            "internalType": "contract BoxRegistry",
            "name": "_registry",
            "type": "address"
        },
        {
            "internalType": "uint256",
            "name": "_registryIndex",
            "type": "uint256"
        }
        ],
        "stateMutability": "payable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
        }
        ],
        "name": "Deposit",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
        }
        ],
        "name": "Withdrawal",
        "type": "event"
    },
    {
        "stateMutability": "payable",
        "type": "fallback"
    },
    {
        "inputs": [],
        "name": "getBalance",
        "outputs": [
        {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
]