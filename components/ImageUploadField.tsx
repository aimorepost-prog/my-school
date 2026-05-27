"use client";

import { ChangeEvent, useRef, useState } from "react";

interface Props {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  hint?: string;
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  folder = "misc",
  hint,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選択してください");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("5MB以下の画像を選択してください");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        throw new Error(data.error || "アップロードに失敗しました");
      }

      onChange(data.url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "アップロードに失敗しました"
      );
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {hint && <p className="mb-1 text-xs text-slate-400">{hint}</p>}

      {value ? (
        <div className="mb-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="max-h-40 w-full object-contain"
          />
        </div>
      ) : (
        <div className="mb-3 flex h-28 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
          画像未設定
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {uploading
            ? "アップロード中…"
            : value
              ? "画像を変更"
              : "画像をアップロード"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={uploading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-500 hover:bg-slate-50 disabled:opacity-60"
          >
            削除
          </button>
        )}
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-slate-500">
          URLを直接入力
        </summary>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand"
        />
      </details>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
