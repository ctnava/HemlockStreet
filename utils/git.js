const {powershell} = require('./shell.js');


async function status(repo) {
    const opts = (!repo) ? {args:["root"]} : {args:[repo],retVal:true};
    const treeStat = (await powershell('gitStatus', opts)).split("\n")[3];
    return (treeStat === 'nothing to commit, working tree clean');
}

async function push(repo, branch, commitMessage) {
    const opts = {args:[repo, branch, commitMessage]};
    await powershell('gitPush', opts);
    return;
}


module.exports = {
    status,
    push
}