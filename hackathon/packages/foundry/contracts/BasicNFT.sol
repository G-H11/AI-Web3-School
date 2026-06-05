// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title BasicNFT — 标准 ERC-721 NFT 合约
/// @notice 支持单个铸造、批量铸造、总量上限、Owner 管理
contract BasicNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    uint256 public maxSupply;

    event BatchMinted(address indexed to, uint256[] tokenIds);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        maxSupply = maxSupply_;
    }

    /// @notice 铸造单个 NFT
    function mint(address to, string memory uri) public onlyOwner returns (uint256) {
        require(_nextTokenId < maxSupply, "Max supply reached");
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }

    /// @notice 批量铸造
    function batchMint(address[] calldata tos, string[] calldata uris) public onlyOwner {
        require(tos.length == uris.length, "Arrays length mismatch");
        require(_nextTokenId + tos.length <= maxSupply, "Would exceed max supply");
        uint256[] memory tokenIds = new uint256[](tos.length);
        for (uint256 i = 0; i < tos.length; i++) {
            uint256 tokenId = _nextTokenId;
            _nextTokenId++;
            _safeMint(tos[i], tokenId);
            _setTokenURI(tokenId, uris[i]);
            tokenIds[i] = tokenId;
        }
        emit BatchMinted(tos[0], tokenIds);
    }

    /// @notice 当前已铸造数量
    function totalMinted() public view returns (uint256) {
        return _nextTokenId;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
