// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Box {
    address payable internal immutable owner;
    BoxRegistry registry;
    uint256 registryIndex;

    event Withdrawal(uint amount);
    event Deposit(uint amount);

    constructor(BoxRegistry _registry, uint256 _registryIndex) payable {
        owner = payable(msg.sender);
        registry = _registry;
        registryIndex = _registryIndex;
    }

    modifier onlyOwner {
        require(msg.sender==owner);
        _;
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        owner.transfer(address(this).balance);
        registry.removeBox(owner,registryIndex);
        emit Withdrawal(amount);
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    fallback() external payable {emit Deposit(msg.value);}

    receive() external payable {emit Deposit(msg.value);}
}

contract BoxRegistry {
    // Mapping to store the Box contracts created by each user
    mapping(address => Box[]) public userBoxes;
    event BoxCreation(Box);
    event BoxList(Box[]);

    constructor() payable {}

    // Function to create a new Box contract and add it to the user's list of boxes
    function createBox() public {
        Box newBox = new Box(this,userBoxes[msg.sender].length);
        userBoxes[msg.sender].push(newBox);
        emit BoxCreation(newBox);
    }

    // Function to get the list of Box contracts created by the sender
    function getUserBoxes() public returns (Box[] memory) {
        emit BoxList(userBoxes[msg.sender]);
        return userBoxes[msg.sender];
    }

    function removeBox(address owner, uint256 index) public {
        require(msg.sender == address(userBoxes[owner][index]));
        for (uint256 i=index; i<userBoxes[owner].length-1; i++) {
            userBoxes[owner][i] = userBoxes[owner][i+1];
        }
        userBoxes[owner].pop();
    }

    fallback() external payable {}

    receive() external payable {}
}