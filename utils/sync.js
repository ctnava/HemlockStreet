const fs = require('fs');
const git = require('./git.js');
const heroku = require('./heroku.js');


(async () => {
    const branch = process.argv[2];
    const commitMessage = process.argv[3];
    if (branch === undefined || commitMessage === undefined)
        throw "missing branch or commitMessage";
    if (process.argv[4] !== undefined) 
        throw "did you forget to use quotation marks on your message?";
    console.log("\nScanning repos for changes...");

    const rootIsClean = await git.status();
    console.log("\nrootIsClean:", rootIsClean);

    if (!rootIsClean) {
        console.log("Committing Changes...");
        await git.push("root", branch, commitMessage);
    }

    var subRepos = fs.readdirSync("./src");
    subRepos = subRepos.filter(repo => !repo.includes("."));
    for await (const repo of subRepos){
        const pathTo = `src/${repo}`;
        const isClean = await git.status(pathTo);
        console.log(`${repo}IsClean:`, isClean);

        if (!isClean) {
            console.log("Committing Changes...");
            await git.push(pathTo, branch, commitMessage);
            const herokuApps = ["api"];
            if (branch === "main" && herokuApps.includes(repo)) {
                const staged = await heroku.stage(repo);
                if (!staged) throw `staging failure @${repo}`;
                else {
                    const deployed = await heroku.deploy(repo);
                    if (!deployed) throw `deployment failure @${repo}`;
                    else console.log(deployed);
                }
            }
        }
    }

    console.log("\nAll Repositories Synced!");
})();