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

async function remoteDeletion(branch) {
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
    if (location !== "local" && location !== "remote") throw "fatal: invalid location, please select 'local' or 'remote'";
    switch (location) {
        case "local":
            await localDeletion(branch);
            return;
        case "remote":
            await remoteDeletion(branch);
            await localDeletion(branch);
            return;
        default:
            return;
    }
})();