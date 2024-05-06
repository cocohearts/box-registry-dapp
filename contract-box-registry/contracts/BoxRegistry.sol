// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Box {
    address payable internal immutable owner;
    BoxRegistry registry;

    event Withdrawal(uint amount);
    event Deposit(uint amount);

    constructor(BoxRegistry _registry, address payable _owner) payable {
        owner = _owner;
        registry = _registry;
    }

    modifier onlyOwner {
        require(payable(msg.sender)==owner, "Must be owner");
        _;
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        owner.transfer(address(this).balance);
        registry.removeBox(owner);
        emit Withdrawal(amount);
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
        Box newBox = new Box(this,payable(msg.sender));
        userBoxes[msg.sender].push(newBox);
        emit BoxCreation(newBox);
    }

    // Function to get the list of Box contracts created by the sender
    function getUserBoxes() public returns (Box[] memory) {
        emit BoxList(userBoxes[msg.sender]);
        return userBoxes[msg.sender];
    }

    function removeBox(address owner) public {
        uint256 index=0;
        while (index<userBoxes[owner].length) {
            if (address(userBoxes[owner][index])==msg.sender) break;
            index++;
        }
        require(index<userBoxes[owner].length, "Box not found");
        for (uint256 i=index; i<userBoxes[owner].length-1; i++) {
            userBoxes[owner][i] = userBoxes[owner][i+1];
        }
        userBoxes[owner].pop();
    }

    fallback() external payable {}

    receive() external payable {}
}