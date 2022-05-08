const { powershell } = require('../shell.js');


async function status(repo) {
    const opts = (!repo) ? {args:["root"]} : {args:[repo]};
    const treeStat = (await powershell('git/status', opts)).split("\n")[3];
    return (treeStat === 'nothing to commit, working tree clean');
}

async function push(repo, branch, commitMessage) {
    const opts = {args:[repo, branch, commitMessage]};
    await powershell('git/push', opts);
    return;
}


async function listBranches(repo) {
    const opts = {args:[repo]};
    const branches = (await powershell('git/branch/list', opts)).split("\n");
    return branches;
}


async function createBranch(repo, branch) {
    const opts = {args:[repo, branch]};
    await powershell('git/branch/create', opts);
    return;
}


async function checkout(repo, branch) {
    const opts = {args:[repo, branch]};
    await powershell('git/branch/checkout', opts);
    return;
}


async function merge(repo, branch) {
    const opts = {args:[repo, branch]};
    await powershell('git/branch/merge', opts);
    return;
}


module.exports = {
    status,
    push,
    listBranches,
    createBranch,
    checkout,
    merge
}