import api from "@/lib/axios";

export interface MediaImageUploadData {
  provider: "imagekit";
  assetType: "product" | "combo";
  fileId: string | null;
  name: string | null;
  url: string | null;
  width: number | null;
  height: number | null;
  size: number | null;
  mimeType: string | null;
  fileType: string | null;
  thumbnailUrl: string | null;
}

export type ImageKitTestUploadData = MediaImageUploadData;

export interface MediaImageUploadResponse {
  success: boolean;
  data: MediaImageUploadData;
}

export async function uploadOptimizedImage(
  file: File,
  assetType: "product" | "combo" = "product"
): Promise<MediaImageUploadData> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("assetType", assetType);

  const { data } = await api.post<MediaImageUploadResponse>("/media/images", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data.data;
}
