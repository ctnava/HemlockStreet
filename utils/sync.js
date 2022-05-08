const fs = require('fs');
const git = require('./sync/git.js');
const heroku = require('./sync/heroku.js');


(async () => {
    const branch = process.argv[2];
    const message = process.argv[3];
    if (branch === undefined || message === undefined)
        throw "missing branch or message";
    if (process.argv[4] !== undefined) 
        throw "did you forget to use quotation marks on your message?";

    console.log("\nScanning repos for changes...");
    try { await git.synchronize("root", "root", branch, message) }
    catch (err) {  
        console.log(err);
        return;
    }

    const subRepos = (fs.readdirSync("./src"))
    .filter(repo => !repo.includes("."));

    for await (const repo of subRepos) {
        try {
            const wasClean = await git.synchronize(`src/${repo}`, repo, branch, message);

            if (!wasClean && branch === "main" && heroku.apps.includes(repo)) {
                const staged = await heroku.stage(repo);
                if (!staged) throw `staging failure @${repo}`;
                else {
                    const deployed = await heroku.deploy(repo, message);
                    if (!deployed) throw `deployment failure @${repo}`;
                    else console.log(deployed);
                }
            }
        } catch (err) {
            console.log(err);
            return;
        }
    }

    console.log("\nAll Repositories Synced!");
    if (fs.existsSync("./heroku")) {
        fs.rmSync("./heroku", {recursive:true});
        console.log("\nHeroku Build Removed!\n");
    }
    return;
})();