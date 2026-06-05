"use client";

import { useState, useMemo } from "react";
import type { NFTItem, NFTStandard } from "~~/types/nft";
import NFTCard from "./NFTCard";

type Props = {
  nfts: NFTItem[];
  isLoading: boolean;
};

const FILTER_TABS: Array<{ label: string; value: NFTStandard | "All" }> = [
  { label: "All", value: "All" },
  { label: "ERC-721", value: "ERC-721" },
  { label: "ERC-721A", value: "ERC-721A" },
  { label: "ERC-1155", value: "ERC-1155" },
];

const SkeletonCard = () => (
  <div className="rounded-xl border border-gray-200 bg-white overflow-hidden animate-pulse">
    <div className="aspect-square w-full bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="flex justify-between">
        <div className="h-5 w-16 bg-gray-200 rounded" />
        <div className="h-4 w-10 bg-gray-200 rounded" />
      </div>
      <div className="h-4 w-3/4 bg-gray-200 rounded" />
      <div className="h-3 w-full bg-gray-200 rounded" />
      <div className="h-3 w-2/3 bg-gray-200 rounded" />
      <div className="pt-3 border-t border-gray-100">
        <div className="h-3 w-24 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

const NFTGrid = ({ nfts, isLoading }: Props) => {
  const [activeTab, setActiveTab] = useState<NFTStandard | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNFTs = useMemo(() => {
    let result = nfts;

    // Filter by standard
    if (activeTab !== "All") {
      result = result.filter((nft) => nft.standard === activeTab);
    }

    // Filter by search query (match against name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((nft) => {
        const name = nft.metadata?.name?.toLowerCase() || "";
        const desc = nft.metadata?.description?.toLowerCase() || "";
        const tokenId = nft.tokenId.toLowerCase();
        return name.includes(query) || desc.includes(query) || tokenId.includes(query);
      });
    }

    return result;
  }, [nfts, activeTab, searchQuery]);

  return (
    <div className="w-full">
      {/* Header: Search + Filter Tabs */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, description, or token ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredNFTs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-sm font-medium">No NFTs found</p>
          {searchQuery && (
            <p className="text-xs mt-1">Try adjusting your search or filter</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredNFTs.map((nft) => (
            <NFTCard
              key={`${nft.contractAddress}-${nft.tokenId}`}
              nft={nft}
            />
          ))}
        </div>
      )}

      {/* Result count */}
      {!isLoading && filteredNFTs.length > 0 && (
        <p className="mt-4 text-xs text-gray-400">
          Showing {filteredNFTs.length} of {nfts.length} NFTs
        </p>
      )}
    </div>
  );
};

export default NFTGrid;
