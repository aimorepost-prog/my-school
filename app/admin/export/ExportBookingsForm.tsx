"use client";

import { useMemo, useState } from "react";

export interface ExportEventOption {
  id: string;
  title: string;
  slug: string;
}

export interface ExportSessionOption {
  id: string;
  event_id: string;
  starts_at: string;
  ends_at: string | null;
}

function formatSessionLabel(iso: string, endsAt: string | null): string {
  const start = new Date(iso).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  if (!endsAt) return start;
  const end = new Date(endsAt).toLocaleTimeString("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${start} 〜 ${end}`;
}

function monthOptions(): { value: string; label: string }[] {
  const now = new Date();
  const options: { value: string; label: string }[] = [
    { value: "", label: "すべての月" },
  ];
  for (let i = -6; i <= 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      timeZone: "Asia/Tokyo",
    });
    options.push({ value, label });
  }
  return options;
}

interface Props {
  events: ExportEventOption[];
  sessions: ExportSessionOption[];
}

export default function ExportBookingsForm({ events, sessions }: Props) {
  const months = useMemo(() => monthOptions(), []);
  const [eventId, setEventId] = useState("");
  const [month, setMonth] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [mode, setMode] = useState<"bookings" | "attendees">("bookings");

  const filteredSessions = useMemo(() => {
    let list = sessions;
    if (eventId) list = list.filter((s) => s.event_id === eventId);
    if (month) {
      const [y, m] = month.split("-").map(Number);
      const start = new Date(`${y}-${String(m).padStart(2, "0")}-01T00:00:00+09:00`);
      const nextM = m === 12 ? 1 : m + 1;
      const nextY = m === 12 ? y + 1 : y;
      const end = new Date(
        `${nextY}-${String(nextM).padStart(2, "0")}-01T00:00:00+09:00`
      );
      list = list.filter((s) => {
        const t = new Date(s.starts_at).getTime();
        return t >= start.getTime() && t < end.getTime();
      });
    }
    return list;
  }, [sessions, eventId, month]);

  const exportUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (eventId) params.set("event_id", eventId);
    if (month) params.set("month", month);
    if (sessionId) params.set("session_id", sessionId);
    if (paymentStatus !== "all") params.set("payment_status", paymentStatus);
    params.set("mode", mode);
    return `/api/export?${params.toString()}`;
  }, [eventId, month, sessionId, paymentStatus, mode]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            講座
          </span>
          <select
            value={eventId}
            onChange={(e) => {
              setEventId(e.target.value);
              setSessionId("");
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">すべての講座</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            開催月
          </span>
          <select
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setSessionId("");
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {months.map((m) => (
              <option key={m.value || "all"} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block md:col-span-2">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            開催日程（任意）
          </span>
          <select
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            disabled={filteredSessions.length === 0}
          >
            <option value="">すべての日程</option>
            {filteredSessions.map((s) => (
              <option key={s.id} value={s.id}>
                {formatSessionLabel(s.starts_at, s.ends_at)}
              </option>
            ))}
          </select>
          {eventId && filteredSessions.length === 0 && (
            <p className="mt-1 text-xs text-slate-500">
              選択した条件に該当する日程がありません
            </p>
          )}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            支払状況
          </span>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="all">すべて</option>
            <option value="paid">入金済みのみ</option>
            <option value="pending">未入金のみ</option>
            <option value="cancelled">キャンセルのみ</option>
          </select>
        </label>

        <fieldset className="block">
          <legend className="mb-2 text-sm font-medium text-slate-700">
            出力形式
          </legend>
          <div className="space-y-2 text-sm">
            <label className="flex items-start gap-2">
              <input
                type="radio"
                name="mode"
                value="bookings"
                checked={mode === "bookings"}
                onChange={() => setMode("bookings")}
                className="mt-1"
              />
              <span>
                <strong>申込一覧</strong>
                <br />
                <span className="text-slate-500">
                  1申込 = 1行（名前・日程・受講費など）
                </span>
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="radio"
                name="mode"
                value="attendees"
                checked={mode === "attendees"}
                onChange={() => setMode("attendees")}
                className="mt-1"
              />
              <span>
                <strong>受講者一覧</strong>
                <br />
                <span className="text-slate-500">
                  メールアドレスごとにまとめ（複数申込・合計受講費）
                </span>
              </span>
            </label>
          </div>
        </fieldset>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
        <button
          type="button"
          onClick={() => {
            const url = `${exportUrl}&_=${Date.now()}`;
            window.location.href = url;
          }}
          className="inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-sm font-bold text-white hover:bg-brand-dark"
        >
          CSVをダウンロード
        </button>
        <p className="text-xs text-slate-500">
          Excel で開く場合は UTF-8（BOM付き）で保存されています
        </p>
      </div>
    </div>
  );
}
