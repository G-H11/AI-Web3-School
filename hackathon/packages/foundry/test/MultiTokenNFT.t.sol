// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/MultiTokenNFT.sol";

contract MultiTokenNFTTest is Test {
    MultiTokenNFT public nft;
    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);

    function setUp() public {
        vm.prank(owner);
        nft = new MultiTokenNFT("MultiToken", "MULTI", "ipfs://base/");
    }

    function testConstructor() public view {
        assertEq(nft.name(), "MultiToken");
        assertEq(nft.symbol(), "MULTI");
    }

    function testCreateToken() public {
        vm.prank(owner);
        uint256 tokenId = nft.createToken(100, "ipfs://token/1.json");
        assertEq(tokenId, 0);

        MultiTokenNFT.TokenInfo memory info = nft.getTokenInfo(0);
        assertEq(info.maxSupply, 100);
        assertEq(info.uri, "ipfs://token/1.json");
    }

    function testMint() public {
        vm.startPrank(owner);
        uint256 tokenId = nft.createToken(100, "ipfs://token/1.json");
        nft.mint(user1, tokenId, 5, "");
        vm.stopPrank();

        assertEq(nft.balanceOf(user1, tokenId), 5);
        assertEq(nft.totalMinted(tokenId), 5);
    }

    function testMintBatch() public {
        vm.startPrank(owner);
        uint256 t0 = nft.createToken(100, "ipfs://0.json");
        uint256 t1 = nft.createToken(50, "ipfs://1.json");
        uint256 t2 = nft.createToken(200, "ipfs://2.json");

        uint256[] memory ids = new uint256[](3);
        ids[0] = t0; ids[1] = t1; ids[2] = t2;

        uint256[] memory amounts = new uint256[](3);
        amounts[0] = 10; amounts[1] = 20; amounts[2] = 30;

        nft.mintBatch(user1, ids, amounts, "");
        vm.stopPrank();

        assertEq(nft.balanceOf(user1, t0), 10);
        assertEq(nft.balanceOf(user1, t1), 20);
        assertEq(nft.balanceOf(user1, t2), 30);
    }

    function testMintExceedsSupply() public {
        vm.startPrank(owner);
        uint256 tokenId = nft.createToken(10, "ipfs://token.json");
        nft.mint(user1, tokenId, 10, "");

        vm.expectRevert("Max supply exceeded");
        nft.mint(user1, tokenId, 1, "");
        vm.stopPrank();
    }

    function testOnlyOwnerMint() public {
        vm.prank(owner);
        nft.createToken(100, "ipfs://token.json");

        vm.prank(user1);
        vm.expectRevert();
        nft.mint(user1, 0, 1, "");
    }

    function testTokenURI() public {
        vm.prank(owner);
        uint256 tokenId = nft.createToken(100, "ipfs://custom/uri.json");
        assertEq(nft.uri(tokenId), "ipfs://custom/uri.json");
    }

    function testSetTokenURI() public {
        vm.startPrank(owner);
        uint256 tokenId = nft.createToken(100, "ipfs://old.json");
        nft.setTokenURI(tokenId, "ipfs://new.json");
        vm.stopPrank();
        assertEq(nft.uri(tokenId), "ipfs://new.json");
    }

    function testGetTokenCount() public {
        vm.startPrank(owner);
        nft.createToken(100, "");
        nft.createToken(100, "");
        nft.createToken(100, "");
        vm.stopPrank();
        assertEq(nft.getTokenCount(), 3);
    }

    function testBatchTransfer() public {
        vm.startPrank(owner);
        uint256 t0 = nft.createToken(100, "");
        nft.mint(user1, t0, 10, "");
        vm.stopPrank();

        uint256[] memory ids = new uint256[](1);
        ids[0] = t0;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 5;

        vm.prank(user1);
        nft.safeBatchTransferFrom(user1, user2, ids, amounts, "");

        assertEq(nft.balanceOf(user1, t0), 5);
        assertEq(nft.balanceOf(user2, t0), 5);
    }

    function testUnlimitedSupply() public {
        vm.startPrank(owner);
        uint256 tokenId = nft.createToken(0, ""); // 0 = unlimited
        nft.mint(user1, tokenId, 1000, "");
        vm.stopPrank();
        assertEq(nft.totalMinted(tokenId), 1000);
    }
}
