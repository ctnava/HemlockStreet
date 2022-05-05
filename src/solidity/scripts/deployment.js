const { ethers, artifacts } = require("hardhat");
const { constructorArgs } = require("../utils/constructorArgs");
const fs = require("fs");


async function runDeployment(contractName, chainId) {
  const [deployer] = await ethers.getSigners();
  

  // deploy contracts here:
  const NewFactory = await ethers.getContractFactory(contractName);
  const NewContract = await NewFactory.deploy(...constructorArgs[contractName]);
  console.log(`\n${contractName} deployed to ${NewContract.address}`);
  console.log(`Account balance: ${(await deployer.getBalance()).toString()}`);
  // For each contract, pass the deployed contract and name to this function to save a copy of the contract ABI and address to the front end.
  saveFrontendFiles(NewContract, contractName, chainId);
  return NewContract;
}

function saveFrontendFiles(contract, name, chainId) {
  const clientDir = __dirname + `/../../client/src/data/${chainId}`;
  const apiDir = __dirname + `/../../api/data/${chainId}`;
  if (!fs.existsSync(clientDir)) { fs.mkdirSync(clientDir, { recursive: true }); }
  if (!fs.existsSync(apiDir)) { fs.mkdirSync(apiDir, { recursive: true }); }

  fs.writeFileSync(
    clientDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );
  fs.writeFileSync(
    apiDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    clientDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
  fs.writeFileSync(
    apiDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
  console.log(`${name} deployment data saved to chain directory\n`);
}


module.exports = { runDeployment, saveFrontendFiles };