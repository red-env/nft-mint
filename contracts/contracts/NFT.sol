// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NFT
 * @dev Create a sample ERC721 standard token
 */
contract NFT is ERC721, Ownable {

    uint256 private tokenId; 
    mapping(uint256 => string) private tokenToUri;

    constructor(string memory tokenName, string memory tokenSymbol) ERC721(tokenName, tokenSymbol) {}

    function mint(string memory uri) external onlyOwner {
        tokenId += 1;
        _safeMint(msg.sender, tokenId);
        tokenToUri[tokenId] = uri;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        return tokenToUri[tokenId];
    }
}