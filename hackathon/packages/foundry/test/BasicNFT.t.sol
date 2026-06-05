// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/BasicNFT.sol";

contract BasicNFTTest is Test {
    BasicNFT public nft;
    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);

    function setUp() public {
        vm.startPrank(owner);
        nft = new BasicNFT("BasicNFT", "BNFT", 100);
        vm.stopPrank();
    }

    function testConstructor() public view {
        assertEq(nft.name(), "BasicNFT");
        assertEq(nft.symbol(), "BNFT");
        assertEq(nft.maxSupply(), 100);
        assertEq(nft.owner(), owner);
    }

    function testMint() public {
        vm.prank(owner);
        uint256 tokenId = nft.mint(user1, "ipfs://QmTest/1.json");
        assertEq(tokenId, 0);
        assertEq(nft.ownerOf(0), user1);
        assertEq(nft.tokenURI(0), "ipfs://QmTest/1.json");
        assertEq(nft.totalMinted(), 1);
    }

    function testMintOnlyOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        nft.mint(user1, "ipfs://QmTest/1.json");
    }

    function testBatchMint() public {
        address[] memory tos = new address[](3);
        tos[0] = user1;
        tos[1] = user1;
        tos[2] = user2;

        string[] memory uris = new string[](3);
        uris[0] = "ipfs://QmTest/1.json";
        uris[1] = "ipfs://QmTest/2.json";
        uris[2] = "ipfs://QmTest/3.json";

        vm.prank(owner);
        nft.batchMint(tos, uris);

        assertEq(nft.ownerOf(0), user1);
        assertEq(nft.ownerOf(1), user1);
        assertEq(nft.ownerOf(2), user2);
        assertEq(nft.totalMinted(), 3);
    }

    function testBatchMintLengthMismatch() public {
        address[] memory tos = new address[](2);
        string[] memory uris = new string[](3);

        vm.prank(owner);
        vm.expectRevert("Arrays length mismatch");
        nft.batchMint(tos, uris);
    }

    function testMaxSupply() public {
        vm.startPrank(owner);
        // 铸造 100 个
        for (uint256 i = 0; i < 100; i++) {
            nft.mint(user1, string(abi.encodePacked("ipfs://", vm.toString(i))));
        }
        assertEq(nft.totalMinted(), 100);

        vm.expectRevert("Max supply reached");
        nft.mint(user1, "ipfs://overflow.json");
        vm.stopPrank();
    }

    function testBatchMintMaxSupply() public {
        vm.prank(owner);
        // 铸造 99 个
        address[] memory tos99 = new address[](99);
        string[] memory uris99 = new string[](99);
        for (uint256 i = 0; i < 99; i++) {
            tos99[i] = user1;
            uris99[i] = "ipfs://test.json";
        }
        nft.batchMint(tos99, uris99);

        // 再铸造 2 个应该失败
        address[] memory tos2 = new address[](2);
        string[] memory uris2 = new string[](2);
        tos2[0] = user2; tos2[1] = user2;
        uris2[0] = "ipfs://test.json"; uris2[1] = "ipfs://test.json";

        vm.prank(owner);
        vm.expectRevert("Would exceed max supply");
        nft.batchMint(tos2, uris2);
    }

    function testTokenURI() public {
        vm.prank(owner);
        nft.mint(user1, "ipfs://custom-uri.json");
        assertEq(nft.tokenURI(0), "ipfs://custom-uri.json");
    }
}
