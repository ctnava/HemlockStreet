const git = require('./shell/git.js');
const fs = require('fs');

(async () => {
    const branch = process.argv[2];
    await git.checkout("root", branch);

    const subRepos = (fs.readdirSync("./src")).filter(repo => !repo.includes("."));
    for await (const repo of subRepos) {await git.checkout(`src/${repo}`, branch)}

    return;
})();