import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminApi } from "@/lib/require-admin-api";
import type { Booking, BookingAnswers } from "@/types";

export const dynamic = "force-dynamic";

/**
 * 予約一覧を CSV で出力
 *
 * GET /api/export?event_id=xxxx
 * GET /api/export                  ← 全予約
 */
export async function GET(req: NextRequest) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("event_id");

  let query = supabaseAdmin
    .from("bookings")
    .select("*, event_sessions(starts_at, ends_at)")
    .order("created_at", { ascending: false });

  if (eventId) {
    query = query.eq("event_id", eventId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[export] error:", error);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }

  const rows = (data ?? []) as (Booking & {
    event_sessions: { starts_at: string; ends_at: string | null } | null;
  })[];

  const formatSessionCsv = (
    s: { starts_at: string; ends_at: string | null } | null
  ) => {
    if (!s) return "";
    const start = new Date(s.starts_at).toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
    });
    if (!s.ends_at) return start;
    const end = new Date(s.ends_at).toLocaleTimeString("ja-JP", {
      timeZone: "Asia/Tokyo",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${start} 〜 ${end}`;
  };

  const header = [
    "予約ID",
    "名前",
    "メール",
    "電話",
    "開催日程",
    "領収書宛名",
    "紹介者",
    "受講のきっかけ",
    "受講歴",
    "参加費区分",
    "受講費",
    "支払状況",
    "領収書発行日",
    "申込日時",
  ];

  const escape = (v: string | null | undefined): string => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const statusLabel = (s: string) =>
    s === "paid" ? "入金済み" : s === "cancelled" ? "キャンセル" : "未入金";

  const lines = [
    header.join(","),
    ...rows.map((r) => {
      const answers = r.answers as BookingAnswers | undefined;
      return [
        escape(r.id),
        escape(r.name),
        escape(r.email),
        escape(r.phone),
        escape(formatSessionCsv(r.event_sessions)),
        escape(r.receipt_name ?? r.name),
        escape(r.referrer),
        escape(answers?.enrollment_reason),
        escape(answers?.past_courses?.join(" / ")),
        escape(answers?.price_tier_label),
        escape(
          answers?.selected_price != null
            ? String(answers.selected_price)
            : ""
        ),
        escape(statusLabel(r.payment_status)),
        escape(
          r.receipt_issued_at
            ? new Date(r.receipt_issued_at).toLocaleString("ja-JP")
            : ""
        ),
        escape(new Date(r.created_at).toLocaleString("ja-JP")),
      ].join(",");
    }),
  ];

  const csv = "\uFEFF" + lines.join("\r\n");
  const filename = `bookings_${eventId ?? "all"}_${Date.now()}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
