"use client";

import { useEffect, useCallback } from "react";
import type { MarketplaceListing, NFTMetadata } from "~~/types/nft";
import { shortenAddress, formatEther, resolveIPFSUrl } from "~~/lib/metadata";

type Props = {
  listing: MarketplaceListing & { metadata?: NFTMetadata; ownerAddress?: string };
  isOpen: boolean;
  onClose: () => void;
  onBuy: () => Promise<void>;
  isBuying: boolean;
};

const PurchaseModal = ({ listing, isOpen, onClose, onBuy, isBuying }: Props) => {
  const { metadata, price, seller, tokenId, listingId } = listing;
  const imageUrl = metadata?.image ? resolveIPFSUrl(metadata.image) : null;
  const name = metadata?.name || `Token #${tokenId}`;
  const description = metadata?.description || "No description available";
  const priceETH = formatEther(price);
  const sellerDisplay = shortenAddress(seller);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isBuying) {
        onClose();
      }
    },
    [onClose, isBuying],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleBuy = async () => {
    try {
      await onBuy();
    } catch {
      // Error handled by parent
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={isBuying ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in">
        {/* Close button */}
        <button
          onClick={isBuying ? undefined : onClose}
          disabled={isBuying}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image */}
        <div className="relative aspect-square w-full bg-gray-100">
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
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="p-6 space-y-4">
          {/* Name & Token ID */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 truncate" title={name}>
              {name}
            </h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Token #{tokenId}
              {listingId && <span className="ml-2">· Listing #{listingId}</span>}
            </p>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-3" title={description}>
            {description}
          </p>

          {/* Seller */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Seller</p>
              <p className="text-sm font-mono text-gray-700" title={seller}>
                {sellerDisplay}
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-600 font-medium">Price</span>
            <span className="text-lg font-bold text-blue-700">{priceETH} ETH</span>
          </div>

          {/* Buy button */}
          <button
            onClick={handleBuy}
            disabled={isBuying || !listing.active}
            className="w-full py-3 px-4 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {isBuying ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Confirming...
              </span>
            ) : !listing.active ? (
              "Listing Inactive"
            ) : (
              `Buy for ${priceETH} ETH`
            )}
          </button>

          {/* Status feedback */}
          {isBuying && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <svg className="w-4 h-4 text-yellow-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-yellow-700">Transaction pending. Please confirm in your wallet.</p>
            </div>
          )}

          {!listing.active && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-red-700">This listing is no longer active.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;
