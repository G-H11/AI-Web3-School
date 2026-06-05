// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../contracts/BasicNFT.sol";
import "../contracts/BatchNFT.sol";
import "../contracts/MultiTokenNFT.sol";
import "../contracts/NFTMarketplace.sol";

/// @title DeployAll — 一键部署所有合约
contract DeployAll is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy BasicNFT (ERC-721)
        BasicNFT basicNFT = new BasicNFT(
            "Galaxy Cats",
            "GCAT",
            1000
        );
        console.log("BasicNFT deployed at:", address(basicNFT));

        // 2. Deploy BatchNFT (ERC-721A style)
        BatchNFT batchNFT = new BatchNFT(
            "Pixel Punks",
            "PUNK",
            5000,
            20
        );
        console.log("BatchNFT deployed at:", address(batchNFT));

        // 3. Deploy MultiTokenNFT (ERC-1155)
        MultiTokenNFT multiNFT = new MultiTokenNFT(
            "Crypto Assets",
            "CASSET",
            ""
        );
        console.log("MultiTokenNFT deployed at:", address(multiNFT));

        // 4. Deploy NFTMarketplace
        NFTMarketplace marketplace = new NFTMarketplace();
        console.log("NFTMarketplace deployed at:", address(marketplace));

        vm.stopBroadcast();

        console.log("\n=== Deployment Summary ===");
        console.log("BasicNFT:      ", address(basicNFT));
        console.log("BatchNFT:      ", address(batchNFT));
        console.log("MultiTokenNFT: ", address(multiNFT));
        console.log("Marketplace:   ", address(marketplace));
        console.log("Deployer:      ", vm.addr(deployerPrivateKey));
    }
}
