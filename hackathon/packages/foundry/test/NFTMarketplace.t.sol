// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/NFTMarketplace.sol";
import "../contracts/BasicNFT.sol";
import "../contracts/MultiTokenNFT.sol";

contract NFTMarketplaceTest is Test {
    NFTMarketplace public marketplace;
    BasicNFT public basicNFT;
    MultiTokenNFT public multiNFT;

    address public owner = address(0x1);
    address public seller = address(0x2);
    address public buyer = address(0x3);

    function setUp() public {
        vm.prank(owner);
        marketplace = new NFTMarketplace();

        vm.prank(seller);
        basicNFT = new BasicNFT("Test", "TST", 100);

        vm.prank(seller);
        multiNFT = new MultiTokenNFT("Multi", "MUL", "");
    }

    // ============ ERC-721 Listing ============

    function testListERC721() public {
        // Seller mints
        vm.prank(seller);
        basicNFT.mint(seller, "ipfs://test.json");

        // Approve marketplace
        vm.prank(seller);
        basicNFT.approve(address(marketplace), 0);

        // List
        vm.prank(seller);
        uint256 listingId = marketplace.listNFT(address(basicNFT), 0, 1, 1 ether, NFTMarketplace.TokenStandard.ERC721);

        NFTMarketplace.Listing memory listing = marketplace.getListing(listingId);
        assertTrue(listing.active);
        assertEq(listing.seller, seller);
        assertEq(listing.price, 1 ether);
        assertEq(uint256(listing.standard), uint256(NFTMarketplace.TokenStandard.ERC721));

        // NFT is now held by marketplace
        assertEq(basicNFT.ownerOf(0), address(marketplace));
    }

    function testBuyERC721() public {
        // Setup: seller lists NFT
        vm.startPrank(seller);
        basicNFT.mint(seller, "ipfs://test.json");
        basicNFT.approve(address(marketplace), 0);
        marketplace.listNFT(address(basicNFT), 0, 1, 1 ether, NFTMarketplace.TokenStandard.ERC721);
        vm.stopPrank();

        uint256 sellerBalanceBefore = seller.balance;

        // Buyer purchases
        vm.deal(buyer, 2 ether);
        vm.prank(buyer);
        marketplace.buyNFT{value: 1 ether}(0);

        // Buyer now owns NFT
        assertEq(basicNFT.ownerOf(0), buyer);
        // Seller received payment (minus fees)
        assertGt(seller.balance, sellerBalanceBefore);
        // Listing is no longer active
        assertFalse(marketplace.isListingActive(0));
    }

    function testBuyInsufficientPayment() public {
        vm.startPrank(seller);
        basicNFT.mint(seller, "ipfs://test.json");
        basicNFT.approve(address(marketplace), 0);
        marketplace.listNFT(address(basicNFT), 0, 1, 1 ether, NFTMarketplace.TokenStandard.ERC721);
        vm.stopPrank();

        vm.deal(buyer, 0.5 ether);
        vm.prank(buyer);
        vm.expectRevert(NFTMarketplace.InsufficientPayment.selector);
        marketplace.buyNFT{value: 0.5 ether}(0);
    }

    function testUnlistERC721() public {
        vm.startPrank(seller);
        basicNFT.mint(seller, "ipfs://test.json");
        basicNFT.approve(address(marketplace), 0);
        uint256 listingId = marketplace.listNFT(address(basicNFT), 0, 1, 1 ether, NFTMarketplace.TokenStandard.ERC721);

        marketplace.unlistNFT(listingId);
        vm.stopPrank();

        assertFalse(marketplace.isListingActive(listingId));
        // NFT returned to seller
        assertEq(basicNFT.ownerOf(0), seller);
    }

    function testUpdatePrice() public {
        vm.startPrank(seller);
        basicNFT.mint(seller, "ipfs://test.json");
        basicNFT.approve(address(marketplace), 0);
        uint256 listingId = marketplace.listNFT(address(basicNFT), 0, 1, 1 ether, NFTMarketplace.TokenStandard.ERC721);

        marketplace.updatePrice(listingId, 2 ether);
        vm.stopPrank();

        assertEq(marketplace.getListing(listingId).price, 2 ether);
    }

    function testNotSellerCannotUnlist() public {
        vm.startPrank(seller);
        basicNFT.mint(seller, "ipfs://test.json");
        basicNFT.approve(address(marketplace), 0);
        marketplace.listNFT(address(basicNFT), 0, 1, 1 ether, NFTMarketplace.TokenStandard.ERC721);
        vm.stopPrank();

        vm.prank(buyer);
        vm.expectRevert(NFTMarketplace.NotSeller.selector);
        marketplace.unlistNFT(0);
    }

    // ============ ERC-1155 Listing ============

    function testListERC1155() public {
        vm.startPrank(seller);
        uint256 tokenId = multiNFT.createToken(100, "ipfs://multi.json");
        multiNFT.mint(seller, tokenId, 10, "");
        multiNFT.setApprovalForAll(address(marketplace), true);
        marketplace.listNFT(address(multiNFT), tokenId, 5, 0.5 ether, NFTMarketplace.TokenStandard.ERC1155);
        vm.stopPrank();

        assertEq(multiNFT.balanceOf(address(marketplace), tokenId), 5);
        assertEq(multiNFT.balanceOf(seller, tokenId), 5);
    }

    // ============ Platform Fee ============

    function testSetPlatformFee() public {
        vm.prank(owner);
        marketplace.setPlatformFee(500); // 5%
        assertEq(marketplace.platformFeePercent(), 500);
    }

    function testPlatformFeeTooHigh() public {
        vm.prank(owner);
        vm.expectRevert(NFTMarketplace.FeeTooHigh.selector);
        marketplace.setPlatformFee(2000); // 20% exceeds max
    }

    // ============ Royalty ============

    function testSetRoyalty() public {
        vm.prank(owner);
        marketplace.setRoyalty(address(basicNFT), 0, seller, 500); // 5%
    }

    function testRoyaltyTooHigh() public {
        vm.prank(owner);
        vm.expectRevert(NFTMarketplace.RoyaltyTooHigh.selector);
        marketplace.setRoyalty(address(basicNFT), 0, seller, 2000); // 20%
    }

    // ============ Active Listings ============

    function testGetActiveListings() public {
        vm.startPrank(seller);
        basicNFT.mint(seller, "ipfs://1.json");
        basicNFT.approve(address(marketplace), 0);
        marketplace.listNFT(address(basicNFT), 0, 1, 1 ether, NFTMarketplace.TokenStandard.ERC721);

        basicNFT.mint(seller, "ipfs://2.json");
        basicNFT.approve(address(marketplace), 1);
        marketplace.listNFT(address(basicNFT), 1, 1, 2 ether, NFTMarketplace.TokenStandard.ERC721);
        vm.stopPrank();

        (NFTMarketplace.Listing[] memory active, uint256 total) = marketplace.getActiveListings(0, 10);
        assertEq(total, 2);
        assertEq(active.length, 2);

        // Unlist one
        vm.prank(seller);
        marketplace.unlistNFT(0);

        (active, total) = marketplace.getActiveListings(0, 10);
        assertEq(total, 1);
        assertEq(active.length, 1);
    }
}
