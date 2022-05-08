const fs = require('fs');
const { uploadedPaths } = require("./dirs.js");
const { uploadedLabels, isTemp } = require("./labels.js");
const { getAllPinsExcept, rmPins } = require("../utils/ipfs.js");
const { findAllPins, deleteExpiredPins } = require('./pins.js');

function deleteFiles(fileName, route, res) {
  console.log("Deletion requested...");
  if (fileName === undefined) res.json(`err: fileName undefined @ app.delete('/${route}')`);
  // file, trash, zip
  const pathTo = uploadedPaths(uploadedLabels(fileName));

  if (fs.existsSync(pathTo.file)) fs.unlinkSync(pathTo.file);
  
  if (!isTemp(fileName)) {
    if (fs.existsSync(pathTo.trash)) fs.unlinkSync(pathTo.trash);
    if (fs.existsSync(pathTo.zip)) fs.unlinkSync(pathTo.zip);
  }

  const allDeleted = (
    !fs.existsSync(pathTo.file) && 
    !fs.existsSync(pathTo.trash) && 
    !fs.existsSync(pathTo.zip)
  );

  const response = !allDeleted ? "failed/deletion" : "success";
  res.json(response);
}


function sweepFiles() {
    const withEnc = fs.readdirSync('./temp/deaddrop/uploads');
    const uploads = withEnc.filter(e => {return (e != 'encrypted')});
    // console.log(uploads);
    uploads.forEach(file => {
        try {
            const stats = fs.statSync('./temp/deaddrop/uploads/' + file);
            // console.log(stats.mtime);
            let seconds = (new Date().getTime() - stats.mtime) / 1000;
            const isExpired = (file.slice(0,4) === 'tmp_' && seconds > 5) || 
            (file.slice(file.indexOf("."), file.length - 1) === 'trash' && seconds > 60) || 
            (seconds > 300);
            if (isExpired) fs.unlinkSync('./temp/deaddrop/uploads/' + file);
        } catch(err) {console.log(err)}
    });

    const withActive = fs.readdirSync('./temp/deaddrop/uploads/encrypted');
    const encrypted = withActive.filter(e => {return (e != 'active')});
    // console.log(encrypted);
    encrypted.forEach(file => {
        try {
            const stats = fs.statSync('./temp/deaddrop/uploads/encrypted/' + file);
            // console.log(stats.mtime);
            let seconds = (new Date().getTime() - stats.mtime) / 1000;
            if (seconds > 60) fs.unlinkSync('./temp/deaddrop/uploads/encrypted/' + file);
        } catch(err) {console.log(err)}
    });

    const withDec = fs.readdirSync('./temp/deaddrop/downloads');
    const downloads = withDec.filter(e => {return e != 'decrypted'});
    // console.log(uploads);
    downloads.forEach(file => {
        try {
            const stats = fs.statSync('./temp/deaddrop/downloads/' + file);
            // console.log(stats.mtime);
            let seconds = (new Date().getTime() - stats.mtime) / 1000;
            const isExpired = (seconds > 5);
            if (isExpired) fs.unlinkSync('./temp/deaddrop/downloads/' + file);
        } catch(err) {console.log(err)}
    });

    const decrypted = fs.readdirSync('./temp/deaddrop/downloads/decrypted');
    // console.log(decrypted);
    decrypted.forEach(file => {
        try {
            const stats = fs.statSync('./temp/deaddrop/downloads/decrypted/' + file);
            // console.log(stats.mtime);
            let seconds = (new Date().getTime() - stats.mtime) / 1000;
            if (seconds > 900) fs.rmSync('./temp/deaddrop/downloads/decrypted/' + file, {recursive: true});
        } catch(err) {console.log(err)}
    });
}

async function sweepDB() {
    console.log("Sweeping DB...");
    const [successfulDeletion, noDeletions] = await deleteExpiredPins();
    if (successfulDeletion === false) return false;
    console.log("Successful DB Sweep!");
    if (successfulDeletion === true && noDeletions === true) return true;

    console.log("Sweeping Pins...");
    const remainingPins = await findAllPins();
    console.log("remainingPins", remainingPins.length);

    const remotePins = await getAllPinsExcept('indirect');
    console.log("unmatchedPins:", remotePins.length - remainingPins.length);

    var toKeep = [];
    remainingPins.forEach(entry => {toKeep.push(entry.plain)});
    console.log("keeping:", toKeep.length);

    var toRemove = [];
    remotePins.forEach(pin => {
        if (!toKeep.includes(pin)) toRemove.push(pin)
    });
    console.log("removing:", toRemove.length);

    const successfulRemoval = await rmPins(toRemove);
    return successfulRemoval;
}

async function performSweep() {
    sweepFiles();
    const success = await sweepDB();
    return success;
}


module.exports = { deleteFiles, performSweep }