// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/BatchNFT.sol";

contract BatchNFTTest is Test {
    BatchNFT public nft;
    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    address public user3 = address(0x4);

    function setUp() public {
        vm.prank(owner);
        nft = new BatchNFT("BatchNFT", "BATCH", 100, 10);
    }

    function testConstructor() public view {
        assertEq(nft.name(), "BatchNFT");
        assertEq(nft.symbol(), "BATCH");
        assertEq(nft.maxSupply(), 100);
        assertEq(nft.maxPerWallet(), 10);
    }

    function testCannotMintWhenClosed() public {
        vm.prank(user1);
        vm.expectRevert(BatchNFT.PhaseNotOpen.selector);
        nft.mint(1);
    }

    function testMintWhitelistPhase() public {
        vm.startPrank(owner);
        nft.setPhase(BatchNFT.Phase.Whitelist);
        nft.setWhitelistEnabled(true);
        nft.setWhitelist(toArray(user1), true);
        vm.stopPrank();

        vm.prank(user1);
        nft.mint(3);

        assertEq(nft.balanceOf(user1), 3);
        assertEq(nft.totalMinted(), 3);
        assertEq(nft.ownerOf(1), user1);
        assertEq(nft.ownerOf(2), user1);
        assertEq(nft.ownerOf(3), user1);
    }

    function testNotWhitelistedReverts() public {
        vm.startPrank(owner);
        nft.setPhase(BatchNFT.Phase.Whitelist);
        nft.setWhitelistEnabled(true);
        vm.stopPrank();

        vm.prank(user2);
        vm.expectRevert(BatchNFT.NotWhitelisted.selector);
        nft.mint(1);
    }

    function testPublicMint() public {
        vm.prank(owner);
        nft.setPhase(BatchNFT.Phase.Public);

        vm.prank(user1);
        nft.mint(5);

        assertEq(nft.balanceOf(user1), 5);
    }

    function testMaxPerWallet() public {
        vm.prank(owner);
        nft.setPhase(BatchNFT.Phase.Public);

        vm.startPrank(user1);
        nft.mint(10);
        vm.expectRevert(BatchNFT.MaxPerWalletExceeded.selector);
        nft.mint(1);
        vm.stopPrank();
    }

    function testMaxSupply() public {
        vm.startPrank(owner);
        nft.setPhase(BatchNFT.Phase.Public);
        nft.setMaxPerWallet(100);
        vm.stopPrank();

        vm.prank(user1);
        nft.mint(100);
        assertEq(nft.totalMinted(), 100);

        vm.prank(user2);
        vm.expectRevert(BatchNFT.MaxSupplyExceeded.selector);
        nft.mint(1);
    }

    function testSetBaseURI() public {
        vm.prank(owner);
        nft.setBaseURI("ipfs://QmTest/");

        // mint first
        vm.prank(owner);
        nft.setPhase(BatchNFT.Phase.Public);

        vm.prank(user1);
        nft.mint(1);

        assertEq(nft.tokenURI(1), "ipfs://QmTest/1.json");
    }

    function testTransfer() public {
        vm.prank(owner);
        nft.setPhase(BatchNFT.Phase.Public);

        vm.prank(user1);
        nft.mint(3);

        assertEq(nft.ownerOf(1), user1);

        vm.prank(user1);
        nft.transferFrom(user1, user2, 2);

        assertEq(nft.ownerOf(2), user2);
        assertEq(nft.balanceOf(user1), 2);
        assertEq(nft.balanceOf(user2), 1);
    }

    function testBatchMintGasEfficiency() public {
        vm.startPrank(owner);
        nft.setPhase(BatchNFT.Phase.Public);
        nft.setMaxPerWallet(100);
        vm.stopPrank();

        vm.prank(user1);
        nft.mint(10);

        assertEq(nft.totalMinted(), 10);
        assertEq(nft.balanceOf(user1), 10);
    }

    function testSetWhitelist() public {
        address[] memory accounts = new address[](2);
        accounts[0] = user1;
        accounts[1] = user2;

        vm.prank(owner);
        nft.setWhitelist(accounts, true);

        assertTrue(nft.whitelist(user1));
        assertTrue(nft.whitelist(user2));
    }

    // Helper
    function toArray(address a) internal pure returns (address[] memory) {
        address[] memory arr = new address[](1);
        arr[0] = a;
        return arr;
    }
}
