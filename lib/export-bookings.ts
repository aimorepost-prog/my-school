import type { Booking, BookingAnswers, PaymentStatus } from "@/types";

const JST = "Asia/Tokyo";

export type ExportMode = "bookings" | "attendees";
export type ExportPaymentFilter = "all" | PaymentStatus;

export interface ExportBookingRow extends Booking {
  events: { title: string; slug: string } | null;
  event_sessions: { starts_at: string; ends_at: string | null } | null;
}

export interface ExportFilters {
  eventId?: string | null;
  sessionId?: string | null;
  month?: string | null;
  paymentStatus?: ExportPaymentFilter;
  mode?: ExportMode;
}

export function parseMonthRange(
  yearMonth: string
): { start: Date; end: Date } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(yearMonth.trim());
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  if (m < 1 || m > 12) return null;

  const start = new Date(
    `${y}-${String(m).padStart(2, "0")}-01T00:00:00+09:00`
  );
  const nextM = m === 12 ? 1 : m + 1;
  const nextY = m === 12 ? y + 1 : y;
  const end = new Date(
    `${nextY}-${String(nextM).padStart(2, "0")}-01T00:00:00+09:00`
  );
  return { start, end };
}

function isInRange(iso: string, range: { start: Date; end: Date }): boolean {
  const t = new Date(iso).getTime();
  return t >= range.start.getTime() && t < range.end.getTime();
}

export function filterExportBookings(
  rows: ExportBookingRow[],
  filters: ExportFilters
): ExportBookingRow[] {
  const monthRange = filters.month ? parseMonthRange(filters.month) : null;

  return rows.filter((row) => {
    if (filters.eventId && row.event_id !== filters.eventId) return false;
    if (filters.sessionId && row.session_id !== filters.sessionId) return false;
    if (
      filters.paymentStatus &&
      filters.paymentStatus !== "all" &&
      row.payment_status !== filters.paymentStatus
    ) {
      return false;
    }

    if (monthRange) {
      const dateForMonth = row.event_sessions?.starts_at ?? row.created_at;
      if (!isInRange(dateForMonth, monthRange)) return false;
    }

    return true;
  });
}

export function formatSessionCsv(
  s: { starts_at: string; ends_at: string | null } | null
): string {
  if (!s) return "";
  const start = new Date(s.starts_at).toLocaleString("ja-JP", {
    timeZone: JST,
  });
  if (!s.ends_at) return start;
  const end = new Date(s.ends_at).toLocaleTimeString("ja-JP", {
    timeZone: JST,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${start} 〜 ${end}`;
}

export function escapeCsv(v: string | null | undefined): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function paymentStatusLabel(s: string): string {
  if (s === "paid") return "入金済み";
  if (s === "cancelled") return "キャンセル";
  return "未入金";
}

function formatJpDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", { timeZone: JST });
}

function selectedPrice(row: ExportBookingRow): number {
  const answers = row.answers as BookingAnswers | undefined;
  return answers?.selected_price ?? 0;
}

export function buildBookingsCsv(rows: ExportBookingRow[]): string {
  const header = [
    "予約ID",
    "講座名",
    "講座slug",
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

  const lines = rows.map((r) => {
    const answers = r.answers as BookingAnswers | undefined;
    return [
      escapeCsv(r.id),
      escapeCsv(r.events?.title),
      escapeCsv(r.events?.slug),
      escapeCsv(r.name),
      escapeCsv(r.email),
      escapeCsv(r.phone),
      escapeCsv(formatSessionCsv(r.event_sessions)),
      escapeCsv(r.receipt_name ?? r.name),
      escapeCsv(r.referrer),
      escapeCsv(answers?.enrollment_reason),
      escapeCsv(answers?.past_courses?.join(" / ")),
      escapeCsv(answers?.price_tier_label),
      escapeCsv(
        answers?.selected_price != null ? String(answers.selected_price) : ""
      ),
      escapeCsv(paymentStatusLabel(r.payment_status)),
      escapeCsv(r.receipt_issued_at ? formatJpDateTime(r.receipt_issued_at) : ""),
      escapeCsv(formatJpDateTime(r.created_at)),
    ].join(",");
  });

  return "\uFEFF" + [header.join(","), ...lines].join("\r\n");
}

interface AttendeeAggregate {
  name: string;
  email: string;
  phone: string;
  bookingCount: number;
  paidCount: number;
  courses: Set<string>;
  sessions: string[];
  totalPaid: number;
  lastBookingAt: string;
}

export function buildAttendeesCsv(rows: ExportBookingRow[]): string {
  const map = new Map<string, AttendeeAggregate>();

  for (const row of rows) {
    const key = row.email.trim().toLowerCase();
    const courseLabel = row.events?.title ?? row.event_id;
    const sessionLabel = formatSessionCsv(row.event_sessions);
    const line =
      sessionLabel !== ""
        ? `${courseLabel}（${sessionLabel}）`
        : `${courseLabel}（申込 ${formatJpDateTime(row.created_at)}）`;

    const existing = map.get(key);
    if (existing) {
      existing.bookingCount += 1;
      if (row.payment_status === "paid") {
        existing.paidCount += 1;
        existing.totalPaid += selectedPrice(row);
      }
      existing.courses.add(courseLabel);
      existing.sessions.push(line);
      if (row.created_at > existing.lastBookingAt) {
        existing.lastBookingAt = row.created_at;
        existing.name = row.name;
        if (row.phone) existing.phone = row.phone;
      }
    } else {
      map.set(key, {
        name: row.name,
        email: row.email,
        phone: row.phone ?? "",
        bookingCount: 1,
        paidCount: row.payment_status === "paid" ? 1 : 0,
        courses: new Set([courseLabel]),
        sessions: [line],
        totalPaid:
          row.payment_status === "paid" ? selectedPrice(row) : 0,
        lastBookingAt: row.created_at,
      });
    }
  }

  const attendees = [...map.values()].sort((a, b) =>
    a.email.localeCompare(b.email, "ja")
  );

  const header = [
    "名前",
    "メール",
    "電話",
    "申込回数",
    "入金済み回数",
    "受講講座数",
    "合計受講費（入金済）",
    "受講講座・日程",
    "最新申込日時",
  ];

  const lines = attendees.map((a) =>
    [
      escapeCsv(a.name),
      escapeCsv(a.email),
      escapeCsv(a.phone),
      escapeCsv(String(a.bookingCount)),
      escapeCsv(String(a.paidCount)),
      escapeCsv(String(a.courses.size)),
      escapeCsv(String(a.totalPaid)),
      escapeCsv(a.sessions.join(" / ")),
      escapeCsv(formatJpDateTime(a.lastBookingAt)),
    ].join(",")
  );

  return "\uFEFF" + [header.join(","), ...lines].join("\r\n");
}

export function buildExportFilename(filters: ExportFilters): string {
  const parts = ["export", filters.mode ?? "bookings"];
  if (filters.eventId) parts.push("event");
  if (filters.month) parts.push(filters.month.replace("-", ""));
  if (filters.sessionId) parts.push("session");
  if (filters.paymentStatus && filters.paymentStatus !== "all") {
    parts.push(filters.paymentStatus);
  }
  parts.push(String(Date.now()));
  return `${parts.join("_")}.csv`;
}

export function buildExportCsv(
  rows: ExportBookingRow[],
  mode: ExportMode
): string {
  return mode === "attendees" ? buildAttendeesCsv(rows) : buildBookingsCsv(rows);
}
