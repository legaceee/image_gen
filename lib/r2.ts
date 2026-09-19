import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Cloudflare R2 is S3-compatible — endpoint: https://<accountId>.r2.cloudflarestorage.com
const r2Client = process.env.CF_R2_ACCESS_KEY_ID
  ? new S3Client({
      region: "auto",
      endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.CF_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CF_R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

const BUCKET = process.env.CF_R2_BUCKET_NAME || "ai-image-suite";
const PUBLIC_URL = process.env.CF_R2_PUBLIC_URL || "";

export interface UploadResult {
  key: string;
  url: string;
  fileSizeBytes: number;
}

/**
 * Upload a base64 data-URL image to Cloudflare R2.
 * Returns { key, url, fileSizeBytes } or null if R2 is not configured.
 */
export async function uploadImageToR2(
  dataUrl: string,
  key: string,
  contentType = "image/jpeg"
): Promise<UploadResult | null> {
  if (!r2Client) {
    console.warn("[R2] Not configured — skipping upload. Set CF_R2_* env vars.");
    return null;
  }

  try {
    // Strip the data:image/jpeg;base64, prefix
    const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
    const buffer = Buffer.from(base64, "base64");

    await r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    const url = PUBLIC_URL ? `${PUBLIC_URL}/${key}` : key;
    return { key, url, fileSizeBytes: buffer.length };
  } catch (err) {
    console.error("[R2] Upload failed:", err);
    return null;
  }
}

/**
 * Delete an object from Cloudflare R2 by key.
 */
export async function deleteFromR2(key: string): Promise<boolean> {
  if (!r2Client || !key) return false;
  try {
    await r2Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch (err) {
    console.error("[R2] Delete failed:", err);
    return false;
  }
}

/** Build the R2 storage key for a generated image */
export function generatedImageKey(userId: string, imageId: string) {
  return `users/${userId}/generated/${imageId}.jpg`;
}

/** Build the R2 storage key for an uploaded/analyzed image */
export function analyzedImageKey(userId: string, hash: string) {
  return `users/${userId}/analyzed/${hash}.jpg`;
}