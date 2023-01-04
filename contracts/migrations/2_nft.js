require("dotenv").config();
const NFT = artifacts.require("NFT");

module.exports = function (deployer) {
    deployer.deploy(NFT, process.env.NFT_NAME, process.env.NFT_SYMBOL);
};
