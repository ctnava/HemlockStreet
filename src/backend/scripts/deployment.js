const { ethers, artifacts } = require("hardhat");
const { constructorArgs } = require("../utils/constructorArgs");


async function runDeployment(contractName) {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contracts here:
  const NewFactory = await ethers.getContractFactory(contractName);
  const NewContract = await NewFactory.deploy(...constructorArgs[contractName]);
  
  console.log(`${contractName} deployed to ${NewContract.address}\n`);
  
  // For each contract, pass the deployed contract and name to this function to save a copy of the contract ABI and address to the front end.
  let provider = new ethers.providers.JsonRpcProvider();
  const { chainId } = await provider.getNetwork()
  saveFrontendFiles(NewContract, contractName, chainId);
}

function saveFrontendFiles(contract, name, chainId) {
  const fs = require("fs");
  const contractsDir = __dirname + `/../../frontend/contractsData`;
  const chainDir = contractsDir + `/${chainId}`;

  if (!fs.existsSync(contractsDir)) { fs.mkdirSync(contractsDir); }
  if (!fs.existsSync(chainDir)) { fs.mkdirSync(chainDir); }

  fs.writeFileSync(
    chainDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    chainDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
}

function deployContract(contractName) {
	runDeployment(contractName)
	  .then(() => process.exit(0))
	  .catch(error => {
	    console.error(error);
	    process.exit(1);
	  });
}


module.exports = { deployContract };