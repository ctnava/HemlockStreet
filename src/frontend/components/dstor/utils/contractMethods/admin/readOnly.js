

async function expDate(contract, encryptedHash) {
    const expirationDate = await contract.expirationDates(encryptedHash);
    return parseInt(expirationDate.toString());
}