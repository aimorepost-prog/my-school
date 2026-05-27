import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/require-admin-api";
import { ensureStorageBucket } from "@/lib/ensure-storage-bucket";
import { supabaseAdmin } from "@/lib/supabase";
import {
  ALLOWED_IMAGE_TYPES,
  extensionForMime,
  getPublicImageUrl,
  getStorageBucket,
  MAX_IMAGE_BYTES,
  sanitizeUploadFolder,
} from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const folder = sanitizeUploadFolder(String(formData.get("folder") ?? "misc"));

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "ファイルが必要です" }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "JPEG / PNG / WebP / GIF のみ対応しています" },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "5MB以下の画像を選択してください" },
        { status: 400 }
      );
    }

    const ext = extensionForMime(file.type);
    const path = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const bucket = getStorageBucket();
    const buffer = Buffer.from(await file.arrayBuffer());

    const bucketError = await ensureStorageBucket();
    if (bucketError) {
      return NextResponse.json(
        {
          error: `Storage バケットの作成に失敗しました: ${bucketError}`,
        },
        { status: 500 }
      );
    }

    const { error } = await supabaseAdmin.storage.from(bucket).upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      console.error("[upload] storage error:", error);
      const message =
        error.message.includes("Bucket not found") ||
        error.message.includes("not found")
          ? "Storage バケットが未設定です。supabase/07_storage.sql を実行してください"
          : error.message;
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      url: getPublicImageUrl(path),
      path,
    });
  } catch (err) {
    console.error("[upload] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "アップロードに失敗しました" },
      { status: 500 }
    );
  }
}
