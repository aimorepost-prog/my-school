import Link from "next/link";
import type { EventSession } from "@/types";
import {
  filterOpenSessions,
  formatRegistrationDeadline,
  formatSessionRange,
} from "@/lib/event-sessions";

interface Props {
  eventSlug: string;
  sessions: EventSession[];
  variant?: "hero" | "section" | "cta";
}

export default function SessionSchedule({
  eventSlug,
  sessions,
  variant = "section",
}: Props) {
  const openSessions = filterOpenSessions(sessions);

  if (openSessions.length === 0) {
    return (
      <div
        className={
          variant === "hero"
            ? "mb-8 rounded-2xl border border-brand-light bg-white px-5 py-6 text-center shadow-card md:px-6"
            : "rounded-2xl border border-brand-light bg-white px-6 py-10 text-center shadow-card"
        }
      >
        <p className="text-base font-bold text-brand-deep md:text-lg">
          現在、受付中の日程はありません
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          次回の開催が決まり次第、こちらに掲載いたします。
        </p>
      </div>
    );
  }

  const gridClass =
    variant === "hero"
      ? "mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2"
      : "grid grid-cols-1 gap-4 sm:grid-cols-2";

  return (
    <div className={variant === "hero" ? "mb-8" : ""}>
      {variant !== "hero" && (
        <div className="mb-6 text-center">
          <p className="mb-2 text-xs font-bold tracking-[0.3em] text-brand-deep">
            SCHEDULE
          </p>
          <h2 className="font-serif text-2xl font-bold text-ink md:text-3xl">
            開催日程を選ぶ
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft md:text-base">
            ご希望の日程を選んでお申し込みください。
            <br className="hidden md:inline" />
            申込期限は各日程の<strong className="text-ink">前日23:59</strong>
            までです。
          </p>
        </div>
      )}

      {variant === "hero" && (
        <div className="mb-4">
          <h2 className="text-base font-bold text-brand-deep md:text-lg">
            開催日程（{openSessions.length}件）
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            ご希望の日程を選んでお申し込みください（前日23:59まで）
          </p>
        </div>
      )}

      <div className={gridClass}>
        {openSessions.map((session) => (
          <SessionCard
            key={session.id}
            eventSlug={eventSlug}
            session={session}
            compact={variant === "hero"}
          />
        ))}
      </div>
    </div>
  );
}

function SessionCard({
  eventSlug,
  session,
  compact,
}: {
  eventSlug: string;
  session: EventSession;
  compact?: boolean;
}) {
  const range = formatSessionRange(session.starts_at, session.ends_at);
  const deadline = formatRegistrationDeadline(session.starts_at);

  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border border-brand-light bg-white shadow-card transition hover:border-brand hover:shadow-soft ${
        compact ? "p-4" : "p-5 md:p-6"
      }`}
    >
      <div>
        <p
          className={`font-bold leading-snug text-ink ${
            compact ? "text-sm md:text-base" : "text-base md:text-lg"
          }`}
        >
          {range}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-ink-soft md:text-sm">
          申込期限：{deadline}まで
        </p>
      </div>
      <Link
        href={`/${eventSlug}/register?session=${session.id}`}
        className={`mt-4 inline-flex items-center justify-center rounded-xl bg-brand-deep font-bold text-white transition hover:bg-brand-dark ${
          compact ? "px-4 py-2.5 text-sm" : "px-5 py-3 text-sm md:text-base"
        }`}
      >
        この日程で申し込む
      </Link>
    </div>
  );
}
