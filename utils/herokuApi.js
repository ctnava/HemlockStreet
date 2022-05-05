const fs = require('fs');
const { type } = require('os');

const ignored = [
    ".DS_Store", "node_modules", "package-lock.json", "npm-debug.log",
    "yarn.lock", "yarn-debug.log", "yarn-error.log", ".pnp", ".pnp.js",
    "downloads", "uploads", ".env", "api.code-workspace"
];

(() => {
    const sink = "./herokuApi";
    const sinkExists = fs.existsSync(sink);
    if (sinkExists) {
        const allFiles = fs.readdirSync(sink);
        allFiles.forEach(file => { 
            const pathTo = sink + "/" + file;
            const isDir = (fs.lstatSync(pathTo)).isDirectory();
            if (isDir) fs.rmSync(pathTo, {recursive:true});
            else fs.rmSync(pathTo);
        });
    } 


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


    const pkg = JSON.parse(fs.readFileSync(sink + "/package.json"));
    const allPackages = Object.keys(pkg.dependencies);
    allPackages.forEach(name => {
        const herokuSupported = "@chilkat/ck-node16-linux64";
        if (name.includes("@chilkat/ck-node16-") && name !== herokuSupported) {
            pkg.dependencies[herokuSupported] = pkg.dependencies[name];
            delete pkg.dependencies[name];
        }
    });
    console.log(pkg);
    fs.writeFileSync(sink + "/package.json", JSON.stringify(pkg, null, 2));
})();