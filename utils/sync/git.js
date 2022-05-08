const git = require('../shell/git.js');


async function status(pathTo, repo) {
    const isClean = await git.status(pathTo);
    console.log(`${repo}IsClean:`, isClean);
    return isClean;
}

async function createBranch(pathTo, repo, branch) {
    console.log(`\nScanning '${repo}' for ${branch} branch...`);
    const branches = await git.listBranches(pathTo);

    const branchNotPresent = !branches.includes(`* ${branch}`) && !branches.includes(branch);
    console.log(branchNotPresent ? "Not found! Branching..." : "Branch Found!");

    const isCurrentBranch = branches.includes(`* ${branch}`);
    if (branchNotPresent) {
        await git.createBranch(pathTo, branch);
        console.log("Branch Created!");
    }
    else {
        if (!isCurrentBranch) throw `fatal: '${branch}' exists and is not current branch`;
    } 
}

async function synchronize(pathTo, repo, branch, message) {
    await createBranch(pathTo, repo, branch);
    const isClean = await status(pathTo, repo);
    if (!isClean) {await git.push(pathTo, branch, message)}
    return isClean;
}


module.exports = { status, createBranch, synchronize }