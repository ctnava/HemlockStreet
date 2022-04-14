const { runDeployment, saveFrontendFiles } = require("./deployment");
const { ethers } = require("hardhat");

async function deployAll() {
    const DStor = await runDeployment("DStor");
    const PLS = await runDeployment("PolygonLinkSim");
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());
    // deploy contracts here:
    const FissionEngineFactory = await ethers.getContractFactory("FissionEngine");
    const FissionEngine = await FissionEngineFactory.deploy(PLS.address, DStor.address);
    console.log(`FissionEngine deployed to ${FissionEngine.address}\n`);
    // For each contract, pass the deployed contract and name to this function to save a copy of the contract ABI and address to the front end.
    let provider = new ethers.providers.JsonRpcProvider();
    const { chainId } = await provider.getNetwork()
    saveFrontendFiles(FissionEngine, "FissionEngine", chainId);
    await DStor.setFission(FissionEngine.address);
    console.log("Fission Engine Linked to DStor");
};

deployAll()