import type { NFTMetadata, NFTAttribute } from "~~/types/nft";

/**
 * 生成标准 NFT 元数据 JSON（ERC-721 Metadata Standard）
 */
export function generateMetadata(params: {
  name: string;
  description: string;
  image: string; // IPFS URI of the image
  externalUrl?: string;
  animationUrl?: string;
  attributes?: NFTAttribute[];
  backgroundColor?: string;
}): NFTMetadata {
  const metadata: NFTMetadata = {
    name: params.name,
    description: params.description,
    image: params.image,
  };

  if (params.externalUrl) metadata.external_url = params.externalUrl;
  if (params.animationUrl) metadata.animation_url = params.animationUrl;
  if (params.attributes?.length) metadata.attributes = params.attributes;
  if (params.backgroundColor) metadata.background_color = params.backgroundColor;

  return metadata;
}

/**
 * 从 IPFS URI 或 HTTP URL 提取可访问的 URL
 */
export function resolveIPFSUrl(uri: string, gateway?: string): string {
  const gw = gateway || "https://gateway.pinata.cloud";

  if (uri.startsWith("ipfs://")) {
    const cid = uri.replace("ipfs://", "");
    return `${gw}/ipfs/${cid}`;
  }

  if (uri.startsWith("https://") || uri.startsWith("http://")) {
    return uri;
  }

  // 假设是 CID
  return `${gw}/ipfs/${uri}`;
}

/**
 * 从 IPFS 获取并解析 NFT 元数据
 */
export async function fetchMetadata(uri: string): Promise<NFTMetadata | null> {
  try {
    const url = resolveIPFSUrl(uri);
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * 格式化地址显示（截断）
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address || address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * 格式化 wei 为 ETH
 */
export function formatEther(wei: string | bigint, decimals = 4): string {
  const eth = Number(wei) / 1e18;
  return eth.toFixed(decimals);
}
