const git = require('../shell/git.js');
const fs = require('fs');


async function localDeletion(branch) {
    console.log("\nroot");
    await git.deleteLocal("root", branch);
    const subRepos = (fs.readdirSync("./src")).filter(repo => !repo.includes("."));
    for await (const repo of subRepos) {
        console.log(`${repo}`);
        await git.deleteLocal(`src/${repo}`, branch);
    }
    return;
}

async function localDeletion(branch) {
    console.log("\nroot");
    await git.deleteRemote("root", branch);
    const subRepos = (fs.readdirSync("./src")).filter(repo => !repo.includes("."));
    for await (const repo of subRepos) {
        console.log(`${repo}`);
        await git.deleteRemote(`src/${repo}`, branch);
    }
    return;
}

(async () => {
    const branch = process.argv[2];
    const location = process.argv[3];
    switch (location) {
        case "local":
            await localDeletion(branch);
        case "remote":
            await remoteDeletion(branch);
        default:
            throw "fatal: invalid location, please select 'local' or 'remote'";
    }
})();