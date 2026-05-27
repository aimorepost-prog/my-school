"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ContactStatus } from "@/types";

interface Props {
  contactId: string;
  initialStatus: ContactStatus;
  initialAdminNote: string;
}

const STATUS_OPTIONS: { value: ContactStatus; label: string }[] = [
  { value: "new", label: "未対応" },
  { value: "in_progress", label: "対応中" },
  { value: "done", label: "完了" },
];

export default function ContactStatusForm({
  contactId,
  initialStatus,
  initialAdminNote,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<ContactStatus>(initialStatus);
  const [adminNote, setAdminNote] = useState(initialAdminNote);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch(`/admin/contacts/${contactId}/api`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, admin_note: adminNote }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error ?? "保存に失敗しました");
      }
      setSavedAt(new Date().toLocaleTimeString());
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition ${
              status === opt.value
                ? "border-sky-500 bg-sky-50 text-sky-700"
                : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
            }`}
          >
            <input
              type="radio"
              name="status"
              value={opt.value}
              checked={status === opt.value}
              onChange={() => setStatus(opt.value)}
              className="sr-only"
            />
            {opt.label}
          </label>
        ))}
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium text-slate-500">
          管理者メモ（お客様には表示されません）
        </label>
        <textarea
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none"
          placeholder="例：対応者・対応履歴・電話で連絡済 等"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-sky-600 px-5 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
        >
          {isPending ? "保存中..." : "保存する"}
        </button>
        {savedAt && (
          <span className="text-xs text-emerald-600">
            保存しました ({savedAt})
          </span>
        )}
      </div>
    </form>
  );
}
