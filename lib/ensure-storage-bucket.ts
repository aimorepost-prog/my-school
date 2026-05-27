import { supabaseAdmin } from "./supabase";
import {
  ALLOWED_IMAGE_TYPES,
  getStorageBucket,
  MAX_IMAGE_BYTES,
} from "./storage";

export async function ensureStorageBucket(): Promise<string | null> {
  const bucket = getStorageBucket();
  const { data: existing } = await supabaseAdmin.storage.getBucket(bucket);

  if (existing) {
    return null;
  }

  const { error } = await supabaseAdmin.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: MAX_IMAGE_BYTES,
    allowedMimeTypes: Array.from(ALLOWED_IMAGE_TYPES),
  });

  if (error) {
    return error.message;
  }

  return null;
}
