import cloudinary from "../config/cloudinary.js";

const FOLDERS = {
  products: "ramjanstore/products",
  banners: "ramjanstore/banners",
} as const;

export function createUploadSignature(kind: keyof typeof FOLDERS) {
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = FOLDERS[kind];
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!,
  );

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
  };
}
