"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAccount } from "wagmi";
import { parseEther } from "viem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useMarketplace } from "~~/hooks/useMarketplace";
import { fetchMetadata, resolveIPFSUrl, shortenAddress, formatEther } from "~~/lib/metadata";
import type { NFTMetadata, MarketplaceListing, NFTStandard, TransactionStatus } from "~~/types/nft";
import PurchaseModal from "~~/components/nft/PurchaseModal";

type PageState = "loading" | "loaded" | "error" | "not_found";

const NFTDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { address: connectedAddress, isConnected } = useAccount();

  const contractAddress = (params.address as string) || "";
  const tokenId = (params.tokenId as string) || "";

  // State
  const [pageState, setPageState] = useState<PageState>("loading");
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [owner, setOwner] = useState<string>("");
  const [standard, setStandard] = useState<NFTStandard>("ERC-721");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // List for sale state
  const [showListForm, setShowListForm] = useState(false);
  const [listPrice, setListPrice] = useState("");
  const [listStatus, setListStatus] = useState<TransactionStatus>("idle");
  const [listError, setListError] = useState<string | null>(null);

  // Purchase modal state
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [isBuying, setIsBuying] = useState(false);

  // Marketplace
  const marketplace = useMarketplace();

  // Fetch tokenURI from the relevant contract
  // We need to determine which contract to query based on the address
  const { data: tokenURI } = useScaffoldReadContract({
    contractName: "BasicNFT",
    functionName: "tokenURI",
    args: [BigInt(tokenId || "0")],
  });

  const { data: batchTokenURI } = useScaffoldReadContract({
    contractName: "BatchNFT",
    functionName: "tokenURI",
    args: [BigInt(tokenId || "0")],
  });

  const { data: multiTokenURI } = useScaffoldReadContract({
    contractName: "MultiTokenNFT",
    functionName: "uri",
    args: [BigInt(tokenId || "0")],
  });

  // Fetch owner for ERC-721/721A
  const { data: basicOwner } = useScaffoldReadContract({
    contractName: "BasicNFT",
    functionName: "ownerOf",
    args: [BigInt(tokenId || "0")],
  });

  const { data: batchOwner } = useScaffoldReadContract({
    contractName: "BatchNFT",
    functionName: "ownerOf",
    args: [BigInt(tokenId || "0")],
  });

  // Fetch listings for this NFT
  const { data: marketplaceEventsData } = useScaffoldReadContract({
    contractName: "NFTMarketplace",
    functionName: "getActiveListings",
    args: [0n, 50n],
  });

  // Derive URI from whichever contract has it
  const uri = useMemo(() => {
    // Try each contract's URI
    const normalized = contractAddress.toLowerCase();
    // We use whatever URI is available
    return (tokenURI as string) || (batchTokenURI as string) || (multiTokenURI as string) || "";
  }, [tokenURI, batchTokenURI, multiTokenURI, contractAddress]);

  // Derive owner
  const resolvedOwner = useMemo(() => {
    return (basicOwner as string) || (batchOwner as string) || "";
  }, [basicOwner, batchOwner]);

  // Load metadata
  useEffect(() => {
    const loadMetadata = async () => {
      if (!contractAddress || !tokenId) {
        setPageState("not_found");
        return;
      }

      setPageState("loading");

      try {
        if (uri) {
          const meta = await fetchMetadata(uri);
          if (meta) {
            setMetadata(meta);
          } else {
            setMetadata(null);
          }
        }
      } catch {
        // Metadata fetch failed, continue anyway
      }

      if (resolvedOwner) {
        setOwner(resolvedOwner as string);
      }

      setPageState("loaded");
    };

    loadMetadata();
  }, [contractAddress, tokenId, uri, resolvedOwner]);

  // Filter marketplace listings for this NFT
  const nftListings = useMemo(() => {
    if (!marketplaceEventsData || !contractAddress || !tokenId) return [];

    const listings = marketplaceEventsData as unknown as MarketplaceListing[];
    if (!Array.isArray(listings)) return [];

    return listings.filter(
      (listing) =>
        listing.nftContract.toLowerCase() === contractAddress.toLowerCase() &&
        listing.tokenId === tokenId &&
        listing.active,
    );
  }, [marketplaceEventsData, contractAddress, tokenId]);

  const isOwner = useMemo(() => {
    return connectedAddress?.toLowerCase() === owner.toLowerCase();
  }, [connectedAddress, owner]);

  // List for sale
  const handleList = useCallback(async () => {
    if (!listPrice || !contractAddress || !tokenId) return;

    setListStatus("pending");
    setListError(null);

    try {
      // Determine standard based on contract address
      // For simplicity, default to ERC-721 listing
      await marketplace.listERC721(contractAddress, Number(tokenId), listPrice);
      setListStatus("success");
      setShowListForm(false);
      setListPrice("");
    } catch (err) {
      setListStatus("error");
      setListError(err instanceof Error ? err.message : "Failed to list NFT");
    }
  }, [listPrice, contractAddress, tokenId, marketplace]);

  // Buy NFT
  const handleBuy = useCallback(
    async (listing: MarketplaceListing) => {
      setIsBuying(true);
      try {
        await marketplace.buyNFT(Number(listing.listingId), listing.price);
        setSelectedListing(null);
      } catch (err) {
        // Error handled in modal
      } finally {
        setIsBuying(false);
      }
    },
    [marketplace],
  );

  // Image URL
  const imageUrl = useMemo(() => {
    if (!metadata?.image) return null;
    return resolveIPFSUrl(metadata.image);
  }, [metadata]);

  // Attributes
  const attributes = metadata?.attributes || [];
  const name = metadata?.name || `Token #${tokenId}`;
  const description = metadata?.description || "No description available";

  // Loading state
  if (pageState === "loading") {
    return (
      <div className="flex flex-col grow pt-8 pb-16 px-4 max-w-4xl mx-auto w-full">
        <div className="animate-pulse space-y-8">
          <div className="h-6 w-32 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square w-full bg-gray-200 rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 bg-gray-200 rounded" />
              <div className="h-4 w-1/4 bg-gray-200 rounded" />
              <div className="h-20 w-full bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (pageState === "not_found") {
    return (
      <div className="flex flex-col items-center justify-center grow py-24 px-4">
        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">NFT Not Found</h2>
        <p className="text-sm text-gray-500 mb-6">The NFT you are looking for does not exist or has been removed.</p>
        <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
          ← Back to Gallery
        </Link>
      </div>
    );
  }

  // Error state
  if (pageState === "error") {
    return (
      <div className="flex flex-col items-center justify-center grow py-24 px-4">
        <svg className="w-16 h-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Failed to Load NFT</h2>
        <p className="text-sm text-gray-500 mb-6">{errorMessage || "An unexpected error occurred."}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col grow pt-8 pb-16 px-4 max-w-4xl mx-auto w-full">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors w-fit"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Gallery
      </Link>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Image */}
        <div className="relative aspect-square w-full bg-gray-100 rounded-xl overflow-hidden">
          {imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = "none";
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-300">
              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="space-y-6">
          {/* Name & Token ID */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300">
                {standard}
              </span>
              <span className="text-sm text-gray-500 font-mono">#{tokenId}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
          </div>

          {/* Contract Info */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contract</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Address</span>
                <span className="font-mono text-gray-700" title={contractAddress}>
                  {shortenAddress(contractAddress, 6)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Token ID</span>
                <span className="font-mono text-gray-700">#{tokenId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Standard</span>
                <span className="text-gray-700">{standard}</span>
              </div>
            </div>
          </div>

          {/* Owner */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Owner</p>
              <p className="text-sm font-mono text-gray-800" title={owner}>
                {owner ? shortenAddress(owner, 6) : "Unknown"}
              </p>
              {isOwner && connectedAddress && (
                <p className="text-xs text-blue-600 font-medium mt-0.5">You own this NFT</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Owner can list for sale */}
            {isOwner && isConnected && (
              <div>
                {!showListForm ? (
                  <button
                    onClick={() => setShowListForm(true)}
                    className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    List for Sale
                  </button>
                ) : (
                  <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-blue-800">List NFT for Sale</h4>
                      <button
                        onClick={() => {
                          setShowListForm(false);
                          setListError(null);
                          setListStatus("idle");
                        }}
                        className="p-1 text-blue-400 hover:text-blue-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div>
                      <label htmlFor="list-price" className="block text-xs font-medium text-gray-700 mb-1">
                        Price in ETH
                      </label>
                      <input
                        id="list-price"
                        type="number"
                        step="0.001"
                        min="0"
                        value={listPrice}
                        onChange={(e) => setListPrice(e.target.value)}
                        placeholder="0.01"
                        disabled={listStatus === "pending"}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    {listError && (
                      <p className="text-xs text-red-600">{listError}</p>
                    )}

                    <button
                      onClick={handleList}
                      disabled={!listPrice || listStatus === "pending"}
                      className="w-full py-2 px-4 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                      {listStatus === "pending" ? "Confirming..." : "List NFT"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Marketplace listings */}
            {nftListings.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Active Listings ({nftListings.length})
                </h4>
                {nftListings.map((listing) => (
                  <div
                    key={listing.listingId}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div>
                      <p className="text-lg font-bold text-green-700">
                        {formatEther(listing.price)} ETH
                      </p>
                      <p className="text-xs text-green-600">
                        Seller: {shortenAddress(listing.seller)}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedListing(listing)}
                      disabled={isOwner || !isConnected}
                      className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                      title={isOwner ? "You own this NFT" : ""}
                    >
                      {isOwner ? "Yours" : "Buy"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* No listings, not owner */}
            {nftListings.length === 0 && !isOwner && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="text-sm text-gray-500">This NFT is not currently listed for sale.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attributes */}
      {attributes.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attributes</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {attributes.map((attr, index) => (
              <div
                key={`${attr.trait_type}-${index}`}
                className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center"
              >
                <p className="text-xs text-gray-500 uppercase tracking-wider">{attr.trait_type}</p>
                <p className="text-sm font-medium text-gray-900 mt-1 truncate">{attr.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      {selectedListing && (
        <PurchaseModal
          listing={{
            ...selectedListing,
            metadata: metadata || undefined,
            ownerAddress: owner,
          }}
          isOpen={!!selectedListing}
          onClose={() => {
            if (!isBuying) setSelectedListing(null);
          }}
          onBuy={async () => {
            await handleBuy(selectedListing);
          }}
          isBuying={isBuying}
        />
      )}
    </div>
  );
};

export default NFTDetailPage;
