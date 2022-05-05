function uploadPath(fileName) { return `./uploads/${fileName}` }
function encryptedPath(fileName) { return `./uploads/encrypted/${fileName}` }

function uploadPaths(fileNames) {
    const temp = uploadPath(fileNames.tmp);
    const preview = uploadPath(fileNames.prev);
    const garbage = uploadPath(fileNames.trash);
    const archive = encryptedPath(fileNames.zip);

    const allPaths = {
        tmp: temp,
        prev: preview,
        trash: garbage,
        zip: archive
    };
    
    // console.log(allPaths);
    return allPaths;
}

function uploadedPaths(fileNames) {
    const filePath = uploadPath(fileNames.file);
    const garbage = uploadPath(fileNames.trash);
    const archive = encryptedPath(fileNames.zip);

    const allPaths = {
        file: filePath,
        trash: garbage,
        zip: archive,
    };

    // console.log(allPaths);
    return allPaths;
}

function downloadPath(fileName) { return `./downloads/${fileName}` }
function decryptedPath(fileName) { return `./downloads/decrypted/${fileName}` }

module.exports = { uploadPaths, uploadedPaths }