# HemlockStreet || API
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
## Mandatory .env values
```
# Client
API_URL=https://deaddrop-api-alpha.herokuapp.com/


# IPFS @ https://infura.io/
PORT=4001
IPFS_HOST=ipfs.infura.io
IPFS_PORT=5001
IPFS_PROTOCOL=https
IPFS_PROJECT_ID=YOUR_OWN
IPFS_PROJECT_SECRET=YOUR_OWN

# PINATA_PUBLIC=NOT_YET_IMPLEMENTED
# PINATA_PRIVATE=NOT_YET_IMPLEMENTED
# PINATA_JWT=NOT_YET_IMPLEMENTED

# API @ https://cloud.mongodb.com/
CLIENT_URL=http://localhost:3000
DB_URL=mongodb+srv://<USERNAME>:<PASSWORD>@<YOUR_CLUSTER>.6vpdm.mongodb.net/deadDropDB?retryWrites=true&w=majority 
DB_KEY=YOUR_OWN # decrypt secrets
BC_KEY=YOUR_OWN # decrypt the double encrypted hash stored on chain


# Web3 @ https://moralis.io/ & https://dashboard.alchemyapi.io/apps
MORALIS_KEY=YOUR_OWN
ALCHEMY_OPTM_KEY=YOUR_OWN # Optimism Mainnet
ALCHEMY_OPTT_KEY=YOUR_OWN # Optimism Testnet


# Wallet
MAINNET_KEY=YOUR_OWN
```