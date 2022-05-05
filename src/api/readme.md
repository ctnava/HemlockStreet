# deadDrop@HemlockStreet || API
Documentation for the Web2 backend for the deadDrop Dapp

## HEROKU DEPLOYMENT
Required changes for successful deployment
### New App?
Change package.json
```
rename
"@chilkat/ck-node16-win64" to "@chilkat/ck-node16-linux64"

change sitRep @ app.post("/report") in ("./lib/routes").maintenanceRoutes
to 
{ 
    port: process.env.PORT,
    ipfs: version
}
```
### Changed .env Vars?
Set App > Settings > Config Vars
config must include
```
// Dapp Client 
CLIENT_URL 

// IPFS Infura
IPFS_HOST
IPFS_PORT
IPFS_PROTOCOL
IPFS_PROJECT_ID
IPFS_PROJECT_SECRET

// Web3 
MORALIS_KEY // Most Networks
ALCHEMY_OPTM_KEY // Optimism Mainnet
ALCHEMY_OPTT_KEY // Optimism Testnet

// MongoDB
DB_URL // include login credentials
DB_KEY // decrypt secrets

// On-Chain
BC_KEY // decrypt the double encrypted hash stored on chain
```