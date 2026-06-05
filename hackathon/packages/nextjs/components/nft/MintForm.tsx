"use client";

import { useState, useRef, useCallback } from "react";
import type { NFTStandard, UploadProgress, MintFormData, NFTAttribute } from "~~/types/nft";

type ContractOption = {
  address: string;
  standard: NFTStandard;
  name: string;
};

type Props = {
  contracts: ContractOption[];
  /** Called when the user submits the mint form. The parent handles IPFS upload + contract interaction. */
  onSubmit: (data: MintFormData) => Promise<void>;
  /** Upload progress from IPFS upload (managed by parent) */
  uploadProgress?: UploadProgress;
  /** Whether the connected wallet is valid */
  walletReady?: boolean;
  /** Whether a mint transaction is in progress */
  isMinting?: boolean;
};

const MintForm = ({
  contracts,
  onSubmit,
  uploadProgress,
  walletReady = true,
  isMinting = false,
}: Props) => {
  // --- Contract selection ---
  const [selectedContractIndex, setSelectedContractIndex] = useState(0);
  const selectedContract = contracts[selectedContractIndex];

  // --- Form fields ---
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [amount, setAmount] = useState(1);
  const [recipient, setRecipient] = useState("");

  // --- UI state ---
  const [isDragOver, setIsDragOver] = useState(false);
  const [successTx, setSuccessTx] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUploading = uploadProgress?.status === "uploading";
  const isDisabled = isUploading || isMinting || !walletReady;

  // --- Derived: show amount input ---
  const showAmount =
    selectedContract?.standard === "ERC-721A" || selectedContract?.standard === "ERC-1155";
  const amountLabel = selectedContract?.standard === "ERC-1155" ? "Amount" : "Quantity (1-20)";
  const amountMax = selectedContract?.standard === "ERC-721A" ? 20 : 100;

  // --- Image handlers ---
  const handleImageFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleImageFile(file);
    },
    [handleImageFile],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleImageFile(file);
    },
    [handleImageFile],
  );

  const removeImage = useCallback(() => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisabled || !selectedContract) return;

    const data: MintFormData = {
      contractAddress: selectedContract.address,
      standard: selectedContract.standard,
      name: name.trim(),
      description: description.trim(),
      image,
      attributes: [],
      amount: showAmount ? amount : undefined,
      recipient: recipient.trim() || undefined,
    };

    try {
      await onSubmit(data);
      setSuccessTx(selectedContract.address);
      // Reset form
      setName("");
      setDescription("");
      setImage(null);
      setImagePreview(null);
      setAmount(1);
      setRecipient("");
    } catch {
      // Error handled by parent via uploadProgress.error
    }
  };

  // --- Progress indicator ---
  const uploadStatusPercent = uploadProgress?.progress || 0;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6">
      {/* Success feedback */}
      {successTx && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="text-sm font-medium text-green-800">NFT minted successfully!</p>
            <button
              type="button"
              onClick={() => setSuccessTx(null)}
              className="text-xs text-green-600 underline hover:text-green-800"
            >
              Mint another
            </button>
          </div>
        </div>
      )}

      {/* Error feedback */}
      {uploadProgress?.status === "error" && uploadProgress.error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-red-700">{uploadProgress.error}</p>
        </div>
      )}

      {/* Wallet check */}
      {!walletReady && (
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
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

      {/* Contract Selector Tabs */}
      {contracts.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select NFT Contract</label>
          <div className="flex flex-wrap gap-1 p-1 bg-gray-100 rounded-lg">
            {contracts.map((contract, index) => (
              <button
                key={contract.address}
                type="button"
                onClick={() => setSelectedContractIndex(index)}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-colors text-left ${
                  index === selectedContractIndex
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="block">{contract.name}</span>
                <span className="block text-[10px] opacity-60">{contract.standard}</span>
              </button>
            ))}
          </div>
          {selectedContract && (
            <p className="mt-1 text-[11px] text-gray-400 font-mono truncate">
              {selectedContract.address}
            </p>
          )}
        </div>
      )}

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">NFT Image *</label>
        {imagePreview ? (
          <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Preview" className="w-full h-48 object-contain bg-gray-100" />
            <button
              type="button"
              onClick={removeImage}
              disabled={isDisabled}
              className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow hover:bg-white disabled:opacity-50"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="px-3 py-2">
              <p className="text-xs text-gray-500 truncate">{image?.name}</p>
              <p className="text-[10px] text-gray-400">
                {(image ? image.size / 1024 : 0).toFixed(1)} KB
              </p>
            </div>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              isDragOver
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
            } ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}
          >
            <svg
              className="w-10 h-10 text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-gray-600 font-medium">
              {isDragOver ? "Drop image here" : "Drag & drop an image, or click to browse"}
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF, SVG up to 10MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isDisabled}
            />
          </div>
        )}
      </div>

      {/* Name */}
      <div>
        <label htmlFor="nft-name" className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          id="nft-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Awesome NFT"
          required
          maxLength={100}
          disabled={isDisabled}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="nft-desc" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="nft-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your NFT..."
          rows={3}
          maxLength={1000}
          disabled={isDisabled}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:text-gray-400"
        />
        <p className="mt-1 text-[11px] text-gray-400">{description.length}/1000</p>
      </div>

      {/* Amount slider (ERC-721A or ERC-1155) */}
      {showAmount && (
        <div>
          <label htmlFor="nft-amount" className="block text-sm font-medium text-gray-700 mb-1">
            {amountLabel}: <span className="font-bold text-gray-900">{amount}</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              id="nft-amount"
              type="range"
              min={1}
              max={amountMax}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              disabled={isDisabled}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <input
              type="number"
              min={1}
              max={amountMax}
              value={amount}
              onChange={(e) => {
                const val = Math.max(1, Math.min(amountMax, Number(e.target.value) || 1));
                setAmount(val);
              }}
              disabled={isDisabled}
              className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
        </div>
      )}

      {/* Recipient (optional) */}
      <div>
        <label htmlFor="nft-recipient" className="block text-sm font-medium text-gray-700 mb-1">
          Recipient Address{" "}
          <span className="text-gray-400 font-normal">(optional — defaults to your wallet)</span>
        </label>
        <input
          id="nft-recipient"
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x..."
          disabled={isDisabled}
          className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
        />
      </div>

      {/* Upload Progress */}
      {(isUploading || uploadProgress?.status === "done") && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {isUploading ? "Uploading to IPFS..." : "Upload complete"}
            </span>
            <span className="text-gray-400 font-mono text-xs">{uploadStatusPercent}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                uploadProgress?.status === "done" ? "bg-green-500" : "bg-blue-500"
              }`}
              style={{ width: `${uploadStatusPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isDisabled || !image || !name.trim()}
        className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
      >
        {isMinting
          ? "Confirm in wallet..."
          : isUploading
            ? "Uploading..."
            : "Mint NFT"}
      </button>
    </form>
  );
};

export default MintForm;
