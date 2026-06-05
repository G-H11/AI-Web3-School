"use client";

import { useCallback } from "react";
import { parseEther } from "viem";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import type { NFTStandard } from "~~/types/nft";

/**
 * 通用 NFT 合约交互 Hook
 * 兼容 ERC-721 / ERC-721A / ERC-1155
 */
export function useNFTContract(contractAddress: string, standard: NFTStandard) {
  const contractName = standard === "ERC-1155" ? "MultiTokenNFT" : standard === "ERC-721A" ? "BatchNFT" : "BasicNFT";

  // ============ 读取 ============

  // name
  const { data: name } = useScaffoldReadContract({
    contractName,
    functionName: "name",
  });

  // symbol
  const { data: symbol } = useScaffoldReadContract({
    contractName,
    functionName: "symbol",
  });

  // totalMinted / totalSupply
  const { data: totalMinted, refetch: refetchTotalMinted } = useScaffoldReadContract({
    contractName,
    functionName: standard === "ERC-721A" ? "totalMinted" : "totalMinted",
  });

  // maxSupply (ERC-721 / ERC-721A)
  const { data: maxSupply } = useScaffoldReadContract({
    contractName,
    functionName: standard === "ERC-1155" ? "getTokenCount" : "maxSupply",
  });

  // baseURI (ERC-721A)
  const { data: baseURI } = useScaffoldReadContract({
    contractName,
    functionName: "baseURI",
  });

  // ============ 写入 ============

  const { writeContractAsync: writeContract, isPending } = useScaffoldWriteContract({
    contractName,
  });

  // ---------- ERC-721 / ERC-721A 铸造 ----------

  const mintERC721 = useCallback(
    async (to: string, uri: string) => {
      return writeContract({
        functionName: "mint",
        args: [to, uri],
      });
    },
    [writeContract],
  );

  const batchMintERC721 = useCallback(
    async (tos: string[], uris: string[]) => {
      return writeContract({
        functionName: "batchMint",
        args: [tos, uris],
      });
    },
    [writeContract],
  );

  // ---------- ERC-721A 批量铸造 ----------

  const mintBatch = useCallback(
    async (quantity: number) => {
      return writeContract({
        functionName: "mint",
        args: [quantity],
      });
    },
    [writeContract],
  );

  // ---------- ERC-1155 铸造 ----------

  const mintERC1155 = useCallback(
    async (to: string, tokenId: number, amount: number) => {
      return writeContract({
        functionName: "mint",
        args: [to, tokenId, amount, "0x"],
      });
    },
    [writeContract],
  );

  const mintBatchERC1155 = useCallback(
    async (to: string, tokenIds: number[], amounts: number[]) => {
      return writeContract({
        functionName: "mintBatch",
        args: [to, tokenIds, amounts, "0x"],
      });
    },
    [writeContract],
  );

  const createToken = useCallback(
    async (maxSupply_: number, uri: string) => {
      return writeContract({
        functionName: "createToken",
        args: [maxSupply_, uri],
      });
    },
    [writeContract],
  );

  // ---------- 管理 ----------

  const setBaseURI = useCallback(
    async (uri: string) => {
      return writeContract({
        functionName: "setBaseURI",
        args: [uri],
      });
    },
    [writeContract],
  );

  const setPhase = useCallback(
    async (phase: number) => {
      return writeContract({
        functionName: "setPhase",
        args: [phase],
      });
    },
    [writeContract],
  );

  const setWhitelist = useCallback(
    async (accounts: string[], status: boolean) => {
      return writeContract({
        functionName: "setWhitelist",
        args: [accounts, status],
      });
    },
    [writeContract],
  );

  return {
    // 读取
    name,
    symbol,
    totalMinted,
    maxSupply,
    baseURI,
    refetchTotalMinted,
    // 写入
    isPending,
    mintERC721,
    batchMintERC721,
    mintBatch,
    mintERC1155,
    mintBatchERC1155,
    createToken,
    setBaseURI,
    setPhase,
    setWhitelist,
  };
}
