"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useNFTContract } from "~~/hooks/useNFTContract";
import { shortenAddress } from "~~/lib/metadata";
import type { NFTStandard, TransactionStatus } from "~~/types/nft";

type ContractConfig = {
  name: string;
  contractName: "BasicNFT" | "BatchNFT" | "MultiTokenNFT";
  standard: NFTStandard;
  description: string;
};

const CONTRACTS: ContractConfig[] = [
  {
    name: "BasicNFT",
    contractName: "BasicNFT",
    standard: "ERC-721",
    description: "Standard ERC-721 NFT contract with single mint capability.",
  },
  {
    name: "BatchNFT",
    contractName: "BatchNFT",
    standard: "ERC-721A",
    description: "Gas-optimized ERC-721A contract with batch mint support.",
  },
  {
    name: "MultiTokenNFT",
    contractName: "MultiTokenNFT",
    standard: "ERC-1155",
    description: "Multi-token ERC-1155 contract supporting fungible and non-fungible tokens.",
  },
];

type PhaseOption = { value: number; label: string };

const PHASES: PhaseOption[] = [
  { value: 0, label: "Paused" },
  { value: 1, label: "Whitelist" },
  { value: 2, label: "Public" },
];

const getPhaseLabel = (phase: number): string => {
  return PHASES.find((p) => p.value === phase)?.label || "Unknown";
};

const AdminPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();

  // Contract addresses
  const { data: basicNFTInfo, isLoading: basicLoading } = useDeployedContractInfo({ contractName: "BasicNFT" });
  const { data: batchNFTInfo, isLoading: batchLoading } = useDeployedContractInfo({ contractName: "BatchNFT" });
  const { data: multiNFTInfo, isLoading: multiLoading } = useDeployedContractInfo({ contractName: "MultiTokenNFT" });
  const { data: marketplaceInfo, isLoading: marketplaceLoading } = useDeployedContractInfo({ contractName: "NFTMarketplace" });

  const isLoading = basicLoading || batchLoading || multiLoading || marketplaceLoading;

  // Contract hooks
  const basicContract = useNFTContract(basicNFTInfo?.address || "", "ERC-721");
  const batchContract = useNFTContract(batchNFTInfo?.address || "", "ERC-721A");
  const multiContract = useNFTContract(multiNFTInfo?.address || "", "ERC-1155");

  // Phase for BatchNFT
  const { data: batchPhase } = useScaffoldReadContract({
    contractName: "BatchNFT",
    functionName: "currentPhase",
  });

  // Owner checks
  const { data: basicOwner } = useScaffoldReadContract({
    contractName: "BasicNFT",
    functionName: "owner",
  });

  const { data: batchNFTOwner } = useScaffoldReadContract({
    contractName: "BatchNFT",
    functionName: "owner",
  });

  const { data: multiOwner } = useScaffoldReadContract({
    contractName: "MultiTokenNFT",
    functionName: "owner",
  });

  const { data: marketplaceOwner } = useScaffoldReadContract({
    contractName: "NFTMarketplace",
    functionName: "owner",
  });

  // Admin state
  const [baseURI, setBaseURI] = useState("");
  const [setBaseURIStatus, setSetBaseURIStatus] = useState<TransactionStatus>("idle");
  const [setBaseURIError, setSetBaseURIError] = useState<string | null>(null);

  const [selectedPhase, setSelectedPhase] = useState<number>(0);
  const [setPhaseStatus, setSetPhaseStatus] = useState<TransactionStatus>("idle");
  const [setPhaseError, setSetPhaseError] = useState<string | null>(null);

  const [whitelistInput, setWhitelistInput] = useState("");
  const [whitelistStatus, setWhitelistStatus] = useState<TransactionStatus>("idle");
  const [whitelistError, setWhitelistError] = useState<string | null>(null);

  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Update selected phase when batchPhase data arrives
  useEffect(() => {
    if (batchPhase !== undefined) {
      setSelectedPhase(Number(batchPhase));
    }
  }, [batchPhase]);

  // Check admin status
  const isBasicAdmin = connectedAddress?.toLowerCase() === (basicOwner as string)?.toLowerCase();
  const isBatchAdmin = connectedAddress?.toLowerCase() === (batchNFTOwner as string)?.toLowerCase();
  const isMultiAdmin = connectedAddress?.toLowerCase() === (multiOwner as string)?.toLowerCase();
  const isMarketplaceAdmin = connectedAddress?.toLowerCase() === (marketplaceOwner as string)?.toLowerCase();

  const isAnyAdmin = isBasicAdmin || isBatchAdmin || isMultiAdmin || isMarketplaceAdmin;

  // Set Base URI
  const handleSetBaseURI = useCallback(async () => {
    if (!baseURI.trim()) return;
    setSetBaseURIStatus("pending");
    setSetBaseURIError(null);
    try {
      await batchContract.setBaseURI(baseURI.trim());
      setSetBaseURIStatus("success");
      setBaseURI("");
    } catch (err) {
      setSetBaseURIStatus("error");
      setSetBaseURIError(err instanceof Error ? err.message : "Failed to set base URI");
    }
  }, [baseURI, batchContract]);

  // Set Phase
  const handleSetPhase = useCallback(async () => {
    setSetPhaseStatus("pending");
    setSetPhaseError(null);
    try {
      await batchContract.setPhase(selectedPhase);
      setSetPhaseStatus("success");
    } catch (err) {
      setSetPhaseStatus("error");
      setSetPhaseError(err instanceof Error ? err.message : "Failed to set phase");
    }
  }, [selectedPhase, batchContract]);

  // Set Whitelist
  const handleSetWhitelist = useCallback(async () => {
    const addresses = whitelistInput
      .split(/[\n,]+/)
      .map((a) => a.trim())
      .filter((a) => a.length === 42 && a.startsWith("0x"));

    if (addresses.length === 0) {
      setWhitelistError("No valid addresses found. Use 0x format, one per line.");
      return;
    }

    setWhitelistStatus("pending");
    setWhitelistError(null);
    try {
      await batchContract.setWhitelist(addresses, true);
      setWhitelistStatus("success");
      setWhitelistInput("");
    } catch (err) {
      setWhitelistStatus("error");
      setWhitelistError(err instanceof Error ? err.message : "Failed to update whitelist");
    }
  }, [whitelistInput, batchContract]);

  const toggleCard = (name: string) => {
    setExpandedCard((prev) => (prev === name ? null : name));
  };

  // Not connected
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center grow py-24 px-4">
        <div className="text-center max-w-md">
          <svg
            className="w-16 h-16 text-yellow-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Wallet Not Connected</h2>
          <p className="text-sm text-gray-500">Connect your wallet to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="flex flex-col grow pt-8 pb-16 px-4 max-w-5xl mx-auto w-full">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-96 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Not admin
  if (!isAnyAdmin) {
    return (
      <div className="flex flex-col items-center justify-center grow py-24 px-4">
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
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-sm text-gray-500 mb-2">
            You are not the owner of any deployed contracts.
          </p>
          <p className="text-xs text-gray-400 font-mono">
            Connected: {shortenAddress(connectedAddress || "")}
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← Back to Gallery
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col grow pt-8 pb-16 px-4 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Manage NFT contracts and marketplace settings</p>
          </div>
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Gallery
          </Link>
        </div>
      </div>

      {/* Contract Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {CONTRACTS.map((contract) => {
          const isExpanded = expandedCard === contract.name;
          const isThisAdmin =
            (contract.contractName === "BasicNFT" && isBasicAdmin) ||
            (contract.contractName === "BatchNFT" && isBatchAdmin) ||
            (contract.contractName === "MultiTokenNFT" && isMultiAdmin);

          const info =
            contract.contractName === "BasicNFT"
              ? basicNFTInfo
              : contract.contractName === "BatchNFT"
                ? batchNFTInfo
                : multiNFTInfo;

          const contractData =
            contract.contractName === "BasicNFT"
              ? basicContract
              : contract.contractName === "BatchNFT"
                ? batchContract
                : multiContract;

          return (
            <div
              key={contract.name}
              className={`border rounded-xl overflow-hidden transition-shadow ${
                isExpanded ? "shadow-md border-blue-300" : "border-gray-200 shadow-sm"
              }`}
            >
              {/* Card Header */}
              <div
                className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleCard(contract.name)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{contract.name}</h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                        contract.standard === "ERC-721"
                          ? "bg-blue-100 text-blue-800 border-blue-300"
                          : contract.standard === "ERC-721A"
                            ? "bg-green-100 text-green-800 border-green-300"
                            : "bg-purple-100 text-purple-800 border-purple-300"
                      }`}
                    >
                      {contract.standard}
                    </span>
                    {isThisAdmin && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3">{contract.description}</p>

                {/* Contract stats */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Address</p>
                    <p className="font-mono text-gray-600 truncate" title={info?.address}>
                      {info?.address ? shortenAddress(info.address, 8) : "Not deployed"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Minted / Max</p>
                    <p className="font-mono text-gray-600">
                      {contractData.totalMinted ? String(contractData.totalMinted) : "-"} /{" "}
                      {contractData.maxSupply ? String(contractData.maxSupply) : "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <span>
                    {contractData.name ? String(contractData.name) : "—"} (
                    {contractData.symbol ? String(contractData.symbol) : "—"})
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded: Admin Controls */}
              {isExpanded && isThisAdmin && (
                <div className="border-t border-gray-200 bg-gray-50 p-5 space-y-4">
                  {/* BatchNFT specific controls */}
                  {contract.contractName === "BatchNFT" && (
                    <>
                      {/* Set Phase */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mint Phase
                        </label>
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedPhase}
                            onChange={(e) => setSelectedPhase(Number(e.target.value))}
                            disabled={setPhaseStatus === "pending"}
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          >
                            {PHASES.map((p) => (
                              <option key={p.value} value={p.value}>
                                Phase {p.value}: {p.label}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={handleSetPhase}
                            disabled={setPhaseStatus === "pending"}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
                          >
                            {setPhaseStatus === "pending" ? "..." : "Set"}
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-400">
                          Current: Phase {batchPhase !== undefined ? Number(batchPhase) : "?"} ({getPhaseLabel(batchPhase !== undefined ? Number(batchPhase) : -1)})
                        </p>
                        {setPhaseError && <p className="mt-1 text-xs text-red-600">{setPhaseError}</p>}
                        {setPhaseStatus === "success" && (
                          <p className="mt-1 text-xs text-green-600">Phase updated successfully!</p>
                        )}
                      </div>

                      {/* Set Base URI */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Base URI
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={baseURI}
                            onChange={(e) => setBaseURI(e.target.value)}
                            placeholder="ipfs://... or https://..."
                            disabled={setBaseURIStatus === "pending"}
                            className="flex-1 px-3 py-2 text-sm font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          />
                          <button
                            onClick={handleSetBaseURI}
                            disabled={!baseURI.trim() || setBaseURIStatus === "pending"}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
                          >
                            {setBaseURIStatus === "pending" ? "..." : "Set"}
                          </button>
                        </div>
                        {setBaseURIError && <p className="mt-1 text-xs text-red-600">{setBaseURIError}</p>}
                        {setBaseURIStatus === "success" && (
                          <p className="mt-1 text-xs text-green-600">Base URI updated!</p>
                        )}
                      </div>

                      {/* Whitelist */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Whitelist Addresses
                        </label>
                        <textarea
                          value={whitelistInput}
                          onChange={(e) => setWhitelistInput(e.target.value)}
                          placeholder={`0x1234...5678\n0xabcd...ef01`}
                          rows={4}
                          disabled={whitelistStatus === "pending"}
                          className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-100"
                        />
                        <button
                          onClick={handleSetWhitelist}
                          disabled={!whitelistInput.trim() || whitelistStatus === "pending"}
                          className="mt-2 w-full py-2 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
                        >
                          {whitelistStatus === "pending" ? "Confirming..." : "Add to Whitelist"}
                        </button>
                        {whitelistError && <p className="mt-1 text-xs text-red-600">{whitelistError}</p>}
                        {whitelistStatus === "success" && (
                          <p className="mt-1 text-xs text-green-600">Whitelist updated!</p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Generic controls for all contracts */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-400 mb-2">Contract address: {info?.address}</p>
                  </div>
                </div>
              )}

              {/* Expanded but not admin */}
              {isExpanded && !isThisAdmin && (
                <div className="border-t border-gray-200 bg-gray-50 p-5">
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <p className="text-xs text-yellow-700">
                      You are not the owner of this contract. Admin controls are unavailable.
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Marketplace Card */}
        <div
          className={`border rounded-xl overflow-hidden transition-shadow ${
            expandedCard === "NFTMarketplace" ? "shadow-md border-blue-300" : "border-gray-200 shadow-sm"
          }`}
        >
          <div
            className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleCard("NFTMarketplace")}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">NFT Marketplace</h3>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-100 text-cyan-800 border border-cyan-300">
                  Marketplace
                </span>
                {isMarketplaceAdmin && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
                    Admin
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              NFT trading marketplace supporting ERC-721 and ERC-1155 listings.
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">Address</p>
                <p className="font-mono text-gray-600 truncate" title={marketplaceInfo?.address}>
                  {marketplaceInfo?.address ? shortenAddress(marketplaceInfo.address, 8) : "Not deployed"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Listing Count</p>
                <p className="font-mono text-gray-600">—</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
              <span>Buy / Sell NFTs</span>
              <svg
                className={`w-4 h-4 transition-transform ${expandedCard === "NFTMarketplace" ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {expandedCard === "NFTMarketplace" && isMarketplaceAdmin && (
            <div className="border-t border-gray-200 bg-gray-50 p-5">
              <p className="text-sm text-gray-600 mb-3">Marketplace admin controls</p>
              <p className="text-xs text-gray-400">
                Owner: {shortenAddress(connectedAddress || "")}
              </p>
            </div>
          )}

          {expandedCard === "NFTMarketplace" && !isMarketplaceAdmin && (
            <div className="border-t border-gray-200 bg-gray-50 p-5">
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-xs text-yellow-700">You are not the marketplace owner.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Connected wallet info */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-400">Connected Wallet</p>
            <p className="text-sm font-mono text-gray-700">{shortenAddress(connectedAddress || "", 8)}</p>
          </div>
          <div className="ml-auto">
            {isAnyAdmin ? (
              <span className="text-xs font-medium text-green-600">Admin access granted</span>
            ) : (
              <span className="text-xs font-medium text-red-500">No admin rights</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
