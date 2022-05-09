# HemlockStreet || Dapp Client
 
## NOTICE
removed "eslintConfig": { "extends": [ "react-app", "react-app/jest" ] }, from package.json

you need to set the chainId for the localhost network on metamask to 31337 instead of 1337

## Possible .env values
```  
# API
# - https://deaddrop-api-alpha.herokuapp.com/       # Devel
# - https://deaddrop-api-beta.herokuapp.com/        # Public Testing
# - https://deaddrop-alpha.herokuapp.com/           # Production
API_URL=https://deaddrop-api-alpha.herokuapp.com/


# Client
# - https://deaddrop-dapp-alpha.herokuapp.com       # Devel
# - https://deaddrop-dapp-beta.herokuapp.com        # Public Testing
# - https://deaddrop-dapp.herokuapp.com             # Production
CLIENT_URL=https://deaddrop-dapp-alpha.herokuapp.com
```  