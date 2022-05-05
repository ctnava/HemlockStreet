require('dotenv').config();
const fs = require('fs');
const { uploadPaths, uploadedPaths } = require("./utils/dirs.js");
const { uploadLabels, uploadedLabels } = require("./utils/labels.js");
const { getContract, verifyMessage, verifyMessages } = require("./utils/blockchain.js");

const { deleteFiles } = require("./utils/cleanup.js");
const { garble, quickDecrypt } = require("./utils/encryption");
const { performSweep } = require("./utils/cleanup.js");
const messageKey = process.env.BC_KEY;

const { 
  decomposeFile, 
  uploadEncrypted, 
  saveAndValidate, 
  updatePin, 
  unpin, 
  extractKey, 
  extractKeys,
  getFile 
} = require("./utils/deadDrop.js");
const { findPin } = require('./utils/pins.js');


function serviceRoutes(app) {
    app.route('/upload')
    .post((req, res) => {
        const { ext, chunk, chunkIndex, totalChunks } = JSON.parse(req.body.toString());
        // idx, num, tot, isFirst, isLast, percent, contents
        const dataChunk = decomposeFile(chunk, chunkIndex, totalChunks);
        // console.log(`Getting Chunk ${dataChunk.num} of ${dataChunk.total} || ${dataChunk.percent}%`);

        // tmp, prev, trash, zip
        const nameFor = uploadLabels(ext, req.ip, totalChunks); 
        const pathTo = uploadPaths(nameFor);
        
        const shouldDelete = (dataChunk.isFirst && fs.existsSync(pathTo.tmp));
        if (shouldDelete === true) fs.unlinkSync(pathTo.tmp);
        fs.appendFileSync(pathTo.tmp, dataChunk.contents);

        if (dataChunk.isLast) {
        fs.renameSync(pathTo.tmp, pathTo.prev);
        res.json({finalName: nameFor.prev});
        } else res.json({tmpName: nameFor.tmp});
    }).delete((req, res) => { deleteFiles(req.body.fileName, "upload", res) });


    app.route('/pin')
    .post((req, res) => {
        const { fileName, contractMetadata, contractInput } = req.body;
        // console.log(contractInput);
        const nameOf = uploadedLabels(fileName);
        const pathTo = uploadedPaths(nameOf);
        const secret = garble(127);
        // console.log("secret", secret); // COMMENT ME BEFORE PROD
        uploadEncrypted(fileName, secret).then(cid => {
        if (fs.existsSync(pathTo.trash)) fs.unlinkSync(pathTo.trash);
        if (fs.existsSync(pathTo.file)) fs.unlinkSync(pathTo.file);
        const entry = [cid, JSON.stringify(contractMetadata), contractInput, secret];
        saveAndValidate(entry, res);
        });
    })
    .patch((req, res) => {
        const { contractMetadata, hash, cipher } = req.body;
        // console.log(contractMetadata);
        if (contractMetadata !== null && contractMetadata !== undefined &&
            hash !== null && hash !== undefined &&
            cipher !== null && cipher !== undefined) {
            const interface = JSON.parse(fs.readFileSync('./lib/data/deadDropInterface.json'));
            const contract = getContract(contractMetadata.address, interface.abi, contractMetadata.chainId);
            const failure = (contract === "unsupported/address" || contract === "unsupported/chainId");
            if (failure === true) res.json("err: bad addr/chainId @ app.patch('/pin')");
            else {
                contract.expirationDates(cipher)
                .then(rawExpDate => {
                    if (rawExpDate === 0) {
                        findPin(quickDecrypt(cipher, messageKey))
                        .then(pin => {
                            const now = Math.floor(Date.now() / 1000);
                            const remainder = pin.expDate - now;
                            if (remainder < 60 && remainder > 0) {
                                updatePin(cipher, (pin.expDate + 900))
                                .then(success => {
                                    if (success === true) res.json("success");
                                    else res.json("err: updatePin @ app.patch('/pin')");
                                });
                            } else res.json("err: already extended @ app.patch('/pin')");
                        });
                    } else res.json("err: cannot extend existing pin @ app.patch('/pin')");
                });
            } 
        } else res.json("err: empty cipher @ app.patch('/pin')");
    })
    .delete((req, res) => {
        const { hash, cipher } = req.body;
        // console.log(req.body);
        unpin(hash, cipher).then(success => {
        if (success === true) res.json("success");
        else res.json("err: unpin @ app.delete('/pin')");
        });
    });


    app.route('/transaction')
    .post((req, res) => {
        const { contractMetadata, hash, cipher } = req.body;
        // console.log(contractMetadata);
        const interface = JSON.parse(fs.readFileSync('./lib/data/deadDropInterface.json'));
        const contract = getContract(contractMetadata.address, interface.abi, contractMetadata.chainId);
        const failure = (contract === "unsupported/address" || contract === "unsupported/chainId");
        if (failure === true) res.json("err: bad addr/chainId @ app.post('/transaction')");
        else {
            contract.expirationDates(cipher).then(rawExpDate => {
                const expDate = parseInt(rawExpDate.toString());
                if (expDate === 0) { 
                unpin(hash, cipher).then(success => {
                    if (success === true) res.json("err: failure to pay");
                    else res.json("err: unpin @ app.post('/transaction')");
                });
                } else {
                updatePin(cipher, expDate).then(success => {
                    if (success === true) res.json("success");
                    else res.json("err: updatePin @ app.post('/transaction')");
                });
                }
            });
        }
    })
    .patch((req, res) => {
        const { contractMetadata, cipher } = req.body;
        // console.log(req.body);
        const interface = JSON.parse(fs.readFileSync('./lib/data/deadDropInterface.json'));
        const contract = getContract(contractMetadata.address, interface.abi, contractMetadata.chainId);
        if (contract === "unsupported/address") res.json("err: bad addr @ app.patch('/transaction')");
        else {
            contract.expirationDates(cipher).then(rawExpDate => {
                const expDate = parseInt(rawExpDate.toString());
                if (expDate !== 0) {
                // console.log(expDate);
                updatePin(cipher, expDate).then(success => {
                    if (success === true) res.json("success");
                    else res.json("err: updatePin @ app.patch('/transaction')");
                });
                }
            });
        }
    });


    app.post('/decipher', (req, res) => {
        const { cipher, signature } = req.body;
        // console.log(req.body);
        if (cipher !== undefined && cipher !== null
        && signature !== undefined && signature !== null) {
            verifyMessage(cipher, signature).then((verdict) => {
            if (verdict === true) {
                extractKey(cipher, res);
            } else res.json("err: signature failure @ app.post('/decipher')");
            });
        } else res.json("err: empty cipher @ app.post('/decipher')");
    });


    app.post('/batchDecipher', (req, res) => {
        const { ciphers, signature } = req.body;
        // console.log(req.body);
        if (ciphers !== undefined && ciphers !== null
        && signature !== undefined && signature !== null) {
            verifyMessages(ciphers, signature).then((verdict) => {
            if (verdict === true) {
                extractKeys(ciphers, res);
            } else res.json("err: signature failure @ app.post('/batchDecipher')");
            });
        } else res.json("err: empty cipher @ app.post('/batchDecipher')");
    });


    app.route('/download')
    .post((req, res) => {
        const { cipher, signature, fileName } = req.body;
        // console.log(req.body);
        const emptyInputs = (cipher === undefined || cipher === null) ||
        (signature === undefined || signature === null) ||
        (fileName === 'undefined.undefined' || fileName === undefined || fileName === null);
        if (emptyInputs) res.json("err: empty cipher @ app.post('/download')");
        else {
            verifyMessage(cipher, signature).then((verdict) => {
                if (verdict !== true) res.json("err: signature failure @ app.post('/download')");
                else {
                getFile(cipher, fileName).then(cid => {
                    if (cid !== false) res.status(200).json(`${cid}`);
                    else res.json("err: Pin.findOne @ app.post('/download')");
                });
                }
            });
        }
    })
    .delete((req, res) => {
        const { cid } = req.body;
        try {
            fs.rmSync(`./downloads/decrypted/${cid}`, { recursive: true });
            res.json("success");
        } catch (err) { res.json(err) }
    });
}


function maintainenceRoutes(app) {
    var activeSweep = false; 
    app.post("/sweep", (req, res) => {
        if (activeSweep === true) res.json('err: already active');
        else {
            activeSweep = true;
            performSweep()
            .then((success) => {
                activeSweep = false;
                if (success === true) res.json("success");
                else res.json("err: searchDB @ app.post('/sweep')"); 
            });
        }
    });
}


function routeServices(app) {
    serviceRoutes(app);
    maintainenceRoutes(app);
}


module.exports = { routeServices }