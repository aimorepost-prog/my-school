import Link from "next/link";
import { notFound } from "next/navigation";
import EventFlowShell from "@/components/EventFlowShell";
import { supabaseAdmin } from "@/lib/supabase";
import type { Event } from "@/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { eventSlug: string };
  searchParams: { session_id?: string };
}

export default async function ThanksPage({ params, searchParams }: PageProps) {
  const { data: event } = await supabaseAdmin
    .from("events")
    .select("title, slug, lecturer_id")
    .eq("slug", params.eventSlug)
    .eq("is_published", true)
    .maybeSingle<Pick<Event, "title" | "slug" | "lecturer_id">>();

  if (!event) {
    notFound();
  }

  const paid = Boolean(searchParams.session_id);

  let lecturerHref: string | null = null;
  if (event.lecturer_id) {
    const { data: lecturer } = await supabaseAdmin
      .from("lecturers")
      .select("slug")
      .eq("id", event.lecturer_id)
      .maybeSingle<{ slug: string }>();
    if (lecturer?.slug) {
      lecturerHref = `/lecturer/${lecturer.slug}`;
    }
  }

  return (
    <EventFlowShell
      eventSlug={params.eventSlug}
      eyebrow={paid ? "Complete" : "Thank you"}
      title={paid ? "お申し込みが完了しました" : "お申し込みありがとうございます"}
      eventTitle={event.title}
      subtitle={
        paid
          ? "お支払いを確認しました。確認メールをお送りしますので、メールボックスをご確認ください。"
          : "ご登録いただいたメールアドレスに、確認メールをお送りしました。"
      }
    >
      <div className="rounded-2xl border border-brand-light/60 bg-white/95 p-8 text-center shadow-card backdrop-blur md:p-10">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-cta-gradient shadow-soft">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <div className="space-y-4 text-left">
          <InfoCard
            step="1"
            title="確認メールをご確認ください"
            body="ご入力いただいたメールアドレス宛に送信しました。届かない場合は迷惑メールフォルダもご確認ください。"
          />
          <InfoCard
            step="2"
            title={
              paid
                ? "領収書メールをお送りします"
                : "お支払い完了後に確定メールをお送りします"
            }
            body={
              paid
                ? "入金確認後、領収書をメールで自動送付します。"
                : "Stripeでのお支払いが完了次第、正式なお申し込み確定のメールをお送りします。"
            }
          />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/${params.eventSlug}`}
            className="inline-flex items-center justify-center rounded-full border border-brand bg-white px-6 py-3 text-sm font-medium text-brand-deep transition hover:bg-brand-pale"
          >
            講座ページへ戻る
          </Link>
          {lecturerHref && (
            <Link
              href={lecturerHref}
              className="inline-flex items-center justify-center rounded-full bg-cta-gradient px-6 py-3 text-sm font-bold text-white shadow-cta transition hover:shadow-cta-hover"
            >
              講師ページを見る
            </Link>
          )}
        </div>
      </div>
    </EventFlowShell>
  );
}

function InfoCard({
  step,
  title,
  body,
}: {
  step: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-4 rounded-xl border border-brand-light/70 bg-brand-pale/40 px-4 py-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
        {step}
      </div>
      <div>
        <h2 className="text-sm font-bold text-ink">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{body}</p>
      </div>
    </div>
  );
}
