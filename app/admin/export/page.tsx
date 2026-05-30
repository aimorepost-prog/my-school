import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import ExportBookingsForm from "./ExportBookingsForm";
import type { Event, EventSession } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminExportPage() {
  noStore();

  const [{ data: events }, { data: sessions }] = await Promise.all([
    supabaseAdmin
      .from("events")
      .select("id, title, slug")
      .order("title", { ascending: true }),
    supabaseAdmin
      .from("event_sessions")
      .select("id, event_id, starts_at, ends_at")
      .order("starts_at", { ascending: true }),
  ]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-sm text-slate-500 hover:text-slate-800"
          >
            ← 管理画面に戻る
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            申込者リスト出力
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            講座・開催月・日程で絞り込んで CSV をダウンロードできます。
            受講者一覧は同じメールアドレスの申込を1行にまとめます。
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
          <ExportBookingsForm
            events={(events ?? []) as Pick<Event, "id" | "title" | "slug">[]}
            sessions={
              (sessions ?? []) as Pick<
                EventSession,
                "id" | "event_id" | "starts_at" | "ends_at"
              >[]
            }
          />
        </div>
      </div>
    </main>
  );
}
