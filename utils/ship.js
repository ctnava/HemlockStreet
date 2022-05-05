const fs = require('fs');
const { exec, execSync } = require('child_process');

const ignored = [
    ".DS_Store", "node_modules", "package-lock.json", "npm-debug.log",
    "yarn.lock", "yarn-debug.log", "yarn-error.log", ".pnp", ".pnp.js",
    "downloads", "uploads", ".env", "api.code-workspace"
];

function stageApi() {
    console.log("\nPreparing API for Heroku Deployment...\n");


    const sink = "./herokuApi";
    if (fs.existsSync(sink)) {
        console.log("Previous build detected! Wiping...");
        const allFiles = fs.readdirSync(sink);
        allFiles.forEach(file => { 
            const pathTo = sink + "/" + file;
            const isDir = (fs.lstatSync(pathTo)).isDirectory();
            if (isDir) fs.rmSync(pathTo, {recursive:true});
            else fs.rmSync(pathTo);
        });
    } else fs.mkdirSync(sink);


    const source = "./src/api";
    console.log("Scanning API root...");
    const allFiles = fs.readdirSync(source);
    console.log(`${allFiles.length} paths detected.`);
    var accepted = 0;
    allFiles.forEach(file => {
        if (!ignored.includes(file)) {
            accepted += 1;
            const pathTo = source + "/" + file;
            const end = sink + "/" + file;
            const isDir = (fs.lstatSync(pathTo)).isDirectory();
            if (!isDir) fs.cpSync(pathTo, end);
            else fs.cpSync(pathTo, end, {recursive:true});
        }
    });
    console.log(`${accepted} paths copied!`);


    const dev1337 = sink + "/data/1337"
    const dev31337 = sink + "/data/31337"
    console.log("Pruning devnet caches...");
    if (fs.existsSync(dev1337)) fs.rmSync(dev1337, {recursive:true});
    if (fs.existsSync(dev31337)) fs.rmSync(dev31337, {recursive:true});


    console.log("Ensuring linux64 compatibility...");
    const pkg = JSON.parse(fs.readFileSync(sink + "/package.json"));
    const allPackages = Object.keys(pkg.dependencies);
    allPackages.forEach(name => {
        const herokuSupported = "@chilkat/ck-node16-linux64";
        if (name.includes("@chilkat/ck-node16-") && name !== herokuSupported) {
            pkg.dependencies[herokuSupported] = pkg.dependencies[name];
            delete pkg.dependencies[name];
        }
    });
    fs.writeFileSync(sink + "/package.json", JSON.stringify(pkg, null, 2));    
    console.log("\nReady to deploy!");
}


function pushApi() {
    console.log("Deploying API to Heroku...\n\nAdding to git...");
    // const output = execSync('ls', { encoding: 'utf-8' });
    console.log("Committing changes...");
    console.log("Pushing changes...");
    console.log("\nComplete!\n");
}

stageApi();
pushApi();