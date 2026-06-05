"use client";

import Link from "next/link";
import Image from "next/image";
import type { NFTItem, NFTMetadata } from "~~/types/nft";
import { shortenAddress } from "~~/lib/metadata";

type Props = {
  nft: NFTItem & { metadata?: NFTMetadata };
};

const BADGE_STYLES: Record<string, string> = {
  "ERC-721": "bg-blue-100 text-blue-800 border-blue-300",
  "ERC-721A": "bg-green-100 text-green-800 border-green-300",
  "ERC-1155": "bg-purple-100 text-purple-800 border-purple-300",
};

const NFTCard = ({ nft }: Props) => {
  const { contractAddress, tokenId, standard, owner, metadata } = nft;
  const imageUrl = metadata?.image || null;
  const name = metadata?.name || `Token #${tokenId}`;
  const description = metadata?.description || "No description available";
  const badgeStyle = BADGE_STYLES[standard] || "bg-gray-100 text-gray-800 border-gray-300";

  return (
    <Link
      href={`/nft/${contractAddress}/${tokenId}`}
      className="group block rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent && !parent.querySelector(".nft-placeholder")) {
                const placeholder = document.createElement("div");
                placeholder.className =
                  "nft-placeholder absolute inset-0 flex items-center justify-center text-gray-400";
                placeholder.innerHTML =
                  '<svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>';
                parent.appendChild(placeholder);
              }
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Content */}
      <div className="p-4">
        {/* Badge + Token ID */}
        <div className="flex items-center justify-between mb-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${badgeStyle}`}>
            {standard}
          </span>
          <span className="text-xs text-gray-500 font-mono">#{tokenId}</span>
        </div>

        {/* Name */}
        <h3 className="text-sm font-semibold text-gray-900 truncate" title={name}>
          {name}
        </h3>

        {/* Description */}
        <p className="mt-1 text-xs text-gray-500 line-clamp-2" title={description}>
          {description}
        </p>

        {/* Owner */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-gray-300 flex-shrink-0" />
          <span className="text-xs text-gray-400 font-mono" title={owner}>
            {shortenAddress(owner)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default NFTCard;
