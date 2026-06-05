// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @title MultiTokenNFT — ERC-1155 多代币 NFT 合约
/// @notice 支持多种代币、版次管理、批量铸造/转账
contract MultiTokenNFT is ERC1155, Ownable {
    using Strings for uint256;

    string public name;
    string public symbol;

    // 每种代币的元数据
    struct TokenInfo {
        uint256 maxSupply;   // 该代币最大供应量（0 = 无限制）
        uint256 totalMinted; // 已铸造数量
        string uri;          // 该代币的元数据 URI
    }

    mapping(uint256 => TokenInfo) public tokenInfos;
    uint256 private _nextTokenId;

    event TokenCreated(uint256 indexed tokenId, uint256 maxSupply, string uri);
    event BatchMinted(address indexed to, uint256[] tokenIds, uint256[] amounts);
    event BatchTransferred(address indexed from, address indexed to, uint256[] tokenIds, uint256[] amounts);

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_
    ) ERC1155(baseURI_) Ownable(msg.sender) {
        name = name_;
        symbol = symbol_;
    }

    // ============ 代币创建 ============

    /// @notice 创建新代币类型（限量版）
    function createToken(uint256 maxSupply_, string memory uri_) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        tokenInfos[tokenId] = TokenInfo({maxSupply: maxSupply_, totalMinted: 0, uri: uri_});
        emit TokenCreated(tokenId, maxSupply_, uri_);
        return tokenId;
    }

    // ============ 铸造 ============

    /// @notice 铸造单个代币
    function mint(address to, uint256 tokenId, uint256 amount, bytes memory data) public onlyOwner {
        TokenInfo storage info = tokenInfos[tokenId];
        if (info.maxSupply > 0) {
            require(info.totalMinted + amount <= info.maxSupply, "Max supply exceeded");
        }
        info.totalMinted += amount;
        _mint(to, tokenId, amount, data);
    }

    /// @notice 批量铸造多种代币
    function mintBatch(
        address to,
        uint256[] calldata tokenIds,
        uint256[] calldata amounts,
        bytes memory data
    ) public onlyOwner {
        require(tokenIds.length == amounts.length, "Arrays length mismatch");
        for (uint256 i = 0; i < tokenIds.length; i++) {
            TokenInfo storage info = tokenInfos[tokenIds[i]];
            if (info.maxSupply > 0) {
                require(info.totalMinted + amounts[i] <= info.maxSupply, "Max supply exceeded");
            }
            info.totalMinted += amounts[i];
        }
        _mintBatch(to, tokenIds, amounts, data);
        emit BatchMinted(to, tokenIds, amounts);
    }

    // ============ URI 管理 ============

    function uri(uint256 tokenId) public view override returns (string memory) {
        TokenInfo storage info = tokenInfos[tokenId];
        if (bytes(info.uri).length > 0) {
            return info.uri;
        }
        return super.uri(tokenId);
    }

    function setTokenURI(uint256 tokenId, string memory uri_) public onlyOwner {
        tokenInfos[tokenId].uri = uri_;
    }

    function setBaseURI(string memory baseURI_) public onlyOwner {
        _setURI(baseURI_);
    }

    // ============ 批量转账（管理员工具） ============

    function batchTransferFrom(
        address from,
        address to,
        uint256[] calldata tokenIds,
        uint256[] calldata amounts,
        bytes memory data
    ) public {
        require(from == msg.sender || isApprovedForAll(from, msg.sender), "Not approved");
        safeBatchTransferFrom(from, to, tokenIds, amounts, data);
        emit BatchTransferred(from, to, tokenIds, amounts);
    }

    // ============ 查询 ============

    function getTokenCount() public view returns (uint256) {
        return _nextTokenId;
    }

    function getTokenInfo(uint256 tokenId) public view returns (TokenInfo memory) {
        return tokenInfos[tokenId];
    }

    function totalMinted(uint256 tokenId) public view returns (uint256) {
        return tokenInfos[tokenId].totalMinted;
    }
}
