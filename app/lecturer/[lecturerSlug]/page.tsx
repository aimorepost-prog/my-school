import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import type { Event, Lecturer } from "@/types";
import {
  HydrangeaCluster,
  Leaf,
  Droplet,
  SoftBlob,
} from "@/components/decor";
import SiteFooter from "@/components/SiteFooter";
import {
  formatPriceRange,
  getEventPriceOptions,
} from "@/lib/event-pricing";
import {
  filterOpenSessions,
  formatSessionRange,
} from "@/lib/event-sessions";
import type { EventSession } from "@/types";

interface EventWithSessions extends Event {
  openSessionCount: number;
  nextSessionLabel: string | null;
}

interface PageProps {
  params: { lecturerSlug: string };
}

export const dynamic = "force-dynamic";

// ============================================================
// メタデータ
// ============================================================
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { data: lecturer } = await supabaseAdmin
    .from("lecturers")
    .select("name, title, catch_copy, image_url")
    .eq("slug", params.lecturerSlug)
    .eq("is_published", true)
    .maybeSingle<Pick<Lecturer, "name" | "title" | "catch_copy" | "image_url">>();

  if (!lecturer) return { title: "講師が見つかりません" };

  return {
    title: `${lecturer.name} | ${lecturer.title ?? "講師プロフィール"}`,
    description: lecturer.catch_copy ?? undefined,
    openGraph: {
      title: lecturer.name,
      description: lecturer.catch_copy ?? undefined,
      images: lecturer.image_url ? [lecturer.image_url] : undefined,
    },
  };
}

// ============================================================
// 日付フォーマット
// ============================================================
function formatJpDate(iso: string): string {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const day = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${yyyy}.${mm}.${dd} (${day})`;
}

function formatJpTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mi}`;
}

