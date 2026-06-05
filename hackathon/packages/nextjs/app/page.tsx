"use client";

import { useMemo, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import NFTGrid from "~~/components/nft/NFTGrid";
import { fetchMetadata } from "~~/lib/metadata";
import type { NFTItem } from "~~/types/nft";

const Home = () => {
  const { address: connectedAddress } = useAccount();

  // Contract addresses
  const { data: basicNFTInfo, isLoading: basicLoading } = useDeployedContractInfo({ contractName: "BasicNFT" });
  const { data: batchNFTInfo, isLoading: batchLoading } = useDeployedContractInfo({ contractName: "BatchNFT" });
  const { data: multiNFTInfo, isLoading: multiLoading } = useDeployedContractInfo({ contractName: "MultiTokenNFT" });

  const contractsLoading = basicLoading || batchLoading || multiLoading;

  // Total minted per contract
  const { data: basicMinted } = useScaffoldReadContract({
    contractName: "BasicNFT",
    functionName: "totalMinted",
  });

  const { data: batchMinted } = useScaffoldReadContract({
    contractName: "BatchNFT",
    functionName: "totalMinted",
  });

  const { data: multiMinted } = useScaffoldReadContract({
    contractName: "MultiTokenNFT",
    functionName: "totalMinted",
  });

  // NFT items state
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const isLoading = contractsLoading || isFetchingMetadata || !basicMinted || !batchMinted || !multiMinted;

  // Fetch all NFTs from all contracts
  useEffect(() => {
    const fetchAllNFTs = async () => {
      if (
        !basicNFTInfo?.address ||
        !batchNFTInfo?.address ||
        !multiNFTInfo?.address ||
        basicMinted === undefined ||
        batchMinted === undefined ||
        multiMinted === undefined
      )
        return;

      setIsFetchingMetadata(true);
      setFetchError(null);

      const items: NFTItem[] = [];

      try {
        // Helper to add NFTs from a contract
        const addNFTs = async (
          contractAddress: string,
          standard: "ERC-721" | "ERC-721A" | "ERC-1155",
          totalMinted: bigint,
        ) => {
          const count = Number(totalMinted);
          for (let i = 0; i < count && i < 50; i++) {
            // Cap at 50 for initial load
            const tokenId = String(i);
            const uri = `${contractAddress}/${tokenId}`;
            try {
              const metadata = await fetchMetadata(uri);
              items.push({
                contractAddress,
                tokenId,
                standard,
                uri,
                metadata: metadata || undefined,
                owner: connectedAddress || "0x0000000000000000000000000000000000000000",
              });
            } catch {
              items.push({
                contractAddress,
                tokenId,
                standard,
                uri,
                owner: connectedAddress || "0x0000000000000000000000000000000000000000",
              });
            }
          }
        };

        await Promise.all([
          addNFTs(basicNFTInfo.address, "ERC-721", basicMinted as bigint),
          addNFTs(batchNFTInfo.address, "ERC-721A", batchMinted as bigint),
          addNFTs(multiNFTInfo.address, "ERC-1155", multiMinted as bigint),
        ]);

        setNfts(items);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : "Failed to fetch NFTs");
      } finally {
        setIsFetchingMetadata(false);
      }
    };

    fetchAllNFTs();
  }, [basicNFTInfo?.address, batchNFTInfo?.address, multiNFTInfo?.address, basicMinted, batchMinted, multiMinted, connectedAddress]);

  const totalMintedAll = useMemo(() => {
    const basic = basicMinted ? Number(basicMinted) : 0;
    const batch = batchMinted ? Number(batchMinted) : 0;
    const multi = multiMinted ? Number(multiMinted) : 0;
    return basic + batch + multi;
  }, [basicMinted, batchMinted, multiMinted]);

  // Error state for contract loading
  if (!contractsLoading && !basicNFTInfo) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4">
        <div className="text-center max-w-md">
          <svg
            className="w-16 h-16 text-red-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Contracts Not Found</h2>
          <p className="text-sm text-gray-500">
            NFT contracts are not deployed on this network. Make sure to run <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">yarn deploy</code> first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col grow pt-8 pb-16 px-4 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">NFT Gallery</h1>
        <p className="text-sm text-gray-500">
          Browse the collection across ERC-721, ERC-721A, and ERC-1155 contracts
        </p>
        {!isLoading && (
          <p className="mt-2 text-xs text-gray-400">
            {totalMintedAll} NFTs minted across 3 contracts
          </p>
        )}
      </div>

      {/* Error banner */}
      {fetchError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700">{fetchError}</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && nfts.length === 0 && !fetchError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg
            className="w-20 h-20 text-gray-300 mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No NFTs minted yet</h3>
          <p className="text-sm text-gray-500 mb-6">Start by minting one!</p>
          <Link
            href="/mint"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Mint Your First NFT
          </Link>
        </div>
      ) : (
        <>
          {/* Mint CTA */}
          <div className="mb-6 flex justify-end">
            <Link
              href="/mint"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Mint NFT
            </Link>
          </div>

          {/* NFT Grid */}
          <NFTGrid nfts={nfts} isLoading={isLoading} />
        </>
      )}

      {/* Admin link */}
      <div className="mt-12 pt-6 border-t border-gray-200 text-center">
        <Link
          href="/admin"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Admin Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Home;
