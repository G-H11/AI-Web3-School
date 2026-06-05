/**
 * Pinata IPFS 上传工具
 *
 * 使用方式:
 * 1. 在 .env 中设置 NEXT_PUBLIC_PINATA_JWT
 * 2. 调用 uploadToIPFS(file) 上传文件
 */

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || "";
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud";
const PINATA_API = "https://api.pinata.cloud";

export interface PinataUploadResult {
  success: boolean;
  ipfsHash?: string;
  gatewayUrl?: string;
  error?: string;
}

/**
 * 上传文件到 IPFS（通过 Pinata）
 */
export async function uploadFileToIPFS(file: File): Promise<PinataUploadResult> {
  if (!PINATA_JWT) {
    return { success: false, error: "Pinata JWT not configured. Set NEXT_PUBLIC_PINATA_JWT in .env" };
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    const metadata = JSON.stringify({ name: file.name });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({ cidVersion: 1 });
    formData.append("pinataOptions", options);

    const res = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `Pinata upload failed: ${err}` };
    }

    const data = await res.json();
    return {
      success: true,
      ipfsHash: data.IpfsHash,
      gatewayUrl: `${PINATA_GATEWAY}/ipfs/${data.IpfsHash}`,
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * 上传 JSON 元数据到 IPFS
 */
export async function uploadJSONToIPFS(json: Record<string, unknown>): Promise<PinataUploadResult> {
  if (!PINATA_JWT) {
    return { success: false, error: "Pinata JWT not configured" };
  }

  try {
    const res = await fetch(`${PINATA_API}/pinning/pinJSONToIPFS`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataContent: json,
        pinataMetadata: {
          name: `${json.name || "metadata"}.json`,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `Pinata upload failed: ${err}` };
    }

    const data = await res.json();
    return {
      success: true,
      ipfsHash: data.IpfsHash,
      gatewayUrl: `${PINATA_GATEWAY}/ipfs/${data.IpfsHash}`,
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * 完整的 NFT 上传流程：先上传图片，再上传元数据
 */
export async function uploadNFTToIPFS(
  imageFile: File,
  metadata: { name: string; description: string }
): Promise<{ success: boolean; imageUri?: string; metadataUri?: string; error?: string }> {
  // 1. 上传图片
  const imageResult = await uploadFileToIPFS(imageFile);
  if (!imageResult.success) {
    return { success: false, error: imageResult.error };
  }

  // 2. 构造并上传元数据
  const nftMetadata = {
    name: metadata.name,
    description: metadata.description,
    image: `ipfs://${imageResult.ipfsHash}`,
  };

  const metadataResult = await uploadJSONToIPFS(nftMetadata);
  if (!metadataResult.success) {
    return { success: false, error: metadataResult.error };
  }

  return {
    success: true,
    imageUri: `ipfs://${imageResult.ipfsHash}`,
    metadataUri: `ipfs://${metadataResult.ipfsHash}`,
  };
}
