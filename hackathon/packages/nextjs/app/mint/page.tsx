"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useNFTContract } from "~~/hooks/useNFTContract";
import { useIPFS } from "~~/hooks/useIPFS";
import { generateMetadata } from "~~/lib/metadata";
import MintForm from "~~/components/nft/MintForm";
import BatchMintForm from "~~/components/nft/BatchMintForm";
import type { MintFormData, BatchMintItem, NFTStandard, UploadProgress } from "~~/types/nft";

type Tab = "standard" | "batch" | "1155";

const TABS: { key: Tab; label: string; description: string }[] = [
  { key: "standard", label: "Standard Mint", description: "Mint a single ERC-721 NFT" },
  { key: "batch", label: "Batch Mint", description: "Mint multiple ERC-721A NFTs at once" },
  { key: "1155", label: "1155 Mint", description: "Create & mint ERC-1155 tokens" },
];

const MintPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<Tab>("standard");

  // Contract addresses
  const { data: basicNFTInfo } = useDeployedContractInfo({ contractName: "BasicNFT" });
  const { data: batchNFTInfo } = useDeployedContractInfo({ contractName: "BatchNFT" });
  const { data: multiNFTInfo } = useDeployedContractInfo({ contractName: "MultiTokenNFT" });

  // Contract hooks
  const basicContract = useNFTContract(basicNFTInfo?.address || "", "ERC-721");
  const batchContract = useNFTContract(batchNFTInfo?.address || "", "ERC-721A");
  const multiContract = useNFTContract(multiNFTInfo?.address || "", "ERC-1155");

  // IPFS
  const ipfs = useIPFS();

  // Mint state
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState<{ count: number; tokenIds?: string[] } | null>(null);
  const [mintError, setMintError] = useState<string | null>(null);
  const [lastMintedTokenId, setLastMintedTokenId] = useState<string | null>(null);

  // Upload progress tracking
  const [combinedProgress, setCombinedProgress] = useState<UploadProgress>({ status: "idle", progress: 0 });

  // Standard / 1155 mint handler
  const handleStandardMint = useCallback(
    async (data: MintFormData) => {
      if (!connectedAddress) return;
      setIsMinting(true);
      setMintError(null);
      setMintSuccess(null);

      try {
        // 1. Upload image to IPFS
        if (!data.image) throw new Error("No image provided");

        setCombinedProgress({ status: "uploading", progress: 0 });
        const imageUri = await ipfs.uploadImage(data.image);
        if (!imageUri) {
          setCombinedProgress({ status: "error", progress: 0, error: "Image upload failed" });
          return;
        }
        setCombinedProgress({ status: "uploading", progress: 60 });

        // 2. Upload metadata
        const metadata = generateMetadata({
          name: data.name,
          description: data.description,
          image: imageUri,
        });

        const metadataUri = await ipfs.uploadMetadata(metadata);
        if (!metadataUri) {
          setCombinedProgress({ status: "error", progress: 0, error: "Metadata upload failed" });
          return;
        }
        setCombinedProgress({ status: "done", progress: 100 });

        // 3. Mint
        const recipient = data.recipient || connectedAddress;

        if (data.standard === "ERC-1155") {
          // For ERC-1155, use createToken then mint
          await multiContract.createToken(1000, metadataUri);
          setLastMintedTokenId(String(multiContract.totalMinted || 0));
        } else {
          // ERC-721 / ERC-721A
          if (data.standard === "ERC-721A" && data.amount && data.amount > 1) {
            // For 721A with quantity, use batch mint approach
            await batchContract.mintBatch(data.amount);
          } else {
            await basicContract.mintERC721(recipient, metadataUri);
          }
        }

        setMintSuccess({ count: data.amount || 1 });
        ipfs.reset();
      } catch (err) {
        setMintError(err instanceof Error ? err.message : "Mint failed");
        setCombinedProgress({ status: "error", progress: 0 });
      } finally {
        setIsMinting(false);
      }
    },
    [connectedAddress, ipfs, basicContract, batchContract, multiContract],
  );

  // Batch mint handler
  const handleBatchMint = useCallback(
    async (items: BatchMintItem[], recipient?: string) => {
      if (!connectedAddress) return;
      setIsMinting(true);
      setMintError(null);
      setMintSuccess(null);

      try {
        const to = recipient || connectedAddress;
        const tos: string[] = [];
        const uris: string[] = [];

        for (let i = 0; i < items.length; i++) {
          const item = items[i];

          // Upload image
          setCombinedProgress({ status: "uploading", progress: Math.round((i / items.length) * 70) });

          const imageUri = await ipfs.uploadImage(item.image);
          if (!imageUri) throw new Error(`Failed to upload image for item ${i + 1}`);

          // Upload metadata
          const metadata = generateMetadata({
            name: item.name,
            description: item.description,
            image: imageUri,
          });

          const metadataUri = await ipfs.uploadMetadata(metadata);
          if (!metadataUri) throw new Error(`Failed to upload metadata for item ${i + 1}`);

          tos.push(to);
          uris.push(metadataUri);
        }

        setCombinedProgress({ status: "uploading", progress: 80 });

        // Batch mint on-chain
        await batchContract.batchMintERC721(tos, uris);

        setCombinedProgress({ status: "done", progress: 100 });
        setMintSuccess({ count: items.length });
        ipfs.reset();
      } catch (err) {
        setMintError(err instanceof Error ? err.message : "Batch mint failed");
        setCombinedProgress({ status: "error", progress: 0 });
      } finally {
        setIsMinting(false);
      }
    },
    [connectedAddress, ipfs, batchContract],
  );

  // 1155 mint handler (uses same form, different backend)
  const handle1155Mint = useCallback(
    async (data: MintFormData) => {
      if (!connectedAddress) return;
      setIsMinting(true);
      setMintError(null);
      setMintSuccess(null);

      try {
        if (!data.image) throw new Error("No image provided");

        // 1. Upload image
        setCombinedProgress({ status: "uploading", progress: 0 });
        const imageUri = await ipfs.uploadImage(data.image);
        if (!imageUri) {
          setCombinedProgress({ status: "error", progress: 0, error: "Image upload failed" });
          return;
        }
        setCombinedProgress({ status: "uploading", progress: 60 });

        // 2. Upload metadata
        const metadata = generateMetadata({
          name: data.name,
          description: data.description,
          image: imageUri,
        });

        const metadataUri = await ipfs.uploadMetadata(metadata);
        if (!metadataUri) {
          setCombinedProgress({ status: "error", progress: 0, error: "Metadata upload failed" });
          return;
        }
        setCombinedProgress({ status: "done", progress: 100 });

        // 3. Create ERC-1155 token + mint
        const recipient = data.recipient || connectedAddress;
        const amount = data.amount || 1;

        // Create token first (maxSupply 1000 for new token type)
        await multiContract.createToken(1000, metadataUri);

        // Get the new token ID (current count)
        const newTokenId = multiContract.totalMinted ? Number(multiContract.totalMinted) : 0;

        // Mint amount to recipient
        await multiContract.mintERC1155(recipient, newTokenId, amount);

        setLastMintedTokenId(String(newTokenId));
        setMintSuccess({ count: amount });
        ipfs.reset();
      } catch (err) {
        setMintError(err instanceof Error ? err.message : "1155 mint failed");
        setCombinedProgress({ status: "error", progress: 0 });
      } finally {
        setIsMinting(false);
      }
    },
    [connectedAddress, ipfs, multiContract],
  );

  // Build contracts list for MintForm
  const standardContracts = basicNFTInfo
    ? [{ address: basicNFTInfo.address, standard: "ERC-721" as NFTStandard, name: "BasicNFT" }]
    : [];

  const multiContracts = multiNFTInfo
    ? [{ address: multiNFTInfo.address, standard: "ERC-1155" as NFTStandard, name: "MultiTokenNFT" }]
    : [];

  const hasContracts = basicNFTInfo || batchNFTInfo || multiNFTInfo;

  return (
    <div className="flex flex-col grow pt-8 pb-16 px-4 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mint NFTs</h1>
        <p className="text-sm text-gray-500">Create your unique NFTs with IPFS storage</p>
      </div>

      {/* Success state */}
      {mintSuccess && (
        <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-xl text-center">
          <svg
            className="w-12 h-12 text-green-500 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <h3 className="text-lg font-semibold text-green-800 mb-1">
            {mintSuccess.count > 1
              ? `${mintSuccess.count} NFTs minted successfully!`
              : "NFT minted successfully!"}
          </h3>
          <p className="text-sm text-green-600 mb-4">
            Your NFT{ mintSuccess.count > 1 ? "s are" : " is"} now available in the gallery.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setMintSuccess(null);
                setMintError(null);
              }}
              className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-200 rounded-lg hover:bg-green-200 transition-colors"
            >
              Mint Another
            </button>
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              View Gallery
            </Link>
          </div>
        </div>
      )}

      {/* Error state */}
      {mintError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Mint Failed</p>
            <p className="text-sm text-red-700 mt-0.5">{mintError}</p>
          </div>
          <button
            onClick={() => setMintError(null)}
            className="p-1 text-red-400 hover:text-red-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* No contracts */}
      {!hasContracts && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-sm text-yellow-700">
            No NFT contracts found. Run <code className="bg-yellow-100 px-1.5 py-0.5 rounded text-xs">yarn deploy</code> first.
          </p>
        </div>
      )}

      {/* Wallet check */}
      {!isConnected && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <p className="text-sm text-yellow-700 font-medium">Connect your wallet to mint NFTs</p>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setMintSuccess(null);
                setMintError(null);
                ipfs.reset();
              }}
              disabled={isMinting}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="block">{tab.label}</span>
              <span className="block text-[10px] opacity-60">{tab.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {/* Standard Mint */}
        {activeTab === "standard" && (
          <MintForm
            contracts={standardContracts}
            onSubmit={handleStandardMint}
            uploadProgress={combinedProgress}
            walletReady={isConnected}
            isMinting={isMinting}
          />
        )}

        {/* Batch Mint */}
        {activeTab === "batch" && batchNFTInfo && (
          <BatchMintForm
            contractAddress={batchNFTInfo.address}
            standard="ERC-721A"
            onMint={handleBatchMint}
            isMinting={isMinting}
          />
        )}

        {activeTab === "batch" && !batchNFTInfo && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">BatchNFT contract not found. Deploy it first.</p>
          </div>
        )}

        {/* 1155 Mint */}
        {activeTab === "1155" && multiNFTInfo && (
          <MintForm
            contracts={multiContracts}
            onSubmit={handle1155Mint}
            uploadProgress={combinedProgress}
            walletReady={isConnected}
            isMinting={isMinting}
          />
        )}

        {activeTab === "1155" && !multiNFTInfo && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">MultiTokenNFT contract not found. Deploy it first.</p>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Back to Gallery
        </Link>
      </div>
    </div>
  );
};

export default MintPage;