// ============================================================
// 講師LP
// ============================================================
export default async function LecturerPage({ params }: PageProps) {
  const { data: lecturer, error } = await supabaseAdmin
    .from("lecturers")
    .select("*")
    .eq("slug", params.lecturerSlug)
    .eq("is_published", true)
    .maybeSingle<Lecturer>();

  if (error || !lecturer) {
    notFound();
  }

  const { data: events } = await supabaseAdmin
    .from("events")
    .select("*")
    .eq("lecturer_id", lecturer.id)
    .eq("is_published", true)
    .order("event_date", { ascending: true })
    .returns<Event[]>();

  const eventList = events ?? [];
  const eventIds = eventList.map((e) => e.id);

  let sessionsByEvent = new Map<string, EventSession[]>();
  if (eventIds.length > 0) {
    const { data: sessionRows } = await supabaseAdmin
      .from("event_sessions")
      .select("*")
      .in("event_id", eventIds)
      .eq("is_published", true)
      .order("starts_at", { ascending: true })
      .returns<EventSession[]>();

    for (const s of sessionRows ?? []) {
      const list = sessionsByEvent.get(s.event_id) ?? [];
      list.push(s);
      sessionsByEvent.set(s.event_id, list);
    }
  }

  const upcomingEvents: EventWithSessions[] = eventList
    .map((ev) => {
      const sessions = sessionsByEvent.get(ev.id) ?? [];
      const open = filterOpenSessions(sessions);
      const next = open[0] ?? null;
      return {
        ...ev,
        openSessionCount: open.length,
        nextSessionLabel: next
          ? formatSessionRange(next.starts_at, next.ends_at)
          : null,
      };
    })
    .filter((ev) => ev.openSessionCount > 0);

  const social = lecturer.social_links ?? {};

  return (
    <main className="min-h-screen overflow-x-hidden bg-brand-bg text-ink">
      {/* ====================================================
          ① ヒーロー
      ==================================================== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-fade" />
        <SoftBlob
          color="#D6EBF5"
          className="pointer-events-none absolute -top-32 -left-20 h-[480px] w-[480px]"
        />
        <SoftBlob
          color="#FCD7CE"
          className="pointer-events-none absolute -bottom-24 -right-20 h-[400px] w-[400px]"
        />

        <HydrangeaCluster className="pointer-events-none absolute right-4 top-8 h-32 w-32 md:right-8 md:h-48 md:w-48" />
        <Leaf className="pointer-events-none absolute left-2 bottom-12 h-24 w-16 -rotate-12 md:left-12 md:h-36 md:w-24" />
        <Droplet className="pointer-events-none absolute right-1/3 top-12 h-5 w-5 md:h-7 md:w-7" />
        <Droplet className="pointer-events-none absolute left-1/4 top-24 h-4 w-4 opacity-70 md:h-6 md:w-6" />

        <div className="relative mx-auto max-w-5xl px-5 py-14 md:px-8 md:py-24">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_auto] md:items-center md:gap-12">
            <div className="text-center md:text-left">
              {lecturer.title && (
                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-1.5 text-xs font-bold text-brand-deep shadow-card backdrop-blur md:text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {lecturer.title}
                </div>
              )}

              <h1 className="mb-5 font-serif text-4xl font-bold leading-tight tracking-wide text-brand-deep drop-shadow-sm md:text-6xl">
                {lecturer.name}
              </h1>

              {lecturer.catch_copy && (
                <p className="font-serif text-lg leading-relaxed text-ink-soft md:text-2xl">
                  <span className="inline-block border-b border-dotted border-accent pb-1">
                    {lecturer.catch_copy}
                  </span>
                </p>
              )}

              {upcomingEvents.length > 0 && (
                <div className="mt-8 flex justify-center md:justify-start">
                  <a
                    href="#courses"
                    className="inline-flex items-center gap-2 rounded-full bg-cta-gradient px-7 py-3.5 text-sm font-bold text-white shadow-cta transition hover:-translate-y-0.5 hover:shadow-cta-hover md:text-base"
                  >
                    開催中の講座を見る
                    <IconArrowDown />
                  </a>
                </div>
              )}
            </div>

            {lecturer.image_url && (
              <div className="relative mx-auto md:mx-0">
                {/* 装飾枠 */}
                <div className="absolute inset-0 -translate-x-3 translate-y-3 rounded-[2.5rem] bg-gradient-to-br from-brand-light to-accent-soft" />
                <Droplet className="absolute -left-4 -top-2 h-8 w-8" />
                <HydrangeaCluster className="absolute -right-6 -bottom-4 h-20 w-20" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lecturer.image_url}
                  alt={lecturer.name}
                  className="relative h-64 w-64 rounded-[2.5rem] object-cover shadow-soft md:h-80 md:w-80"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ====================================================
          ② 講師の想い
      ==================================================== */}
      {lecturer.bio && (
        <section className="relative px-5 py-14 md:py-20">
          <SoftBlob
            color="#EDF6FB"
            className="pointer-events-none absolute -top-10 right-10 h-72 w-72 opacity-60"
          />
          <div className="relative mx-auto max-w-3xl">
            <SectionTitle small="About" main="講師について" />
            <div className="relative overflow-hidden rounded-3xl bg-white px-6 py-10 shadow-card md:px-12 md:py-14">
              <Droplet className="absolute -right-4 -top-4 h-16 w-16 opacity-40" />
              <p className="relative whitespace-pre-wrap text-base leading-loose text-ink md:text-lg">
                {lecturer.bio}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ====================================================
          ③ 講師からのメッセージ
      ==================================================== */}
      {lecturer.message && (
        <section className="relative px-5 py-14 md:py-20">
          <SoftBlob
            color="#FCD7CE"
            className="pointer-events-none absolute -bottom-10 left-0 h-72 w-72 opacity-60"
          />
          <div className="relative mx-auto max-w-3xl pt-5">
            <div className="relative rounded-3xl bg-gradient-to-br from-brand-pale via-white to-accent-peach/40 px-6 pb-12 pt-10 shadow-card md:px-12 md:pb-16 md:pt-12">
              <span className="absolute -top-4 left-8 rounded-full bg-cta-gradient px-5 py-1.5 text-xs font-bold tracking-[0.2em] text-white shadow-card">
                MESSAGE
              </span>
              <HydrangeaCluster className="pointer-events-none absolute -right-6 -bottom-6 h-28 w-28 opacity-60" />
              <p className="relative whitespace-pre-wrap font-serif text-base leading-loose text-ink md:text-lg">
                {lecturer.message}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ====================================================
          ④ 開催中の講座一覧
      ==================================================== */}
      <section
        id="courses"
        className="relative bg-gradient-to-b from-white to-brand-pale/40 px-5 py-16 md:py-24"
      >
        <SoftBlob
          color="#D6EBF5"
          className="pointer-events-none absolute -top-10 left-0 h-72 w-72 opacity-50"
        />
        <div className="relative mx-auto max-w-5xl">
          <SectionTitle small="Courses" main="開催中の講座" />

          {upcomingEvents.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-brand-light bg-white px-6 py-16 text-center">
              <p className="text-ink-mute">
                現在、募集中の講座はありません。
                <br />
                次回の開催をお楽しみに。
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {upcomingEvents.map((ev) => (
                <Link
                  key={ev.id}
                  href={`/${ev.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block overflow-hidden rounded-3xl bg-white shadow-card transition hover:-translate-y-1 hover:shadow-soft"
                >
                  <Droplet className="pointer-events-none absolute -right-2 -top-2 h-12 w-12 opacity-50" />
                  {ev.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ev.image_url}
                      alt={ev.title}
                      className="h-44 w-full object-cover"
                    />
                  )}
                  <div className="relative p-6">
                    {ev.catch_copy && (
                      <div className="mb-2 text-xs font-medium tracking-wider text-brand-deep">
                        {ev.catch_copy}
                      </div>
                    )}
                    <h3 className="mb-3 font-serif text-lg font-bold leading-snug text-ink group-hover:text-brand-deep md:text-xl">
                      {ev.title}
                    </h3>

                    <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-soft md:text-sm">
                      <span className="inline-flex items-center gap-1.5">
                        <IconCalendar />
                        {ev.openSessionCount}日程 受付中
                        {ev.nextSessionLabel && (
                          <span className="text-ink">
                            （次回：{ev.nextSessionLabel}）
                          </span>
                        )}
                      </span>
                      {ev.location_text && (
                        <span className="inline-flex items-center gap-1.5">
                          <IconLocation />
                          {ev.location_text}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-dashed border-brand-light pt-4">
                      <div>
                        {(() => {
                          const opts = getEventPriceOptions(ev.slug);
                          const label = opts
                            ? formatPriceRange(opts)
                            : `¥${ev.price.toLocaleString()}`;
                          return (
                            <>
                              <span className="text-2xl font-bold text-brand-deep">
                                {label}
                              </span>
                              <span className="ml-1 text-xs font-normal text-ink-mute">
                                (税込)
                              </span>
                            </>
                          );
                        })()}
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-cta-gradient px-4 py-2 text-sm font-semibold text-white shadow-card transition group-hover:shadow-cta">
                        詳細を見る
                        <IconArrowRight />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ====================================================
          ⑥ SNS
      ==================================================== */}
      {hasAnySocial(social) && (
        <section className="relative mx-auto max-w-3xl px-5 py-16 md:py-20">
          <SectionTitle small="Connect" main="SNS・公式サイト" />
          <div className="flex flex-wrap justify-center gap-3">
            {social.website && (
              <SocialLink
                href={social.website}
                label={socialLinkLabel(social.website, "公式サイト")}
              />
            )}
            {social.instagram && (
              <SocialLink href={social.instagram} label="Instagram" />
            )}
            {social.twitter && <SocialLink href={social.twitter} label="X" />}
            {social.youtube && (
              <SocialLink href={social.youtube} label="YouTube" />
            )}
            {social.facebook && (
              <SocialLink href={social.facebook} label="Facebook" />
            )}
            {social.line && <SocialLink href={social.line} label="公式LINE" />}
          </div>
        </section>
      )}

      {/* ====================================================
          ⑦ お問い合わせ
      ==================================================== */}
      <section className="relative mx-auto max-w-3xl px-5 pb-16 md:pb-20">
        <div className="rounded-3xl border border-brand-light bg-white px-6 py-10 text-center shadow-card md:px-12 md:py-12">
          <p className="mb-2 text-xs font-bold tracking-[0.3em] text-brand-deep">
            CONTACT
          </p>
          <h2 className="mb-4 font-serif text-2xl font-bold text-ink md:text-3xl">
            お問い合わせ
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-ink md:text-base">
            講座に関するご質問・ご相談は、お気軽にお問い合わせください。
            <br className="hidden md:block" />
            2〜3営業日以内にご返信いたします。
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full bg-brand-deep px-10 py-3.5 text-base font-bold text-white shadow-soft transition hover:bg-brand-dark md:text-lg"
          >
            お問い合わせフォームへ
            <span className="ml-2" aria-hidden>
              →
            </span>
          </Link>
        </div>
      </section>

      <div className="h-16" />

      <SiteFooter />
    </main>
  );
}

// ============================================================
// 共通コンポーネント
// ============================================================
function SectionTitle({ small, main }: { small: string; main: string }) {
  return (
    <div className="mb-8 text-center md:mb-12">
      <div className="mb-2 text-xs font-bold tracking-[0.3em] text-brand-deep">
        {small}
      </div>
      <h2 className="font-serif text-2xl font-bold text-ink md:text-3xl">
        {main}
      </h2>
      <div className="mx-auto mt-3 flex items-center justify-center gap-1.5">
        <span className="h-0.5 w-8 rounded-full bg-brand" />
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        <span className="h-0.5 w-8 rounded-full bg-brand" />
      </div>
    </div>
  );
}

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-brand-light bg-white px-5 py-2.5 text-sm font-medium text-ink-soft shadow-card transition hover:border-brand hover:bg-brand-pale hover:text-brand-deep"
    >
      {label}
      <IconExternal />
    </a>
  );
}

function socialLinkLabel(url: string, fallback: string): string {
  if (url.includes("note.com")) return "note";
  if (url.includes("x.com") || url.includes("twitter.com")) return "X";
  return fallback;
}

function hasAnySocial(s: Lecturer["social_links"]): boolean {
  return Boolean(
    s &&
      (s.instagram ||
        s.twitter ||
        s.youtube ||
        s.facebook ||
        s.website ||
        s.line)
  );
}

// ============================================================
// アイコン
// ============================================================
function IconCalendar() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconLocation() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconArrowDown() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  );
}

function IconExternal() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
