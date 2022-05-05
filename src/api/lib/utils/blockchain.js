require('dotenv').config();
const fs = require("fs");
const { quickDecrypt } = require("../utils/encryption.js");
const { findPin } = require("../utils/pins.js");
const { ethers } = require("ethers");
const mNodeKey = process.env.MORALIS_KEY;
const aMNodeKey = process.env.ALCHEMY_OPTM_KEY;
const aTNodeKey = process.env.ALCHEMY_OPTT_KEY;


const invalidChain = "unsupported/chainId";
function getProvider(chainId) {
  // console.log("chainId:",chainId, typeof chainId);
  // console.log(chainId === 4);
  const isDev = (chainId === 31337 || chainId === 1337);
  // console.log(isDev); // COMMENT ME BEFORE PROD
  if (isDev) return new ethers.providers.JsonRpcProvider();
  else {
    const mRegions = ["speedy-nodes-nyc"];
    const mUrl = `https://${mRegions[0]}.moralis.io/${mNodeKey}/`;
    const aUrl = `g.alchemy.com/v2/`;
    switch (chainId) {
      case 1:
        return new ethers.providers.JsonRpcProvider(mUrl + "eth/mainnet");
	    case 10:
        return new ethers.providers.JsonRpcProvider("https://opt-mainnet." + aUrl + aMNodeKey);
      case 3:
        return new ethers.providers.JsonRpcProvider(mUrl + "eth/ropsten");
      case 4:
        return new ethers.providers.JsonRpcProvider(mUrl + "eth/rinkeby");
      case 42:
        return new ethers.providers.JsonRpcProvider(mUrl + "eth/kovan");
      case 420:
        return new ethers.providers.JsonRpcProvider(mUrl + "eth/goerli");
      case 69:
        return new ethers.providers.JsonRpcProvider("https://opt-kovan." + aUrl + aTNodeKey);


      case 42161:
        return new ethers.providers.JsonRpcProvider(mUrl + "arbitrum/mainnet");
      case 421611:
        return new ethers.providers.JsonRpcProvider(mUrl + "arbitrum/testnet");


      case 56:
        return new ethers.providers.JsonRpcProvider(mUrl + "bsc/mainnet");
      case 97:
        return new ethers.providers.JsonRpcProvider(mUrl + "bsc/testnet");


      case 137:
        return new ethers.providers.JsonRpcProvider(mUrl + "polygon/mainnet");
      case 80001:
        return new ethers.providers.JsonRpcProvider(mUrl + "polygon/mumbai");  


      case 43114:
        return new ethers.providers.JsonRpcProvider(mUrl + "avalanche/mainnet");
      case 43113:
        return new ethers.providers.JsonRpcProvider(mUrl + "avalanche/testnet");


      case 250:
        return new ethers.providers.JsonRpcProvider(mUrl + "fantom/mainnet");


      default:
        return invalidChain;
    }
  }
}


function checkDropAddress(address, chainId) {
  const pathToAddress = `./data/${chainId}/DStor-address.json`;
  if (!fs.existsSync(pathToAddress)) return false;
  const cachedAddress = (JSON.parse(fs.readFileSync(pathToAddress))).address;
  return (cachedAddress === address);
}


function getContract(address, abi, chainId) {
  const isValid = checkDropAddress(address, chainId);
  if (isValid === false) return "unsupported/address"; 
  const provider = getProvider(chainId);
  if (provider === invalidChain) return invalidChain;
  else return new ethers.Contract(address, abi, provider);
}


// PROBLEM_CHILD
const messageKey = process.env.BC_KEY;
async function getCachedContract(cipher) {
  // console.log("cipher:", cipher);
  const unhashed = quickDecrypt(cipher, messageKey);
  // console.log("unhashed:", unhashed);
  const pin = await findPin(unhashed);
  // console.log("pin:", pin);
  const chainId = (JSON.parse(pin.contract)).chainId;
  // console.log("metadata:", metadata);
  const provider = getProvider(chainId);
  const abi = (JSON.parse(fs.readFileSync(`./data/${chainId}/DStor.json`))).abi;
  const address = (JSON.parse(fs.readFileSync(`./data/${chainId}/DStor-address.json`))).address;
  if (provider === invalidChain) return invalidChain;
  else return new ethers.Contract(address, abi, provider);
}


async function verifyMessage(cipher, signature) {
  const contract = await getCachedContract(cipher);
  if (contract === invalidChain) return false;
  try {
    const [from, to] = await contract.getAddresses(cipher);
    const signerAddr = await ethers.utils.verifyMessage(cipher, signature);
    const isValid = (signerAddr === from || signerAddr === to);
    return isValid;
  } catch (err) {
    console.log(err);
    return false;
  }
}


async function verifyMessages(ciphers, signature) {
  const signerAddr = await ethers.utils.verifyMessage(ciphers.toString(), signature);
  var integrity = [];
  for await (const cipher of ciphers) {
    const contract = await getCachedContract(cipher);
    if (contract === invalidChain) integrity.push(false);
    else {
      try {
        const [from, to] = await contract.getAddresses(cipher);
        const isValid = (signerAddr === from || signerAddr === to);
        integrity.push(isValid);
      } catch (err) {
        console.log(err);
        integrity.push(false);
      }
    }
  }
  const allValid = !integrity.includes(false);
  return allValid;
}


module.exports = { getProvider, getContract, verifyMessage, verifyMessages }