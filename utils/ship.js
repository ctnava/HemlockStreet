const fs = require('fs');
function stageApi() {
    console.log("\nPreparing API for Heroku Deployment...\n");


    const sink = "./herokuApi";
    if (fs.existsSync(sink)) {
        console.log("Previous build detected! Wiping...");
        const allFiles = fs.readdirSync(sink);
        allFiles.forEach(file => { 
            if (file !== ".git") {
                const pathTo = sink + "/" + file;
                const isDir = (fs.lstatSync(pathTo)).isDirectory();
                if (isDir) fs.rmSync(pathTo, {recursive:true});
                else fs.rmSync(pathTo);
            }
        });
    } else fs.mkdirSync(sink);

    
    const source = "./src/api";
    console.log("Scanning API root...");
    const allFiles = fs.readdirSync(source);
    console.log(`${allFiles.length} paths detected.`);
    var accepted = 0;
    allFiles.forEach(file => {
        const ignored = [ ".git",
            ".DS_Store", "node_modules", "package-lock.json", "npm-debug.log",
            "yarn.lock", "yarn-debug.log", "yarn-error.log", ".pnp", ".pnp.js",
            "downloads", "uploads", ".env", "api.code-workspace"
        ];
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


const os = require('os');
const { execSync, spawn } = require('child_process');
const projectDir = __dirname.slice(0, __dirname.length - 6);
function validateRepo() {
    try {
        execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
        const parts = ((execSync('git remote -v').toString()).split(" ")[0]).split("/");
        const repoName = parts[parts.length - 1];
        if (repoName !== "HemlockStreet.git") throw "name mismatch";
        return;
    } catch (err) {
        console.log("\nInvalid Repository..."); 
        process.exit(1);
    }
}


const executePs1 = (script) => new Promise((resolve) => {
    shipStat = spawn("powershell.exe",[`${projectDir}/bin/${script}.ps1`]);
    shipStat.stdout.on("data", (data)=>{console.log("stdout: " + data)});
    shipStat.stderr.on("data", (data)=>{console.log("stderr: " + data)});
    shipStat.on("exit", ()=>{resolve()});
});


async function pushApiWin32() {
    var stat = "";
    await new Promise((resolve) => {
        shipStat = spawn("powershell.exe",[`${projectDir}/bin/shipStat.ps1`]);
        shipStat.stdout.on("data", (data)=>{stat = stat.concat(data)});
        shipStat.stderr.on("data", (data)=>{console.log("stderr: " + data)});
        shipStat.on("exit", ()=>{resolve()});
    });
    const pushNeeded = (stat.split("\n")[3] !== 'nothing to commit, working tree clean');
    console.log(pushNeeded);
    // if (pushNeeded) {
    //     if (os.platform() === "win32") {
    //         ship = spawn("powershell.exe",[`${projectDir}bin/ship.ps1`]);
    //         ship.stdout.on("data", (data)=>{console.log(data.toString())});
    //         ship.stderr.on("data", (data)=>{console.log("stderr: " + data)});
    //         ship.on("exit",()=>{console.log("Script Executed")});
    //     }
    // } else console.log("Deployment not necessary! Exiting...");
}

function ship() {
    validateRepo(); 
    stageApi(); 
    if (os.platform() === "win32") pushApiWin32();   
    else return; 
}


ship();