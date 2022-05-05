const fs = require('fs');


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


(() => {
    clutterPaths.forEach(pathToClutter => {
        if(fs.existsSync(pathToClutter)) {
            const isFile = fs.pathIsFile(pathToClutter);
            if (isFile) fs.rmSync(pathToClutter);
            else fs.rmSync(pathToClutter, { recursive: true });
        }
    })
})();