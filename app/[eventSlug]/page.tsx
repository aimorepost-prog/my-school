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
import SessionSchedule from "@/components/SessionSchedule";
import {
  getEventPriceOptions,
} from "@/lib/event-pricing";
import {
  filterOpenSessions,
  formatSessionRange,
} from "@/lib/event-sessions";
import type { EventSession } from "@/types";

interface PageProps {
  params: { eventSlug: string };
}

export const dynamic = "force-dynamic";

// ============================================================
// メタデータ
// ============================================================
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { data: ev } = await supabaseAdmin
    .from("events")
    .select("title, catch_copy, image_url")
    .eq("slug", params.eventSlug)
    .eq("is_published", true)
    .maybeSingle<Pick<Event, "title" | "catch_copy" | "image_url">>();

  if (!ev) return { title: "イベントが見つかりません" };

  return {
    title: ev.title,
    description: ev.catch_copy ?? undefined,
    openGraph: {
      title: ev.title,
      description: ev.catch_copy ?? undefined,
      images: ev.image_url ? [ev.image_url] : undefined,
    },
  };
}

// ============================================================
// 日付フォーマット
// ============================================================
function formatJpDateParts(iso: string) {
  const d = new Date(iso);
  return {
    yyyy: d.getFullYear(),
    md: `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, "0")}`,
    yyyymmdd: `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}月${String(d.getDate()).padStart(2, "0")}日`,
    day: ["日", "月", "火", "水", "木", "金", "土"][d.getDay()],
    time: `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`,
  };
}

function normalizeTitleText(text: string): string {
  // 大きな明朝体では半角数字だけ少し浮いて見えるため、タイトル表示では全角に揃える
  return text.replace(/[0-9]/g, (n) =>
    String.fromCharCode(n.charCodeAt(0) + 0xfee0)
  );
}

// 「思考の学校 体験会」のように、メインタイトルを2行に分ける
function splitTitle(title: string): [string, string] {
  const normalizedTitle = normalizeTitleText(title);
  if (normalizedTitle.length <= 6) return [normalizedTitle, ""];
  if (normalizedTitle.includes(" ")) {
    const idx = normalizedTitle.indexOf(" ");
    return [normalizedTitle.slice(0, idx), normalizedTitle.slice(idx + 1)];
  }
  if (normalizedTitle.includes("　")) {
    const idx = normalizedTitle.indexOf("　");
    return [normalizedTitle.slice(0, idx), normalizedTitle.slice(idx + 1)];
  }
  // 文字数の半分で分割
  const half = Math.ceil(normalizedTitle.length / 2);
  return [normalizedTitle.slice(0, half), normalizedTitle.slice(half)];
}

