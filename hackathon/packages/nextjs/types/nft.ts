// ============ NFT 核心类型 ============

export type NFTStandard = "ERC-721" | "ERC-721A" | "ERC-1155";

export interface NFTAttribute {
  trait_type: string;
  value: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string; // IPFS URI
  external_url?: string;
  attributes?: NFTAttribute[];
  animation_url?: string;
  background_color?: string;
}

export interface NFTItem {
  contractAddress: string;
  tokenId: string;
  standard: NFTStandard;
  uri: string;
  metadata?: NFTMetadata;
  owner: string;
}

// ============ 合约信息 ============

export interface ContractInfo {
  address: string;
  name: string;
  symbol: string;
  standard: NFTStandard;
  totalSupply: string;
  maxSupply: string;
}

// ============ 市场 ============

export interface MarketplaceListing {
  listingId: string;
  seller: string;
  nftContract: string;
  tokenId: string;
  amount: string;
  price: string; // wei
  standard: number; // 0 = ERC-721, 1 = ERC-1155
  active: boolean;
}

export interface ListingWithMetadata extends MarketplaceListing {
  metadata?: NFTMetadata;
  ownerAddress?: string;
}

// ============ 铸造 ============

export interface MintFormData {
  contractAddress: string;
  standard: NFTStandard;
  name: string;
  description: string;
  image: File | null;
  attributes: NFTAttribute[];
  amount?: number; // ERC-721A / ERC-1155 数量
  recipient?: string;
}

export interface BatchMintItem {
  name: string;
  description: string;
  image: File;
  attributes: NFTAttribute[];
}

// ============ 通用 ============

export interface UploadProgress {
  status: "idle" | "uploading" | "done" | "error";
  progress: number; // 0-100
  error?: string;
}

export type TransactionStatus = "idle" | "pending" | "success" | "error";
