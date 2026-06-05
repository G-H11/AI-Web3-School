// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title BatchNFT — Gas 优化的批量铸造 NFT (ERC-721A 风格)
/// @notice 批量铸造时大幅降低 Gas，支持白名单、预售/公售阶段
contract BatchNFT is Ownable, ReentrancyGuard {
    using Strings for uint256;

    // ============ 状态变量 ============

    string public name;
    string public symbol;
    string public baseURI;
    uint256 public maxSupply;
    uint256 public maxPerWallet;

    uint256 private _currentIndex;       // 下一个要铸造的 tokenId
    uint256 private _burnCounter;

    // 阶段控制
    enum Phase { Closed, Whitelist, Public }
    Phase public currentPhase = Phase.Closed;

    // 白名单
    mapping(address => bool) public whitelist;
    bool public whitelistEnabled;

    // Token ownership: tokenId -> 该批次的起始地址
    mapping(uint256 => address) private _ownerships;

    // 打包的地址数据: [0..63] balance, [64..127] numberMinted, [128..191] numberBurned, [192..255] aux
    mapping(address => uint256) private _packedAddressData;

    // 每个地址的铸造数量跟踪
    mapping(address => uint256) public numberMinted;

    // ============ 事件 ============

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event BatchMinted(address indexed to, uint256 quantity, uint256 startTokenId);
    event BaseURIChanged(string newBaseURI);
    event PhaseChanged(Phase newPhase);
    event WhitelistUpdated(address indexed account, bool status);

    // ============ 错误 ============

    error OwnerQueryForNonexistentToken();
    error BalanceQueryForZeroAddress();
    error MintToZeroAddress();
    error MintZeroQuantity();
    error MaxSupplyExceeded();
    error PhaseNotOpen();
    error NotWhitelisted();
    error MaxPerWalletExceeded();
    error TokenNotExists();

    // ============ 构造函数 ============

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_,
        uint256 maxPerWallet_
    ) Ownable(msg.sender) {
        name = name_;
        symbol = symbol_;
        maxSupply = maxSupply_;
        maxPerWallet = maxPerWallet_;
        _currentIndex = _startTokenId();
    }

    function _startTokenId() internal pure virtual returns (uint256) {
        return 1;
    }

    // ============ 铸造 ============

    /// @notice 批量铸造（Gas 优化：每批只写一次 ownership）
    function mint(uint256 quantity) external payable nonReentrant {
        require(quantity > 0, MintZeroQuantity());
        require(_currentIndex + quantity - _startTokenId() <= maxSupply, MaxSupplyExceeded());

        // 阶段检查
        if (currentPhase == Phase.Closed) revert PhaseNotOpen();
        if (currentPhase == Phase.Whitelist) {
            require(!whitelistEnabled || whitelist[msg.sender], NotWhitelisted());
        }

        // 单地址限额
        if (maxPerWallet > 0) {
            require(numberMinted[msg.sender] + quantity <= maxPerWallet, MaxPerWalletExceeded());
        }

        _beforeMint(msg.sender, quantity);

        // ERC-721A 核心优化: 批量 mint 时只记录起始地址
        uint256 startTokenId = _currentIndex;
        _ownerships[startTokenId] = msg.sender;
        _packedAddressData[msg.sender] += quantity;

        numberMinted[msg.sender] += quantity;
        _currentIndex += quantity;

        emit BatchMinted(msg.sender, quantity, startTokenId);
    }

    function _beforeMint(address to, uint256 /* quantity */) internal virtual {
        require(to != address(0), MintToZeroAddress());
    }

    // ============ Owner 管理 ============

    function setBaseURI(string memory uri) external onlyOwner {
        baseURI = uri;
        emit BaseURIChanged(uri);
    }

    function setPhase(Phase phase) external onlyOwner {
        currentPhase = phase;
        emit PhaseChanged(phase);
    }

    function setWhitelist(address[] calldata accounts, bool status) external onlyOwner {
        for (uint256 i = 0; i < accounts.length; i++) {
            whitelist[accounts[i]] = status;
            emit WhitelistUpdated(accounts[i], status);
        }
    }

    function setWhitelistEnabled(bool enabled) external onlyOwner {
        whitelistEnabled = enabled;
    }

    function setMaxPerWallet(uint256 limit) external onlyOwner {
        maxPerWallet = limit;
    }

    // ============ ERC-721 兼容接口 ============

    function totalSupply() public view returns (uint256) {
        return _currentIndex - _startTokenId() - _burnCounter;
    }

    function totalMinted() public view returns (uint256) {
        return _currentIndex - _startTokenId();
    }

    function balanceOf(address owner) public view returns (uint256) {
        require(owner != address(0), BalanceQueryForZeroAddress());
        return _packedAddressData[owner] & ((1 << 64) - 1);
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        unchecked {
            // 从 tokenId 向前扫描找到最近的 ownership 记录
            for (uint256 curr = tokenId; curr >= _startTokenId(); curr--) {
                address owner_ = _ownerships[curr];
                if (owner_ != address(0)) {
                    return owner_;
                }
            }
            revert OwnerQueryForNonexistentToken();
        }
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return tokenId >= _startTokenId() && tokenId < _currentIndex;
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), TokenNotExists());
        return bytes(baseURI).length > 0
            ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json"))
            : "";
    }

    // ============ 转账 (简化版) ============

    function transferFrom(address from, address to, uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(to != address(0), "Transfer to zero");

        // 更新 ownership
        _ownerships[tokenId] = to;
        _packedAddressData[from] -= 1;
        _packedAddressData[to] += 1;

        emit Transfer(from, to, tokenId);
    }

    // ============ Metadata ============

    function contractURI() public view returns (string memory) {
        return string(abi.encodePacked(baseURI, "contract.json"));
    }
}
