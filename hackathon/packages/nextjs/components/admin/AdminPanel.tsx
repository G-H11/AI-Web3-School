"use client";

import { useState } from "react";
import type { NFTStandard } from "~~/types/nft";

type ContractEntry = {
  address: string;
  standard: NFTStandard;
  name: string;
  symbol: string;
};

type Props = {
  contracts: ContractEntry[];
};

type Phase = "Closed" | "Whitelist" | "Public";

const PHASE_OPTIONS: Phase[] = ["Closed", "Whitelist", "Public"];

const PHASE_COLORS: Record<Phase, string> = {
  Closed: "bg-red-100 text-red-700 border-red-200",
  Whitelist: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Public: "bg-green-100 text-green-700 border-green-200",
};

const AdminPanel = ({ contracts }: Props) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeAction, setActiveAction] = useState<"baseURI" | "phase" | "whitelist" | null>(null);

  // Form states
  const [baseURI, setBaseURI] = useState("");
  const [selectedPhase, setSelectedPhase] = useState<Phase>("Closed");
  const [whitelistAddress, setWhitelistAddress] = useState("");
  const [whitelistAddresses, setWhitelistAddresses] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const selectedContract = contracts[selectedIndex];

  // Placeholder contract data
  const contractData = {
    totalMinted: "—",
    maxSupply: "—",
    baseURI: "—",
    phase: "Public" as Phase,
  };

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleSetBaseURI = async () => {
    if (!baseURI.trim()) return;
    setIsSubmitting(true);
    try {
      // Placeholder: actual contract interaction would go here
      await new Promise((resolve) => setTimeout(resolve, 500));
      showFeedback("success", `Base URI set to: ${baseURI}`);
      setBaseURI("");
      setActiveAction(null);
    } catch {
      showFeedback("error", "Failed to set base URI");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetPhase = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      showFeedback("success", `Phase set to: ${selectedPhase}`);
      setActiveAction(null);
    } catch {
      showFeedback("error", "Failed to set phase");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addWhitelistAddress = () => {
    const addr = whitelistAddress.trim();
    if (addr && addr.startsWith("0x") && addr.length === 42 && !whitelistAddresses.includes(addr)) {
      setWhitelistAddresses((prev) => [...prev, addr]);
      setWhitelistAddress("");
    }
  };

  const removeWhitelistAddress = (addr: string) => {
    setWhitelistAddresses((prev) => prev.filter((a) => a !== addr));
  };

  const handleSetWhitelist = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      showFeedback("success", `Whitelist updated with ${whitelistAddresses.length} addresses`);
      setActiveAction(null);
    } catch {
      showFeedback("error", "Failed to set whitelist");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (contracts.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto py-16 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="text-sm text-gray-500 font-medium">No contracts available</p>
        <p className="text-xs text-gray-400 mt-1">Deploy an NFT contract to manage it here.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your NFT contracts</p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg border ${
            feedback.type === "success"
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <svg
            className={`w-5 h-5 flex-shrink-0 ${feedback.type === "success" ? "text-green-500" : "text-red-500"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {feedback.type === "success" ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
          <p className={`text-sm ${feedback.type === "success" ? "text-green-700" : "text-red-700"}`}>
            {feedback.message}
          </p>
        </div>
      )}

      {/* Contract Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Contract</label>
        <select
          value={selectedIndex}
          onChange={(e) => {
            setSelectedIndex(Number(e.target.value));
            setActiveAction(null);
          }}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {contracts.map((contract, index) => (
            <option key={contract.address} value={index}>
              {contract.name} ({contract.symbol}) — {contract.standard}
            </option>
          ))}
        </select>
        {selectedContract && (
          <p className="mt-1 text-[11px] text-gray-400 font-mono truncate">{selectedContract.address}</p>
        )}
      </div>

      {/* Contract Info */}
      {selectedContract && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">
              {selectedContract.name} ({selectedContract.symbol})
            </h3>
            <p className="text-xs text-gray-500">{selectedContract.standard}</p>
          </div>

          <div className="divide-y divide-gray-100">
            {/* Info rows */}
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-500">Total Minted</span>
              <span className="text-sm font-mono font-medium text-gray-900">{contractData.totalMinted}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-500">Max Supply</span>
              <span className="text-sm font-mono font-medium text-gray-900">{contractData.maxSupply}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-500">Base URI</span>
              <span className="text-xs font-mono text-gray-700 truncate max-w-[200px]" title={contractData.baseURI}>
                {contractData.baseURI}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-500">Phase</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${PHASE_COLORS[contractData.phase]}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    contractData.phase === "Closed"
                      ? "bg-red-500"
                      : contractData.phase === "Whitelist"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                />
                {contractData.phase}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveAction(activeAction === "baseURI" ? null : "baseURI")}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Set Base URI
          </button>
          <button
            onClick={() => setActiveAction(activeAction === "phase" ? null : "phase")}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Set Phase
          </button>
          <button
            onClick={() => setActiveAction(activeAction === "whitelist" ? null : "whitelist")}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Set Whitelist
          </button>
        </div>

        {/* Set Base URI Form */}
        {activeAction === "baseURI" && (
          <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
            <p className="text-xs text-gray-500">Set the base URI for token metadata.</p>
            <input
              type="text"
              value={baseURI}
              onChange={(e) => setBaseURI(e.target.value)}
              placeholder="ipfs://... or https://..."
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
            <button
              onClick={handleSetBaseURI}
              disabled={isSubmitting || !baseURI.trim()}
              className="w-full py-2 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Updating..." : "Update Base URI"}
            </button>
          </div>
        )}

        {/* Set Phase Form */}
        {activeAction === "phase" && (
          <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
            <p className="text-xs text-gray-500">Select the mint phase for this contract.</p>
            <div className="flex gap-1 p-1 bg-gray-200 rounded-lg">
              {PHASE_OPTIONS.map((phase) => (
                <button
                  key={phase}
                  onClick={() => setSelectedPhase(phase)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    selectedPhase === phase
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {phase}
                </button>
              ))}
            </div>
            <button
              onClick={handleSetPhase}
              disabled={isSubmitting}
              className="w-full py-2 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Updating..." : `Set Phase to ${selectedPhase}`}
            </button>
          </div>
        )}

        {/* Set Whitelist Form */}
        {activeAction === "whitelist" && (
          <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
            <p className="text-xs text-gray-500">Add addresses to the whitelist.</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={whitelistAddress}
                onChange={(e) => setWhitelistAddress(e.target.value)}
                placeholder="0x..."
                disabled={isSubmitting}
                className="flex-1 px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addWhitelistAddress();
                  }
                }}
              />
              <button
                type="button"
                onClick={addWhitelistAddress}
                disabled={isSubmitting || !whitelistAddress.trim()}
                className="px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            {whitelistAddresses.length > 0 && (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {whitelistAddresses.map((addr) => (
                  <div key={addr} className="flex items-center justify-between px-3 py-1.5 bg-white rounded border border-gray-200">
                    <span className="text-xs font-mono text-gray-700 truncate">{addr}</span>
                    <button
                      onClick={() => removeWhitelistAddress(addr)}
                      disabled={isSubmitting}
                      className="ml-2 text-gray-400 hover:text-red-500 disabled:opacity-50"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={handleSetWhitelist}
              disabled={isSubmitting || whitelistAddresses.length === 0}
              className="w-full py-2 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Updating..." : `Set Whitelist (${whitelistAddresses.length} addresses)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
