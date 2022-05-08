const fs = require("fs");
const {powershell} = require('./shell.js');

(async () => {
    if (!fs.existsSync(`./node_modules`)) {
        console.log(`Running Install on root`);
        await powershell('npm/install', {args:["root"]});
    }

    var subRepos = fs.readdirSync("./src");
    subRepos = subRepos.filter(repo => !repo.includes("."));
    for await (const repo of subRepos){
        const pathTo = `src/${repo}`;
        if (!fs.existsSync(`${pathTo}/node_modules`)) {
            console.log(`Running Install on ${repo}`);
            const opts = {args:[pathTo], v:true};
            await powershell('npm/install', opts);
        }
    }
})();