const git = require('../shell/git.js');
const fs = require('fs');

(async () => {
    const message = process.argv[2];
    console.log("\nroot");
    await git.commit("root", message);

    const subRepos = (fs.readdirSync("./src")).filter(repo => !repo.includes("."));
    for await (const repo of subRepos) {
        console.log(`${repo}`);
        await git.commit(`src/${repo}`, message);
    }

    return;
})();