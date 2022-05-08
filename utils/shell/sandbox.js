const { powershell } = require('../shell.js');

(async () => {
    const repo = process.argv[2];

    const opts = (!repo) ? {args:["root"]} : {args:[repo]};
    const branches = (await powershell('git/branch/list', opts)).split("\n");
    console.log(branches);
})();