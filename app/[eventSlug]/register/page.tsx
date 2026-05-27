import { notFound } from "next/navigation";
import EventFlowShell from "@/components/EventFlowShell";
import SessionSchedule from "@/components/SessionSchedule";
import { getEventPriceOptions, formatPriceRange } from "@/lib/event-pricing";
import {
  filterOpenSessions,
  formatSessionRange,
  isSessionRegistrationOpen,
} from "@/lib/event-sessions";
import { supabaseAdmin } from "@/lib/supabase";
import type { Event, EventSession } from "@/types";
import RegisterForm from "./RegisterForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { eventSlug: string };
  searchParams: { canceled?: string; session?: string };
}

export default async function RegisterPage({
  params,
  searchParams,
}: PageProps) {
  const { data: event } = await supabaseAdmin
    .from("events")
    .select("id, title, price, is_published")
    .eq("slug", params.eventSlug)
    .eq("is_published", true)
    .maybeSingle<Pick<Event, "id" | "title" | "price" | "is_published">>();

  if (!event) {
    notFound();
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
  const canceled = searchParams.canceled === "1";
  const sessionId = searchParams.session?.trim() ?? "";

  let selectedSession: EventSession | null = null;
  if (sessionId) {
    const found = sessions.find((s) => s.id === sessionId) ?? null;
    if (
      !found ||
      !found.is_published ||
      !isSessionRegistrationOpen(found.starts_at)
    ) {
      return (
        <EventFlowShell
          eventSlug={params.eventSlug}
          eyebrow="Application"
          title="受付終了"
          eventTitle={event.title}
          subtitle="選択された日程は、申込期限（前日23:59）を過ぎているか、存在しません。"
        >
          <div className="rounded-2xl border border-brand-light bg-white p-6 text-center shadow-card md:p-8">
            <p className="mb-6 text-sm leading-relaxed text-ink">
              お手数ですが、別の日程をお選びください。
            </p>
            <SessionSchedule
              eventSlug={params.eventSlug}
              sessions={sessions}
              variant="section"
            />
          </div>
        </EventFlowShell>
      );
    }
    selectedSession = found;
  }

  if (openSessions.length > 0 && !selectedSession) {
    return (
      <EventFlowShell
        eventSlug={params.eventSlug}
        eyebrow="Application"
        title="日程を選んでお申し込み"
        eventTitle={event.title}
        subtitle="ご希望の開催日時を選んでから、お申し込みフォームへ進んでください。"
      >
        <SessionSchedule
          eventSlug={params.eventSlug}
          sessions={sessions}
          variant="section"
        />
      </EventFlowShell>
    );
  }

  const priceOptions = getEventPriceOptions(params.eventSlug);
  const priceSubtitle = priceOptions
    ? `受講費 ${formatPriceRange(priceOptions)}（税込）／該当する区分を選んでお申し込みください。`
    : `受講費 ¥${event.price.toLocaleString()}（税込）／必要事項をご入力のうえ、決済画面へお進みください。`;

  const sessionSubtitle = selectedSession
    ? `選択中の日程：${formatSessionRange(selectedSession.starts_at, selectedSession.ends_at)}`
    : undefined;

  return (
    <EventFlowShell
      eventSlug={params.eventSlug}
      eyebrow="Application"
      title="お申し込みフォーム"
      eventTitle={event.title}
      subtitle={sessionSubtitle ?? priceSubtitle}
    >
      {canceled && (
        <div className="mb-6 rounded-xl border border-accent/40 bg-accent-peach/30 px-4 py-3 text-sm text-ink">
          決済がキャンセルされました。内容をご確認のうえ、再度お申し込みください。
        </div>
      )}

      <RegisterForm
        eventSlug={params.eventSlug}
        priceOptions={priceOptions}
        sessionId={selectedSession?.id ?? null}
        sessionLabel={
          selectedSession
            ? formatSessionRange(
                selectedSession.starts_at,
                selectedSession.ends_at
              )
            : null
        }
      />
    </EventFlowShell>
  );
}
