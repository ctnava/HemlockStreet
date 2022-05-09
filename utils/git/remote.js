const git = require('../shell/git.js');
const fs = require('fs');

(async () => {
    const subRepos = (fs.readdirSync("./src")).filter(repo => !repo.includes("."));
    for await (const repo of subRepos) {
        console.log(`${repo}`);
        switch (repo) {
            case "api":
                await git.addRemote(`src/${repo}`, 
                "https://github.com/ctnava/HemlockStreet-DeadDrop.git");
            case "client":
                await git.addRemote(`src/${repo}`, 
                "https://github.com/ctnava/HemlockStreet-Client.git");
            case "solidity":
                await git.addRemote(`src/${repo}`, 
                "https://github.com/ctnava/HemlockStreet-Contracts.git");
            default:
                return;
        }
    }
    fs.rmSync("./bin/git/remote/add.ps1");
})();