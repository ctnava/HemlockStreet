function powershell() {
    var spawn = require("child_process").spawn,child;
    child = spawn("powershell.exe",["c:\\temp\\helloworld.ps1"]);
    child.stdout.on("data",function(data){
        console.log("stdout: " + data);
    });
    child.stderr.on("data",function(data){
        console.log("stderr: " + data);
    });
    child.on("exit",function(){
        console.log("Powershell Script finished");
    });
    child.stdin.end(); //end input
    return child;
}


module.exports.powershell = powershell();