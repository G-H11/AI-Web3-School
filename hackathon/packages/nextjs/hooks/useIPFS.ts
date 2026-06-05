"use client";

import { useState, useCallback } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS, uploadNFTToIPFS } from "~~/lib/pinata";
import type { UploadProgress } from "~~/types/nft";

export function useIPFS() {
  const [imageProgress, setImageProgress] = useState<UploadProgress>({ status: "idle", progress: 0 });
  const [metadataProgress, setMetadataProgress] = useState<UploadProgress>({ status: "idle", progress: 0 });

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    setImageProgress({ status: "uploading", progress: 50 });
    const result = await uploadFileToIPFS(file);
    if (result.success && result.ipfsHash) {
      setImageProgress({ status: "done", progress: 100 });
      return `ipfs://${result.ipfsHash}`;
    }
    setImageProgress({ status: "error", progress: 0, error: result.error });
    return null;
  }, []);

  const uploadMetadata = useCallback(async (json: Record<string, unknown>): Promise<string | null> => {
    setMetadataProgress({ status: "uploading", progress: 50 });
    const result = await uploadJSONToIPFS(json);
    if (result.success && result.ipfsHash) {
      setMetadataProgress({ status: "done", progress: 100 });
      return `ipfs://${result.ipfsHash}`;
    }
    setMetadataProgress({ status: "error", progress: 0, error: result.error });
    return null;
  }, []);

  const uploadNFT = useCallback(
    async (
      imageFile: File,
      metadata: { name: string; description: string },
    ): Promise<{ metadataUri: string; imageUri: string } | null> => {
      setImageProgress({ status: "uploading", progress: 0 });
      const result = await uploadNFTToIPFS(imageFile, metadata);
      if (result.success && result.metadataUri && result.imageUri) {
        setImageProgress({ status: "done", progress: 100 });
        setMetadataProgress({ status: "done", progress: 100 });
        return { metadataUri: result.metadataUri, imageUri: result.imageUri };
      }
      setImageProgress({ status: "error", progress: 0, error: result.error });
      return null;
    },
    [],
  );

  const reset = useCallback(() => {
    setImageProgress({ status: "idle", progress: 0 });
    setMetadataProgress({ status: "idle", progress: 0 });
  }, []);

  return {
    imageProgress,
    metadataProgress,
    uploadImage,
    uploadMetadata,
    uploadNFT,
    reset,
  };
}
