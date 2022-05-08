const git = require('../shell/git.js');


async function status(pathTo, repo) {
    const isClean = await git.status(pathTo);
    console.log(`${repo}IsClean:`, isClean);
    return isClean;
}

async function createBranch(pathTo, branch) {
    const branches = await git.listBranches(pathTo);
    const branchNotPresent = !branches.includes(`* ${branch}`) && !branches.includes(branch);
    if (!branchNotPresent) console.log(`Branching ${pathTo}...`);
    const isCurrentBranch = branches.includes(`* ${branch}`);
    if (branchNotPresent) await git.createBranch("root", branch);
    else {
        if (!isCurrentBranch) throw "branch exists, but is not current branch";
    } 
}

async function synchronize(pathTo, repo, branch, message) {
    await createBranch(pathTo, branch);
    const isClean = await git.status(pathTo, repo);
    if (!isClean) {
        console.log("Committing Changes...");
        await git.push(pathTo, branch, message);
    }
    return isClean;
}


module.exports = { status, createBranch, synchronize }