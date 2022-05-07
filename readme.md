# HemlockStreet || Platform
## NOTICE
POWERSHELL INSTALLATION REQUIRED
for more details, refer to readme files in the individual project "root" folders under "./src"


## Mandatory .env values
```
# Utils
PS_SUBDIR=/utils # for "./utils/bash.js" NOT REQUIRED IF IN ROOT


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
CLIENT_URL=http://localhost:4002
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


## Deployment Instructions
### Step 1: Contract Deployment
to boot up local blockchain & deploy to localhost
```
yarn sim 
yarn deploy 
```
### Step 2: API Deployment
to launch the api
```
yarn api 
```
### Step 3: Client Deployment
to launch the dapp client 
```
yarn client 
```
THEN
```
y
```


## Utils
to show configured hardhat networks
```
yarn networks
```
to remove useless artifacts (heroku predeploy)
```
yarn clean
```
to push changes and deploy to heroku if necessary
```
yarn sync branchName "commit message"
```