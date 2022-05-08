const git = require('./shell/git.js');

(async () => {
    const branch = process.argv[2];
    await git.checkout("root", branch);

    const subRepos = (fs.readdirSync("./src")).filter(repo => !repo.includes("."));
    subRepos.forEach(repo => {await git.checkout(`src/${repo}`, branch)});

    return;
})();