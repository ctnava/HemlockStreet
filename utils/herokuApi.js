const fs = require('fs');

const ignored = [
    ".DS_Store", "node_modules", "package-lock.json", "npm-debug.log",
    "yarn.lock", "yarn-debug.log", "yarn-error.log", ".pnp", ".pnp.js",
    "downloads", "uploads", ".env", "api.code-workspace",
    "package.json"
];

(() => {
    const sink = "./herokuApi";
    const sinkExists = fs.existsSync(sink);
    if (sinkExists) {
        const allFiles = fs.readdirSync(sink);
        allFiles.forEach(file => { 
            if (file !== "package.json") {
                const pathTo = sink + "/" + file;
                const isDir = (fs.lstatSync(pathTo)).isDirectory();
                if (isDir) fs.rmSync(pathTo, {recursive:true});
                else fs.rmSync(pathTo);
            }
        });
    } else fs.cpSync(source + "/package.json", sink + "/package.json");


    const source = "./src/api";
    const allFiles = fs.readdirSync(source);
    allFiles.forEach(file => {
        if (!ignored.includes(file)) {
            const pathTo = source + "/" + file;
            const end = sink + "/" + file;
            const isDir = (fs.lstatSync(pathTo)).isDirectory();
            if (!isDir) fs.cpSync(pathTo, end);
            else fs.cpSync(pathTo, end, {recursive:true});
        }
    });
    

    const dev1337 = sink + "/data/1337"
    const dev31337 = sink + "/data/31337"
    if (fs.existsSync(dev1337)) fs.rmSync(dev1337, {recursive:true});
    if (fs.existsSync(dev31337)) fs.rmSync(dev31337, {recursive:true});


    // compare "package.json"
    if (sinkExists) {
        const current = JSON.parse(fs.readFileSync(source + "/package.json"));
        const incumbent = JSON.parse(fs.readFileSync(sink + "/package.json"));
        // compare states
    } else {
        // fix chilkat import
    }
})();