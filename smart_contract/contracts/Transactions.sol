//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Transactions {
    uint256 transactionCount;
    // transfer events
    event Transfer(address from, address receiver, uint amount, string message, uint256 timestamp, string keyword);
    // adding a struct for the group of tansfer properties
    struct TransferStruct {
        address sender;
        address receiver;
        uint amount;
        string message;
        uint256 timestamp;
        string keyword;
    }
    // creating an array of transferStruct
    TransferStruct[] transactions;
    // function to add items to the block chain
    function addToBlockchain(address payable receiver, uint amount, string memory message, string memory keyword) public {
        transactionCount += 1;
        transactions.push(TransferStruct(msg.sender, receiver, amount, message, block.timestamp, keyword));

        emit Transfer(msg.sender, receiver, amount, message, block.timestamp, keyword);
    }
    // functions to get items from the blockchain
    function getAllTransactions() public view returns (TransferStruct[] memory) {
        return transactions;
    }
    // functions to get the number of tansactions that has taken place in the blockchain
    function getTransactionCount() public view returns (uint256){
        return transactionCount;
    }
}