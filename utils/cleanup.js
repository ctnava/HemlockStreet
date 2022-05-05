function rootPaths(entry) {return [`./${entry}`, `./src/solidity/${entry}`, `./src/api/${entry}`]}
function devNetPaths(entry) {return [`./${entry}`, `./src/solidity/${entry}`, `./src/api/src/${entry}`]}
function sharedPaths(entry, repo) {return [`./${entry}`, `./src/${repo}/${entry}`]}
function unsharedPath(entry, repo) {return `./src/${repo}/${entry}`}
function solidityTrash(entry) {return unsharedPath(entry, "solidity")}

const commonTrash = [
    ...rootPaths(".DS_Store"),
    ...rootPaths("node_modules"),
    ...rootPaths("package-lock.json"),
    ...rootPaths("npm-debug.log"),
    ...rootPaths("yarn.lock"),
    ...rootPaths("yarn-debug.log"),
    ...rootPaths("yarn-error.log"),
    ...rootPaths(".pnp"),
    ...rootPaths(".pnp.js"),
    ...devNetPaths("data/1337"),
    ...devNetPaths("data/31337")
];

const semiExclusiveTrash = [
    ...sharedPaths("build", "client"),
    ...sharedPaths("typechain", "solidity"),
    ...sharedPaths("uploads", "api"),
    ...sharedPaths("downloads", "api")
];

const exclusiveTrash = [
    solidityTrash("artifacts"),
    solidityTrash("cache"),
    solidityTrash("coverage"),
    solidityTrash("coverage.json")
];

const clutterPaths = [
    ...commonTrash,
    ...semiExclusiveTrash,
    ...exclusiveTrash
];


function removeFileOrDirectory(path) {
    const fs = require('fs');
    if(fs.existsSync(path)) {
        const file = fs.lstatSync(path);
        if (!file.isDirectory()) fs.rmSync(path);
        else fs.rmSync(path, { recursive: true });
    }
}


(() => {clutterPaths.forEach(path => removeFileOrDirectory)})();