const NFT = artifacts.require("NFT");

contract("NFT", (accounts) => {
    it("should mint new NFT", async () => {
        const nftInstance = await NFT.deployed();
        const res = await nftInstance.mint('https://bafkreigfbeqlqaukua2ozooupz2pxx44aso2oux55psl4babjfwwd2fbi4.ipfs.w3s.link/', { from: accounts[0] });
        console.log(res);
    });
});