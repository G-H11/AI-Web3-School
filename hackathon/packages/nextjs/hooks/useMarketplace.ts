"use client";

import { useCallback } from "react";
import { parseEther } from "viem";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import type { MarketplaceListing } from "~~/types/nft";

export function useMarketplace() {
  const contractName = "NFTMarketplace";

  // ============ 读取 ============

  const { data: listingCount, refetch: refetchListingCount } = useScaffoldReadContract({
    contractName,
    functionName: "getListingCount",
  });

  const { data: platformFeePercent } = useScaffoldReadContract({
    contractName,
    functionName: "platformFeePercent",
  });

  // ============ 写入 ============

  const { writeContractAsync: writeContract, isPending } = useScaffoldWriteContract({
    contractName,
  });

  const listERC721 = useCallback(
    async (nftAddress: string, tokenId: number, priceInEth: string) => {
      return writeContract({
        functionName: "listNFT",
        args: [nftAddress, tokenId, 1n, parseEther(priceInEth), 0], // 0 = ERC721
      });
    },
    [writeContract],
  );

  const listERC1155 = useCallback(
    async (nftAddress: string, tokenId: number, amount: number, priceInEth: string) => {
      return writeContract({
        functionName: "listNFT",
        args: [nftAddress, tokenId, amount, parseEther(priceInEth), 1], // 1 = ERC1155
      });
    },
    [writeContract],
  );

  const unlistNFT = useCallback(
    async (listingId: number) => {
      return writeContract({
        functionName: "unlistNFT",
        args: [listingId],
      });
    },
    [writeContract],
  );

  const buyNFT = useCallback(
    async (listingId: number, priceInWei: string | bigint) => {
      return writeContract({
        functionName: "buyNFT",
        args: [listingId],
        value: BigInt(priceInWei),
      });
    },
    [writeContract],
  );

  const updatePrice = useCallback(
    async (listingId: number, newPriceInEth: string) => {
      return writeContract({
        functionName: "updatePrice",
        args: [listingId, parseEther(newPriceInEth)],
      });
    },
    [writeContract],
  );

  return {
    listingCount,
    platformFeePercent,
    refetchListingCount,
    isPending,
    listERC721,
    listERC1155,
    unlistNFT,
    buyNFT,
    updatePrice,
  };
}
