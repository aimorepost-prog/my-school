import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import type { Event, EventSession } from "@/types";
import SessionsAdminForm from "./SessionsAdminForm";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function AdminEventSessionsPage({ params }: Props) {
  noStore();

  const { data: event } = await supabaseAdmin
    .from("events")
    .select("id, title")
    .eq("id", params.id)
    .maybeSingle<Pick<Event, "id" | "title">>();

  if (!event) notFound();

  const { data: sessions } = await supabaseAdmin
    .from("event_sessions")
    .select("*")
    .eq("event_id", event.id)
    .order("starts_at", { ascending: true })
    .returns<EventSession[]>();

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <SessionsAdminForm
          eventId={event.id}
          eventTitle={event.title}
          initialSessions={sessions ?? []}
        />
      </div>
    </main>
  );
}
