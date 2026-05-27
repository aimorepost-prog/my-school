export function getStorageBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET || "images";
}

export function getPublicImageUrl(path: string): string {
  const bucket = getStorageBucket();
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function sanitizeUploadFolder(folder: string): string {
  const cleaned = folder.replace(/[^a-z0-9_-]/gi, "").slice(0, 32);
  return cleaned || "misc";
}

export function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "bin";
  }
}
