import type { EventSession } from "@/types";

const JST = "Asia/Tokyo";

/** 申込期限 = 開催日の前日 23:59:59.999（JST） */
export function getRegistrationDeadline(startsAt: string | Date): Date {
  const start = new Date(startsAt);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: JST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(start);

  const y = Number(parts.find((p) => p.type === "year")?.value);
  const m = Number(parts.find((p) => p.type === "month")?.value);
  const d = Number(parts.find((p) => p.type === "day")?.value);

  const prev = new Date(Date.UTC(y, m - 1, d));
  prev.setUTCDate(prev.getUTCDate() - 1);

  const yy = prev.getUTCFullYear();
  const mm = String(prev.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(prev.getUTCDate()).padStart(2, "0");

  return new Date(`${yy}-${mm}-${dd}T23:59:59.999+09:00`);
}

export function isSessionRegistrationOpen(
  startsAt: string | Date,
  now: Date = new Date()
): boolean {
  return now.getTime() <= getRegistrationDeadline(startsAt).getTime();
}

export function filterOpenSessions(
  sessions: EventSession[],
  now: Date = new Date()
): EventSession[] {
  return sessions
    .filter(
      (s) => s.is_published && isSessionRegistrationOpen(s.starts_at, now)
    )
    .sort(
      (a, b) =>
        new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
    );
}

export function formatSessionDateTime(iso: string): {
  dateLabel: string;
  timeLabel: string;
  rangeLabel: string;
} {
  const start = new Date(iso);
  const dateLabel = start.toLocaleDateString("ja-JP", {
    timeZone: JST,
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
  const timeLabel = start.toLocaleTimeString("ja-JP", {
    timeZone: JST,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return {
    dateLabel,
    timeLabel,
    rangeLabel: `${dateLabel} ${timeLabel}〜`,
  };
}

export function formatSessionRange(
  startsAt: string,
  endsAt: string | null
): string {
  const start = new Date(startsAt);
  const datePart = start.toLocaleDateString("ja-JP", {
    timeZone: JST,
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });
  const startTime = start.toLocaleTimeString("ja-JP", {
    timeZone: JST,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (!endsAt) {
    return `${datePart} ${startTime}〜`;
  }

  const endTime = new Date(endsAt).toLocaleTimeString("ja-JP", {
    timeZone: JST,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${datePart} ${startTime} 〜 ${endTime}`;
}

export function formatRegistrationDeadline(startsAt: string | Date): string {
  const deadline = getRegistrationDeadline(startsAt);
  return deadline.toLocaleString("ja-JP", {
    timeZone: JST,
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** JST の日時文字列を ISO に変換（seed 用） */
export function jstIso(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): string {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  const hh = String(hour).padStart(2, "0");
  const mi = String(minute).padStart(2, "0");
  return new Date(`${year}-${mm}-${dd}T${hh}:${mi}:00+09:00`).toISOString();
}
