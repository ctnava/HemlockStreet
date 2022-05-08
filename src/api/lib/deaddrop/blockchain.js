require('dotenv').config();
const messageKey = process.env.BC_KEY;
const { quickDecrypt } = require("../utils/encryption.js");
const { findPin } = require("./pins.js");
const { loadContract, verifySignature, signerAddress } = require("../utils/blockchain.js");


async function getCachedContract(cipher) {
  const unhashed = quickDecrypt(cipher, messageKey);
  const pin = await findPin(unhashed);
  const chainId = (JSON.parse(pin.contract)).chainId;
  return loadContract(chainId, "DStor");
}


async function verifyMessage(cipher, signature) {
  const contract = await getCachedContract(cipher);
  if (contract === "unsupported/chainId") return false;

  const [from, to] = await contract.getAddresses(cipher);
  const isSender = verifySignature(message, signature, from);
  const isReceiver = verifySignature(message, signature, to);

  return (isSender || isReceiver);
}


async function verifyMessages(ciphers, signature) {
  const signerAddr = await signerAddress(ciphers.toString(), signature);
  
  var integrity = [];
  for await (const cipher of ciphers) {
    const contract = await getCachedContract(cipher);
    if (contract === "unsupported/chainId") integrity.push(false);
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


module.exports = { getCachedContract, verifyMessage, verifyMessages }