// ============================================================
// 講座LP
// ============================================================
export default async function EventPage({ params }: PageProps) {
  const { data: event, error } = await supabaseAdmin
    .from("events")
    .select("*")
    .eq("slug", params.eventSlug)
    .eq("is_published", true)
    .maybeSingle<Event>();

  if (error || !event) {
    notFound();
  }

  let lecturer: Lecturer | null = null;
  if (event.lecturer_id) {
    const { data } = await supabaseAdmin
      .from("lecturers")
      .select("*")
      .eq("id", event.lecturer_id)
      .maybeSingle<Lecturer>();
    lecturer = data ?? null;
  }

  const { data: sessionRows } = await supabaseAdmin
    .from("event_sessions")
    .select("*")
    .eq("event_id", event.id)
    .eq("is_published", true)
    .order("starts_at", { ascending: true })
    .returns<EventSession[]>();

  const sessions = sessionRows ?? [];
  const openSessions = filterOpenSessions(sessions);
  const nextSession = openSessions[0] ?? null;

  const benefits = event.benefits ?? [];
  const targets = event.target_audience ?? [];
  const faqs = event.faqs ?? [];
  const [title1, title2] = splitTitle(event.title);
  const priceOptions = getEventPriceOptions(event.slug);
  const benefitGridCols =
    benefits.length === 4
      ? "md:grid-cols-2"
      : benefits.length === 3
        ? "md:grid-cols-3"
        : "md:grid-cols-2";

  return (
    <main className="min-h-screen overflow-x-hidden bg-brand-bg text-ink">
      {/* ====================================================
          ① ヒーロー（見本準拠：左テキスト + 右大型講師写真）
      ==================================================== */}
      <section className="relative overflow-hidden">
        {/* 背景レイヤー */}
        <div className="absolute inset-0 bg-hero-fade" />
        <SoftBlob
          color="#D6EBF5"
          className="pointer-events-none absolute -left-32 -top-32 h-[600px] w-[600px]"
        />
        <SoftBlob
          color="#FCD7CE"
          className="pointer-events-none absolute -bottom-40 -right-32 h-[500px] w-[500px]"
        />
        <SoftBlob
          color="#DCEDE6"
          className="pointer-events-none absolute right-1/4 top-1/3 h-[300px] w-[300px] opacity-50"
        />

        {/* 散らした装飾 */}
        <HydrangeaCluster className="pointer-events-none absolute -left-4 top-12 h-32 w-32 rotate-12 md:left-2 md:top-16 md:h-44 md:w-44" />
        <HydrangeaCluster className="pointer-events-none absolute right-1/2 -bottom-6 h-28 w-28 -rotate-6 md:bottom-12 md:right-1/3 md:h-36 md:w-36" />
        <HydrangeaCluster className="pointer-events-none absolute right-4 top-4 h-24 w-24 rotate-45 opacity-70 md:right-12 md:h-32 md:w-32" />
        <Leaf className="pointer-events-none absolute -right-4 bottom-4 h-32 w-20 rotate-12 md:right-4 md:h-44 md:w-28" />
        <Leaf className="pointer-events-none absolute left-1/3 top-2 h-20 w-14 -rotate-12 md:h-28 md:w-20" />
        <Leaf className="pointer-events-none absolute left-2 bottom-32 h-24 w-16 rotate-180 md:left-12 md:h-32 md:w-20" />
        <Droplet className="pointer-events-none absolute left-1/4 top-1/4 h-5 w-5 opacity-80 md:h-7 md:w-7" />
        <Droplet className="pointer-events-none absolute right-1/3 top-3/4 h-4 w-4 opacity-60 md:h-6 md:w-6" />
        <Droplet className="pointer-events-none absolute right-1/4 top-12 h-6 w-6 opacity-70 md:h-8 md:w-8" />

        <div className="relative mx-auto max-w-6xl px-5 pt-10 pb-12 md:px-8 md:pt-16 md:pb-16">
          {/* バッジ（オンラインセミナー等） */}
          {event.location_text && (
            <div className="mb-6 md:mb-8">
              <span className="inline-flex items-center gap-2 rounded-full border-2 border-accent/40 bg-white/90 px-4 py-1.5 text-xs font-bold text-accent shadow-card backdrop-blur md:px-5 md:py-2 md:text-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                {event.location_text.includes("オンライン")
                  ? "オンラインセミナー"
                  : event.location_text}
              </span>
            </div>
          )}

          {/* メイングリッド：左テキスト / 右講師画像 */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-6">
            {/* ===== 左カラム：テキスト ===== */}
            <div className="relative order-2 md:order-1">
              {/* キャッチコピー */}
              {event.catch_copy && (
                <p className="mb-4 font-serif text-base text-ink md:mb-5 md:text-lg">
                  <span className="inline-block border-b border-dotted border-accent pb-1">
                    {event.catch_copy}
                  </span>
                </p>
              )}

              {/* 巨大タイトル（2行） */}
              <h1 className="mb-2 font-serif font-bold leading-[1.15] tracking-wide text-brand-deep">
                <span className="block text-3xl drop-shadow-sm md:text-5xl">
                  {title1}
                </span>
                {title2 && (
                  <span className="mt-1 block text-2xl text-brand-deep drop-shadow-sm md:mt-2 md:text-4xl">
                    {title2}
                  </span>
                )}
              </h1>

              {/* サブタイトル */}
              {event.subtitle && (
                <p className="mt-5 mb-6 text-sm leading-relaxed text-ink md:mt-6 md:mb-8 md:text-base">
                  {event.subtitle}
                </p>
              )}

              {/* 開催概要（見やすく1枚にまとめる） */}
              <div className="mb-8 overflow-hidden rounded-2xl border border-brand-light bg-white shadow-card">
                <div className="border-b border-brand-pale bg-brand-pale/60 px-5 py-3 md:px-6">
                  <h2 className="text-base font-bold text-brand-deep">
                    開催概要
                  </h2>
                </div>
                <dl className="divide-y divide-brand-pale px-5 md:px-6">
                  <HeroInfoRow
                    label="日程"
                    value={
                      openSessions.length > 0
                        ? `${openSessions.length}日程 受付中（次回：${formatSessionRange(nextSession!.starts_at, nextSession!.ends_at)}）`
                        : "現在受付中の日程はありません"
                    }
                  />
                  {event.location_text && (
                    <HeroInfoRow
                      label="形式"
                      value={event.location_text.replace(/[（(].*[)）]/, "").trim() || event.location_text}
                    />
                  )}
                  {event.duration_text && (
                    <HeroInfoRow label="時間" value={event.duration_text} />
                  )}
                  {priceOptions ? (
                    <div className="py-4 md:py-5">
                      <dt className="mb-3 text-sm font-bold text-brand-deep md:text-base">
                        参加費（税込）
                      </dt>
                      <dd className="space-y-3">
                        {priceOptions.map((option) => (
                          <div
                            key={option.id}
                            className="rounded-xl border border-brand-light bg-brand-pale/30 px-4 py-3"
                          >
                            <div className="text-sm leading-relaxed text-ink md:text-base">
                              {option.label}
                            </div>
                            <div className="mt-1 text-xl font-bold text-brand-deep md:text-2xl">
                              ¥{option.price.toLocaleString()}
                            </div>
                          </div>
                        ))}
                        <p className="text-sm leading-relaxed text-ink">
                          ※ お申し込みフォームで該当する区分をお選びください
                        </p>
                      </dd>
                    </div>
                  ) : (
                    <HeroInfoRow
                      label="参加費"
                      value={`¥${event.price.toLocaleString()}（税込）`}
                      large
                    />
                  )}
                </dl>
              </div>

              {openSessions.length > 0 ? (
                <div className="max-w-lg">
                  <Link
                    href="#schedule"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-deep px-8 py-5 text-lg font-bold text-white shadow-soft transition hover:bg-brand-deep/90 md:text-xl"
                  >
                    開催日程を選ぶ
                    <IconArrowRight />
                  </Link>
                  <p className="mt-4 text-sm leading-relaxed text-ink md:text-base">
                    事前決済制です。ご希望の日程を選んでお申し込みください（前日23:59まで）。
                  </p>
                </div>
              ) : (
                <div className="max-w-lg">
                  <p className="text-sm leading-relaxed text-ink md:text-base">
                    次回の開催が決まり次第、こちらに日程を掲載いたします。
                  </p>
                </div>
              )}
            </div>

            {/* ===== 右カラム：大型講師ビジュアル ===== */}
            <div className="relative order-1 md:order-2">
              {lecturer?.image_url ? (
                <div className="relative">
                  {/* 装飾 */}
                  <Droplet className="pointer-events-none absolute -left-4 top-4 z-10 h-7 w-7 md:h-10 md:w-10" />
                  <Droplet className="pointer-events-none absolute right-2 top-12 z-10 h-5 w-5 opacity-80 md:h-7 md:w-7" />
                  <HydrangeaCluster className="pointer-events-none absolute -right-2 -top-2 z-10 h-24 w-24 md:-right-4 md:-top-6 md:h-36 md:w-36" />
                  <HydrangeaCluster className="pointer-events-none absolute -left-4 -bottom-2 z-10 h-20 w-20 -rotate-12 md:-left-6 md:-bottom-4 md:h-32 md:w-32" />

                  {/* 写真本体 */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={lecturer.image_url}
                    alt={lecturer.name}
                    className="relative aspect-[4/5] w-full rounded-[2rem] object-cover shadow-soft md:aspect-[3/4]"
                  />

                  {/* 講師カード（写真の右下に重ねる） */}
                  <Link
                    href={`/lecturer/${lecturer.slug}`}
                    className="group absolute -bottom-4 -right-2 z-20 block w-44 overflow-hidden rounded-2xl bg-white/95 p-4 shadow-card backdrop-blur transition hover:-translate-y-0.5 hover:shadow-soft md:-bottom-6 md:-right-4 md:w-56 md:p-5"
                  >
                    <div className="mb-1.5 inline-flex rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
                      講師
                    </div>
                    <div className="font-bold text-ink md:text-lg">
                      {lecturer.name}
                    </div>
                    {lecturer.title && (
                      <div className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-ink-soft md:text-xs">
                        {lecturer.title}
                      </div>
                    )}
                    {lecturer.catch_copy && (
                      <p className="mt-2 border-t border-dashed border-brand-light pt-2 font-serif text-xs leading-snug text-ink-soft md:text-sm">
                        {lecturer.catch_copy}
                      </p>
                    )}
                  </Link>
                </div>
              ) : (
                // 講師画像がない場合のプレースホルダ
                <div className="flex aspect-square items-center justify-center rounded-[2rem] bg-gradient-to-br from-brand-light to-brand-pale text-6xl">
                  📘
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          ② 得られるもの
      ==================================================== */}
      {benefits.length > 0 && (
        <section className="relative px-5 py-14 md:py-20">
          <SoftBlob
            color="#EDF6FB"
            className="pointer-events-none absolute -top-10 right-0 h-72 w-72"
          />
          <div className="relative mx-auto max-w-4xl">
            <SectionTitle small="Benefits" main="このイベントで得られるもの" />
            <div className={`grid grid-cols-1 gap-5 ${benefitGridCols}`}>
              {benefits.map((b, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-soft"
                >
                  <Droplet className="absolute -right-2 -top-2 h-12 w-12 opacity-30 transition group-hover:opacity-50" />
                  <div className="relative">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-light to-brand-pale font-bold text-brand-deep">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="mb-2 text-lg font-bold leading-snug text-ink">
                      {b.title}
                    </h3>
                    {b.description && (
                      <p className="text-sm leading-relaxed text-ink">
                        {b.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====================================================
          ③ こんな方におすすめ
      ==================================================== */}
      {targets.length > 0 && (
        <section className="relative px-5 py-14 md:py-20">
          <SoftBlob
            color="#FCD7CE"
            className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 opacity-60"
          />
          <div className="relative mx-auto max-w-3xl">
            <SectionTitle small="For You" main="こんな方におすすめ" />
            <ul className="space-y-3">
              {targets.map((t, i) => (
                <li
                  key={i}
                  className="flex items-start gap-4 rounded-2xl border border-brand-light bg-white px-6 py-4 shadow-card transition hover:border-brand hover:shadow-soft"
                >
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-dark to-brand-deep text-white shadow-sm">
                    <IconCheck />
                  </span>
                  <span className="text-base font-medium leading-relaxed text-ink">
                    {t}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ====================================================
          ⑤ 説明文
      ==================================================== */}
      {event.description && (
        <section className="bg-white px-5 pb-14 pt-2 md:pb-20">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl border border-brand-light bg-white px-6 py-10 shadow-card md:px-12 md:py-12">
              <p className="whitespace-pre-wrap text-base leading-loose text-ink md:text-lg">
                {event.description}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ====================================================
          ⑥ FAQ
      ==================================================== */}
      {faqs.length > 0 && (
        <section className="relative px-5 py-14 md:py-20">
          <div className="mx-auto max-w-3xl">
            <SectionTitle small="FAQ" main="よくある質問" />
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <details
                  key={i}
                  className="group rounded-2xl bg-white p-5 shadow-card transition open:bg-brand-pale"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                    <span className="flex items-start gap-3">
                      <span className="font-bold text-brand-deep">Q.</span>
                      <span className="font-semibold text-ink">{f.q}</span>
                    </span>
                    <span className="mt-1 text-brand-deep transition group-open:rotate-180">
                      <IconChevronDown />
                    </span>
                  </summary>
                  <div className="mt-4 flex items-start gap-3 border-t border-dashed border-brand-light pt-4">
                    <span className="font-bold text-accent">A.</span>
                    <p className="whitespace-pre-wrap leading-relaxed text-ink">
                      {f.a}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====================================================
          ⑦ 開催日程 + 最終CTA
      ==================================================== */}
      <section id="schedule" className="relative px-5 py-14 md:py-20">
        <div className="relative mx-auto max-w-4xl">
          <SessionSchedule
            eventSlug={event.slug}
            sessions={sessions}
            variant="section"
          />
        </div>
      </section>

      {openSessions.length > 0 && (
      <section className="relative px-5 py-16 md:py-24">
        <div className="relative mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-cta-section-gradient px-6 py-14 text-center shadow-soft md:px-12 md:py-20">
            <SoftBlob
              color="#FFFFFF"
              className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 opacity-15"
            />
            <SoftBlob
              color="#FFE4D9"
              className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 opacity-20"
            />
            <HydrangeaCluster className="pointer-events-none absolute right-4 top-4 h-20 w-20 opacity-30 md:h-28 md:w-28" />
            <Leaf className="pointer-events-none absolute left-6 bottom-4 h-20 w-14 -rotate-12 opacity-30 md:h-28 md:w-20" />

            <div className="relative">
              <p className="mb-3 text-xs font-bold tracking-[0.3em] text-white md:text-sm">
                READY?
              </p>
              <h2 className="mb-6 font-serif text-2xl font-bold text-white drop-shadow-md md:text-4xl">
                あなたのご参加を
                <br className="md:hidden" />
                お待ちしています
              </h2>

              <div className="mb-6">
                {priceOptions ? (
                  <div className="inline-flex flex-col gap-3 text-left">
                    {priceOptions.map((option) => (
                      <div
                        key={option.id}
                        className="rounded-2xl bg-white/85 px-5 py-3 backdrop-blur md:px-6 md:py-4"
                      >
                        <div className="text-xs text-ink-soft md:text-sm">
                          {option.label}
                        </div>
                        <div className="text-xl font-bold text-ink md:text-2xl">
                          ¥{option.price.toLocaleString()}
                          <span className="ml-2 text-sm font-normal text-ink-mute">
                            (税込)
                          </span>
                        </div>
                      </div>
                    ))}
                    <p className="text-xs text-white md:text-sm">
                      お申し込み時に該当する区分をお選びください
                    </p>
                  </div>
                ) : (
                  <div className="inline-block rounded-2xl bg-white/85 px-6 py-3 backdrop-blur md:px-8 md:py-4">
                    <div className="text-2xl font-bold text-ink md:text-3xl">
                      ¥{event.price.toLocaleString()}
                      <span className="ml-2 text-sm font-normal text-ink-mute">
                        (税込)
                      </span>
                    </div>
                  </div>
                )}
                <div className="mt-3 text-xs text-white md:text-sm">
                  申込期限は各日程の前日23:59まで
                </div>
              </div>

              <p className="text-sm text-white md:text-base">
                上の「開催日程を選ぶ」から、ご希望の日時をお選びください。
              </p>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ====================================================
          ⑧ 注意事項 + 講師プロフィール誘導
      ==================================================== */}
      <section className="mx-auto max-w-3xl px-5 pb-20">
        {event.notes && (
          <div className="mb-6 rounded-2xl border border-brand-light bg-white px-6 py-5 text-sm leading-relaxed text-ink">
            <div className="mb-2 flex items-center gap-2 font-bold text-ink">
              <span>📌</span>ご参加にあたって
            </div>
            <p className="whitespace-pre-wrap pl-6">{event.notes}</p>
          </div>
        )}

        {lecturer && (
          <Link
            href={`/lecturer/${lecturer.slug}`}
            className="group flex items-center gap-4 rounded-3xl bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft"
          >
            {lecturer.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={lecturer.image_url}
                alt={lecturer.name}
                className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-brand-pale"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-pale font-bold text-brand-deep">
                {lecturer.name.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <div className="text-xs text-ink-mute">この講座の講師</div>
              <div className="font-bold text-ink">{lecturer.name}</div>
              {lecturer.title && (
                <div className="text-xs text-ink-soft">{lecturer.title}</div>
              )}
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-pale px-4 py-2 text-sm font-semibold text-brand-deep transition group-hover:bg-brand group-hover:text-white">
              プロフィール
              <IconArrowRight />
            </span>
          </Link>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}

// ============================================================
// 共通コンポーネント
// ============================================================

// ヒーロー内：開催概要の1行
function HeroInfoRow({
  label,
  value,
  large,
}: {
  label: string;
  value: string;
  large?: boolean;
}) {
  return (
    <div className="grid gap-1 py-4 md:grid-cols-[5.5rem_1fr] md:items-center md:gap-4 md:py-5">
      <dt className="text-sm font-bold text-brand-deep md:text-base">{label}</dt>
      <dd
        className={`leading-relaxed text-ink ${
          large ? "text-xl font-bold md:text-2xl" : "text-base md:text-lg"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

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

// ============================================================
// アイコン
// ============================================================
function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
