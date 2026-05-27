import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import type { Event, EmailSettings } from "@/types";
import EmailSettingsForm from "./EmailSettingsForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function EmailSettingsPage({ params }: PageProps) {
  const { data: event } = await supabaseAdmin
    .from("events")
    .select("*")
    .eq("id", params.id)
    .maybeSingle<Event>();

  if (!event) {
    notFound();
  }

  const { data: settings } = await supabaseAdmin
    .from("email_settings")
    .select("*")
    .eq("event_id", params.id)
    .maybeSingle<EmailSettings>();

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/admin"
          className="text-sm text-slate-500 hover:text-slate-700 mb-4 inline-block"
        >
          ← 管理画面に戻る
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          メール設定
        </h1>
        <p className="text-sm text-slate-500 mb-8">{event.title}</p>

        <EmailSettingsForm
          eventId={event.id}
          initialSettings={settings}
        />
      </div>
    </main>
  );
}
