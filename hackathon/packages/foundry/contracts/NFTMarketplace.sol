// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";

/// @title NFTMarketplace — NFT 交易市场
/// @notice 支持 ERC-721 / ERC-1155 上架、下架、购买、改价，含平台手续费与版税
contract NFTMarketplace is Ownable, ReentrancyGuard, IERC721Receiver, IERC1155Receiver {
    // ============ 数据结构 ============

    enum TokenStandard { ERC721, ERC1155 }

    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 amount;      // ERC-1155 数量，ERC-721 固定为 1
        uint256 price;       // 以 wei 计
        TokenStandard standard;
        bool active;
    }

    // ============ 状态变量 ============

    uint256 private _nextListingId;
    mapping(uint256 => Listing) public listings;

    uint256 public platformFeePercent = 250; // 2.5% (基点)
    uint256 public constant MAX_FEE_PERCENT = 1000; // 10% 上限

    // 版税: nftContract => tokenId => royalty receiver
    mapping(address => mapping(uint256 => address)) public royalties;
    // 版税比例: nftContract => tokenId => royalty percent (基点)
    mapping(address => mapping(uint256 => uint256)) public royaltyPercents;
    uint256 public constant MAX_ROYALTY_PERCENT = 1500; // 15% 上限

    // 平台累计手续费
    mapping(address => uint256) public accumulatedFees;

    // ============ 事件 ============

    event Listed(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price,
        TokenStandard standard
    );
    event Unlisted(uint256 indexed listingId);
    event Purchased(uint256 indexed listingId, address indexed buyer, uint256 price);
    event PriceUpdated(uint256 indexed listingId, uint256 oldPrice, uint256 newPrice);
    event RoyaltySet(address indexed nftContract, uint256 indexed tokenId, address receiver, uint256 percent);
    event PlatformFeeUpdated(uint256 newFeePercent);
    event FeesWithdrawn(address indexed to, uint256 amount);

    // ============ 错误 ============

    error ListingNotActive();
    error NotSeller();
    error InsufficientPayment();
    error InvalidPrice();
    error FeeTooHigh();
    error RoyaltyTooHigh();
    error TransferFailed();

    // ============ 构造函数 ============

    constructor() Ownable(msg.sender) {}

    // ============ 上架 / 下架 / 改价 ============

    /// @notice 上架 NFT 到市场
    function listNFT(
        address nftContract,
        uint256 tokenId,
        uint256 amount,
        uint256 price,
        TokenStandard standard
    ) external returns (uint256) {
        require(price > 0, InvalidPrice());

        // 转移 NFT 到市场合约（托管）
        if (standard == TokenStandard.ERC721) {
            IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
        } else {
            IERC1155(nftContract).safeTransferFrom(msg.sender, address(this), tokenId, amount, "");
        }

        uint256 listingId = _nextListingId;
        _nextListingId++;

        listings[listingId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            amount: amount,
            price: price,
            standard: standard,
            active: true
        });

        emit Listed(listingId, msg.sender, nftContract, tokenId, price, standard);
        return listingId;
    }

    /// @notice 下架
    function unlistNFT(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.active, ListingNotActive());
        require(listing.seller == msg.sender, NotSeller());

        listing.active = false;

        // 返还 NFT
        if (listing.standard == TokenStandard.ERC721) {
            IERC721(listing.nftContract).transferFrom(address(this), msg.sender, listing.tokenId);
        } else {
            IERC1155(listing.nftContract).safeTransferFrom(
                address(this), msg.sender, listing.tokenId, listing.amount, ""
            );
        }

        emit Unlisted(listingId);
    }

    /// @notice 修改价格
    function updatePrice(uint256 listingId, uint256 newPrice) external {
        Listing storage listing = listings[listingId];
        require(listing.active, ListingNotActive());
        require(listing.seller == msg.sender, NotSeller());
        require(newPrice > 0, InvalidPrice());

        uint256 oldPrice = listing.price;
        listing.price = newPrice;

        emit PriceUpdated(listingId, oldPrice, newPrice);
    }

    // ============ 购买 ============

    /// @notice 购买 NFT
    function buyNFT(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, ListingNotActive());
        require(msg.value >= listing.price, InsufficientPayment());

        listing.active = false;

        uint256 price = listing.price;
        address seller = listing.seller;
        address nftContract = listing.nftContract;
        uint256 tokenId = listing.tokenId;
        uint256 amount = listing.amount;
        TokenStandard standard = listing.standard;

        // 计算费用
        uint256 platformFee = (price * platformFeePercent) / 10000;
        uint256 royaltyFee = 0;
        address royaltyReceiver = royalties[nftContract][tokenId];
        if (royaltyReceiver != address(0)) {
            royaltyFee = (price * royaltyPercents[nftContract][tokenId]) / 10000;
            (bool royaltySuccess, ) = royaltyReceiver.call{value: royaltyFee}("");
            if (!royaltySuccess) revert TransferFailed();
        }

        // 平台手续费
        accumulatedFees[nftContract] += platformFee;

        // 卖家收款
        uint256 sellerProceeds = price - platformFee - royaltyFee;
        (bool sellerSuccess, ) = seller.call{value: sellerProceeds}("");
        if (!sellerSuccess) revert TransferFailed();

        // 转账 NFT 给买家
        if (standard == TokenStandard.ERC721) {
            IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        } else {
            IERC1155(nftContract).safeTransferFrom(address(this), msg.sender, tokenId, amount, "");
        }

        // 退还多余 ETH
        if (msg.value > price) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - price}("");
            if (!refundSuccess) revert TransferFailed();
        }

        emit Purchased(listingId, msg.sender, price);
    }

    // ============ 版税管理 ============

    function setRoyalty(
        address nftContract,
        uint256 tokenId,
        address receiver,
        uint256 percent
    ) external {
        require(percent <= MAX_ROYALTY_PERCENT, RoyaltyTooHigh());
        // 只有合约 owner 或 NFT creator（由合约判断）可设置
        royalties[nftContract][tokenId] = receiver;
        royaltyPercents[nftContract][tokenId] = percent;
        emit RoyaltySet(nftContract, tokenId, receiver, percent);
    }

    // ============ 平台管理 ============

    function setPlatformFee(uint256 feePercent) external onlyOwner {
        require(feePercent <= MAX_FEE_PERCENT, FeeTooHigh());
        platformFeePercent = feePercent;
        emit PlatformFeeUpdated(feePercent);
    }

    function withdrawFees(address token) external onlyOwner {
        uint256 amount = accumulatedFees[token];
        accumulatedFees[token] = 0;
        (bool success, ) = owner().call{value: amount}("");
        if (!success) revert TransferFailed();
        emit FeesWithdrawn(owner(), amount);
    }

    // ============ 查询 ============

    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }

    function isListingActive(uint256 listingId) external view returns (bool) {
        return listings[listingId].active;
    }

    function getListingCount() external view returns (uint256) {
        return _nextListingId;
    }

    /// @notice 获取所有活跃 listing（分页）
    function getActiveListings(uint256 offset, uint256 limit) external view returns (Listing[] memory, uint256) {
        uint256 count;
        for (uint256 i = 0; i < _nextListingId; i++) {
            if (listings[i].active) count++;
        }

        uint256 resultLen = limit;
        if (offset + limit > count) {
            resultLen = count > offset ? count - offset : 0;
        }
        Listing[] memory result = new Listing[](resultLen);

        uint256 index;
        uint256 skipped;
        for (uint256 i = 0; i < _nextListingId && index < resultLen; i++) {
            if (listings[i].active) {
                if (skipped < offset) {
                    skipped++;
                    continue;
                }
                result[index] = listings[i];
                index++;
            }
        }
        return (result, count);
    }

    // ============ ERC-721 / ERC-1155 Receiver ============

    function onERC721Received(
        address /* operator */,
        address /* from */,
        uint256 /* tokenId */,
        bytes calldata /* data */
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function onERC1155Received(
        address /* operator */,
        address /* from */,
        uint256 /* id */,
        uint256 /* value */,
        bytes calldata /* data */
    ) external pure override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address /* operator */,
        address /* from */,
        uint256[] calldata /* ids */,
        uint256[] calldata /* values */,
        bytes calldata /* data */
    ) external pure override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    function supportsInterface(bytes4 interfaceId) external pure override returns (bool) {
        return
            interfaceId == type(IERC721Receiver).interfaceId ||
            interfaceId == type(IERC1155Receiver).interfaceId;
    }
}
