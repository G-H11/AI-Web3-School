"use client";

import { useState, useCallback, useRef } from "react";
import type { NFTStandard, BatchMintItem, NFTAttribute } from "~~/types/nft";

type Props = {
  contractAddress: string;
  standard: NFTStandard;
  onMint: (items: BatchMintItem[], recipient?: string) => Promise<void>;
  isMinting: boolean;
};

type FormRow = {
  id: string;
  name: string;
  description: string;
  image: File | null;
  imagePreview: string | null;
};

const PLACEHOLDER_SVG = (
  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

let rowIdCounter = 0;
const nextRowId = () => `row-${Date.now()}-${++rowIdCounter}`;

const createEmptyRow = (): FormRow => ({
  id: nextRowId(),
  name: "",
  description: "",
  image: null,
  imagePreview: null,
});

const BatchMintForm = ({ contractAddress, standard, onMint, isMinting }: Props) => {
  const [rows, setRows] = useState<FormRow[]>([createEmptyRow()]);
  const [recipient, setRecipient] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mintProgress, setMintProgress] = useState<{ current: number; total: number } | null>(null);
  const filesByRow = useRef<Map<string, File>>(new Map());

  const isDisabled = isMinting;

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, createEmptyRow()]);
  }, []);

  const removeRow = useCallback((id: string) => {
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      filesByRow.current.delete(id);
      return prev.filter((r) => r.id !== id);
    });
  }, []);

  const updateRow = useCallback(
    (id: string, field: keyof FormRow, value: string | File | null) => {
      setRows((prev) =>
        prev.map((row) => {
          if (row.id !== id) return row;
          if (field === "image" && value instanceof File) {
            const reader = new FileReader();
            reader.onload = () => {
              setRows((current) =>
                current.map((r) =>
                  r.id === id ? { ...r, imagePreview: reader.result as string } : r,
                ),
              );
            };
            reader.readAsDataURL(value);
            filesByRow.current.set(id, value);
            return { ...row, image: value };
          }
          if (field === "image" && value === null) {
            filesByRow.current.delete(id);
            return { ...row, image: null, imagePreview: null };
          }
          return { ...row, [field]: value };
        }),
      );
    },
    [],
  );

  const handleFileChange = useCallback(
    (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file?.type.startsWith("image/")) {
        updateRow(id, "image", file);
      }
    },
    [updateRow],
  );

  const validRows = rows.filter((r) => r.name.trim() && r.image);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (validRows.length === 0) {
      setError("Please add at least one NFT with a name and image.");
      return;
    }

    const items: BatchMintItem[] = validRows.map((r) => ({
      name: r.name.trim(),
      description: r.description.trim(),
      image: r.image!,
      attributes: [] as NFTAttribute[],
    }));

    setMintProgress({ current: 0, total: items.length });

    try {
      await onMint(items, recipient.trim() || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Batch mint failed");
      setMintProgress(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Batch Mint NFTs</h2>
        <p className="text-sm text-gray-500 mt-1">
          Create multiple NFTs at once on {standard} contract
        </p>
        <p className="mt-1 text-[11px] text-gray-400 font-mono truncate">{contractAddress}</p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Mint progress */}
      {mintProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-600 font-medium">
              Minting {mintProgress.current}/{mintProgress.total}...
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${mintProgress.total > 0 ? (mintProgress.current / mintProgress.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Rows */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">
            Items ({validRows.length} valid)
          </h3>
          <button
            type="button"
            onClick={addRow}
            disabled={isDisabled}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add NFT
          </button>
        </div>

        {rows.map((row, index) => (
          <div
            key={row.id}
            className="p-4 bg-white border border-gray-200 rounded-lg space-y-3"
          >
            {/* Row header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">#{index + 1}</span>
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  disabled={isDisabled}
                  className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors disabled:opacity-50"
                  title="Remove item"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>

            {/* Image upload */}
            <div>
              {row.imagePreview ? (
                <div className="relative inline-block rounded-lg overflow-hidden border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={row.imagePreview}
                    alt="Preview"
                    className="w-20 h-20 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => updateRow(row.id, "image", null)}
                    disabled={isDisabled}
                    className="absolute top-0.5 right-0.5 p-0.5 bg-white/90 rounded-full shadow hover:bg-white disabled:opacity-50"
                  >
                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="inline-flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                  {PLACEHOLDER_SVG}
                  <span className="text-[9px] text-gray-400 mt-0.5">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(row.id, e)}
                    disabled={isDisabled}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Name */}
            <div>
              <input
                type="text"
                value={row.name}
                onChange={(e) => updateRow(row.id, "name", e.target.value)}
                placeholder={`NFT #${index + 1} name *`}
                maxLength={100}
                disabled={isDisabled}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
              />
            </div>

            {/* Description */}
            <div>
              <textarea
                value={row.description}
                onChange={(e) => updateRow(row.id, "description", e.target.value)}
                placeholder={`NFT #${index + 1} description (optional)`}
                rows={2}
                maxLength={500}
                disabled={isDisabled}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:text-gray-400"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recipient */}
      <div>
        <label htmlFor="batch-recipient" className="block text-sm font-medium text-gray-700 mb-1">
          Recipient Address{" "}
          <span className="text-gray-400 font-normal">(optional — defaults to your wallet)</span>
        </label>
        <input
          id="batch-recipient"
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x..."
          disabled={isDisabled}
          className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isDisabled || validRows.length === 0}
        className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
      >
        {isMinting ? "Confirm in wallet..." : `Batch Mint (${validRows.length} NFTs)`}
      </button>
    </form>
  );
};

export default BatchMintForm;
