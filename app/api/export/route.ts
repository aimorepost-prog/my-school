import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminApi } from "@/lib/require-admin-api";
import {
  buildExportCsv,
  buildExportFilename,
  filterExportBookings,
  type ExportBookingRow,
  type ExportFilters,
  type ExportMode,
  type ExportPaymentFilter,
} from "@/lib/export-bookings";

export const dynamic = "force-dynamic";

/**
 * 予約・受講者一覧を CSV で出力
 *
 * GET /api/export
 *   ?event_id=uuid          講座で絞り込み
 *   &month=2026-06          開催月（JST）で絞り込み
 *   &session_id=uuid        日程で絞り込み
 *   &payment_status=all|paid|pending|cancelled
 *   &mode=bookings|attendees  申込一覧 / 受講者一覧（メール単位）
 */
export async function GET(req: NextRequest) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("event_id");
  const sessionId = searchParams.get("session_id");
  const month = searchParams.get("month");
  const paymentStatus = (searchParams.get("payment_status") ??
    "all") as ExportPaymentFilter;
  const mode = (searchParams.get("mode") ?? "bookings") as ExportMode;

  if (mode !== "bookings" && mode !== "attendees") {
    return NextResponse.json({ error: "無効な出力形式です" }, { status: 400 });
  }

  if (
    paymentStatus !== "all" &&
    paymentStatus !== "paid" &&
    paymentStatus !== "pending" &&
    paymentStatus !== "cancelled"
  ) {
    return NextResponse.json({ error: "無効な支払状況です" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("*, events(title, slug), event_sessions(starts_at, ends_at)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[export] error:", error);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }

  const filters: ExportFilters = {
    eventId,
    sessionId,
    month,
    paymentStatus,
    mode,
  };

  const rows = filterExportBookings(
    (data ?? []) as ExportBookingRow[],
    filters
  );

  const csv = buildExportCsv(rows, mode);
  const filename = buildExportFilename(filters);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
