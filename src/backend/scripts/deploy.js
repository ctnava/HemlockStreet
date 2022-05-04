const { runDeployment, saveFrontendFiles } = require("./deployment");
const { ethers } = require("hardhat");

const oracles = require("../utils/oracles");
const getProvider = require("../utils/provider");

async function deployAll() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    const provider = getProvider(chainId);
    const { chainId } = await provider.getNetwork();

    
    let PLS;
    const isDev = (chainId === 31337 || chainId === 1337);
    if (isDev) PLS = await runDeployment("PolygonLinkSim", chainId);
    const plsSet = (PLS !== undefined);
    const oracle = (plsSet) ? PLS.address : oracles[chainId.toString()];


    const DStor = await runDeployment("DStor", chainId);
    const FissionEngineFactory = await ethers.getContractFactory("FissionEngine");
    const FissionEngine = await FissionEngineFactory.deploy(oracle, DStor.address);
    saveFrontendFiles(FissionEngine, "FissionEngine", chainId);
    console.log(`FissionEngine deployed to ${FissionEngine.address}\n`);
    await DStor.setFission(FissionEngine.address);
    console.log("Fission Engine Linked to DStor");


    const accountBalance = (await deployer.getBalance()).toString();
    console.log(`Account balance: ${accountBalance}`);
}

deployAll()