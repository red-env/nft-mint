# nft-mint

Simple code in javascript to mint NFT according ERC721 smart contract. This example is able work with *GOERLI* testnet.

## files
    .
    ├── contracts               # Directory that contains files related to truffle project
    ├── server                  # Directory containing node server files
    └── README.md

## prerequisite
To run the js code should be installed on machine
- npm
- node.js
To deploy and test smart contracts is required
- truffle
that can be installed with the command
```
npm install -g truffle
```

## before running
To install app dependencies should be run the command
```
cd contracts
npm install
cd ..
cd server
npm install
```
then should be created a new file **.env** for each main directory with the same key of *.env_test*. The connection with the nodes of the blockchain is possible without creating a dedicated node passing through [infura](https://infura.io/dashboard) that is able to do as a proxy. After a registration it provides a personal link to each user to access on web3 services. Should be done also a registration to [web3.storage](https://web3.storage/) to upload NFT files related  to image and metadata on IPFS.
*contract .env*
```
INFURA_URL=         <- infura url available on the website
ACCOUNT_ADDRESS=    <- user account address
PRIVATE_KEY=        <- user account private key
```
*server .env*
```
PORT=3000           <- server port
NETWORK=goerli      <- ethereum testnet network name
WEB3STORAGE_JWT=    <- web3.storage jwt token
INFURA_PROJECT_ID=  <- infura id available on the website
```
## deploy and test smart contract
```
truffle deploy --network goerli
truffle test --network goerli
```
## run server
```
npm start
```
