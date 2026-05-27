import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import type { Event } from "@/types";
import LpEditForm from "./LpEditForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function LpEditPage({ params }: PageProps) {
  const { data: event } = await supabaseAdmin
    .from("events")
    .select("*")
    .eq("id", params.id)
    .maybeSingle<Event>();

  if (!event) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <Link
          href="/admin"
          className="mb-4 inline-block text-sm text-slate-500 hover:text-slate-700"
        >
          ← 管理画面に戻る
        </Link>

        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              LP編集
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {event.title} / slug: <code>{event.slug}</code>
            </p>
          </div>

          <Link
            href={`/${event.slug}`}
            target="_blank"
            className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark"
          >
            LPを確認
          </Link>
        </div>

        <LpEditForm initialEvent={event} />
      </div>
    </main>
  );
}
