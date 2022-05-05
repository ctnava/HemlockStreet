const fs = require('fs');


function initTempDirs() {
    if (!fs.existsSync("./uploads/encrypted/active")) { 
        fs.mkdirSync("./uploads/encrypted/active", { recursive: true }) 
    }

    if (!fs.existsSync("./downloads/decrypted")) { 
        fs.mkdirSync("./downloads/decrypted", { recursive: true }) 
    }
}


module.exports = { initTempDirs }