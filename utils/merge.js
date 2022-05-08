const git = require('./shell/git.js');
const fs = require('fs');


(async () => {
    const from = process.argv[2];
    const to = process.argv[3];
    const acceptableMerge = (
        (from.includes("release") && to === "main") || 
        (from.includes("hotfix") && to === "main") ||

        (from.includes("devel") && from.includes("release")) || 
        
        (from === "main" && to.includes("devel")) || 
        (from.includes("release") && to.includes("devel")) || 
        (from.includes("hotfix") && to.includes("devel")) || 
        (from.includes("feature") && to.includes("devel")) || 

        (from === "main")
        (to.includes("feature"))
    );

    if (acceptableMerge) {
        await git.checkout("root", to);
        await git.merge("root", from);

        const subRepos = (fs.readdirSync("./src")).filter(repo => !repo.includes("."));
        for await (const repo of subRepos) {
            await git.checkout(`src/${repo}`, to);
            await git.merge(`src/${repo}`, from);
        }

        return;
    } else { 
        switch (to) {
            case "main":
                throw `fatal: If I catch you doing this, you are fired.`;
            case "release":
                throw `fatal: Merge not allowed from ${from} to ${to}. Please be more careful...`;
            default:
                throw `fatal: Merge not allowed from ${from} to ${to}.`; 
        }
    }
})();