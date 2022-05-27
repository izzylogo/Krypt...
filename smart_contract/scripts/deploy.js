const {ethers} = require("hardhat")

const main = async () => {

  const Transactions = await  ethers.getContractFactory("Transactions");
  // here we deploy the smart contract
  const transactions = await Transactions.deploy();

  // wait for it to finish deploying
  await transactions.deployed();

  // Printing the address of the smart contract
  console.log("Transactions deployed to:", transactions.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });



// YOU CAN ALSO USE THIS FORMAT
// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });
