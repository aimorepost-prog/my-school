"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { EventSession } from "@/types";

interface Props {
  eventId: string;
  eventTitle: string;
  initialSessions: EventSession[];
}

function formatJp(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
}

export default function SessionsAdminForm({
  eventId,
  eventTitle,
  initialSessions,
}: Props) {
  const router = useRouter();
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function addSession(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!startsAt) {
      setError("開始日時を入力してください");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/admin/events/${eventId}/sessions/api`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          starts_at: new Date(startsAt).toISOString(),
          ends_at: endsAt ? new Date(endsAt).toISOString() : null,
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error ?? "追加に失敗しました");
      }
      setStartsAt("");
      setEndsAt("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "追加に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function removeSession(id: string) {
    if (!confirm("この日程を削除しますか？")) return;
    setError(null);
    try {
      const res = await fetch(`/admin/events/${eventId}/sessions/api`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error ?? "削除に失敗しました");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗しました");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← 管理画面に戻る
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">開催日程</h1>
        <p className="mt-2 text-sm text-slate-600">{eventTitle}</p>
        <p className="mt-1 text-xs text-slate-500">
          申込期限は各日程の前日23:59（JST）まで。期限を過ぎるとサイトから自動的に非表示になります。
        </p>
      </div>

      <form
        onSubmit={addSession}
        className="rounded-xl bg-white p-6 shadow-sm"
      >
        <h2 className="mb-4 text-lg font-bold text-slate-900">日程を追加</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">
              開始日時
            </span>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">
              終了日時（任意）
            </span>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
        </div>
        {error && (
          <p className="mt-3 text-sm text-rose-600">{error}</p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="mt-4 rounded-lg bg-sky-600 px-5 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
        >
          {saving ? "追加中..." : "追加する"}
        </button>
      </form>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">開始</th>
              <th className="px-4 py-3 text-left">終了</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {initialSessions.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  まだ日程がありません
                </td>
              </tr>
            ) : (
              initialSessions.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">{formatJp(s.starts_at)}</td>
                  <td className="px-4 py-3">
                    {s.ends_at ? formatJp(s.ends_at) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => removeSession(s.id)}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
