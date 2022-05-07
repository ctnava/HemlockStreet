require("dotenv").config();
const subdir = (process.env.PS_SUBDIR) ? process.env.PS_SUBDIR : "";
const projectDir = __dirname.slice(0, __dirname.length - (subdir.length));
const ps = (require("os").platform() === "win32") ? "powershell.exe" : "pwsh";


async function powershell(script, {args, v}) {
    var command = `${projectDir}/bin/${script}.ps1`
    if (args.length > 0) args.forEach(arg=>{command=command.concat(` ${arg}`)});


    var output = "";
    await new Promise((resolve) => {
        const shell = require('child_process').spawn(ps, [command]);
        shell.stdout.on("data", (data)=>{
            if (v) console.log(`${data}`);
            output = output.concat(data);
        });
        shell.stderr.on("data", (data)=>{console.log(`${data}`)});
        shell.on("exit", ()=>{resolve()});
    });
    return output;
}


module.exports = { powershell };