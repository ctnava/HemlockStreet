##NOTICE
removed "eslintConfig": { "extends": [ "react-app", "react-app/jest" ] }, from package.json


you need to set the chainId for the localhost network on metamask to 31337 instead of 1337

#TODO
- Add junk inputs to addTime, upload, & modify || randomized bytes
- express server with data chunking (FETCH x CORS)

##WEBSITE
"npm i" to install dependencies then 
"npx hardhat node" to boot up the blockchain then IN A NEW WINDOW
"npm run deploy" to deploy the contract to the sim chain then IN THE SAME WINDOW 
"npm run start" to launch the website. 
DO NOT TOUCH THE HARDHAT NODE WINDOW! IT RUNS THE BLOCKCHAIN!
if you don't have metamask or any other web3 wallet extension, you will be directed
to install metamask instead of logging in.

##TESTING
'npx hardhat test' runs the automated tests

'npx hardhat console --network localhost' puts you into the sim blockchain
```
// instantiates an interface
const contract = await ethers.getContractAt("DStor", "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0")
  

const name = await contract.name() //hit enter to make a getter
name // just type it in and it will print

.exit
```

