require("dotenv").config();
const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

const config = require("../contracts/truffle-config.js");

const dirBuiltContracts = "../contracts/build/contracts/";
const fs = require("fs");
fs.writeFileSync(
    "public/contracts/NFT.json",
    JSON.stringify(require(dirBuiltContracts + "NFT.json").abi),
    "utf8"
);

[
    "/public",
    "/node_modules/web3",
].map(fn => app.use(express.static(__dirname + fn)));

app.get("/api/contract_addresses", (req, res) => {
    res.send({
        NFT: require(dirBuiltContracts + "NFT.json").networks[config.networks[process.env.NETWORK].network_id].address,
    });
});

app.get("/api/web3storage_jwt", (req, res) => {
    res.send({ jwt: process.env.WEB3STORAGE_JWT });
});

app.get("/api/endpoint", (req, res) => {
    res.send({ endpoint: `https://${process.env.NETWORK}.infura.io/v3/${process.env.INFURA_PROJECT_ID}` });
});

app.listen(PORT, () => console.log(`Server listening on port http://localhost:${PORT}`));

