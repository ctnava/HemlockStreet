const fs = require('fs');
const git = require('./git.js');


async function synchronizeAll() {
    const branch = process.argv[2];
    const commitMessage = process.argv[3];
    if (branch === undefined || commitMessage === undefined)
        throw "missing branch or commitMessage";
    if (process.argv[4] !== undefined) 
        throw "did you forget to use quotation marks on your message?";
    
    const rootIsClean = await git.status();
    console.log("rootIsClean:", rootIsClean);
    if (!rootIsClean) await git.push("root", branch, commitMessage);

    var subRepos = fs.readdirSync("./src");
    subRepos = subRepos.filter(repo => !repo.includes("."));
    for await (const repo of subRepos){
        const pathTo = `src/${repo}`;
        const isClean = await git.status(pathTo);
        console.log(`${repo}IsClean:`, isClean);
        repoStates.push(isClean);
        if (!isClean) await git.push(pathTo, branch, commitMessage);
    }
}


synchronizeAll()
