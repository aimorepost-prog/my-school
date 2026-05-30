import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import type { Event, Booking, Lecturer } from "@/types";

export const dynamic = "force-dynamic";

function formatJpDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate()
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

interface EventStats extends Event {
  total_bookings: number;
  paid_bookings: number;
  revenue: number;
}

async function getEventStats(): Promise<EventStats[]> {
  const { data: events } = await supabaseAdmin
    .from("events")
    .select("*")
    .order("event_date", { ascending: false });

  if (!events) return [];

  const { data: bookings } = await supabaseAdmin
    .from("bookings")
    .select("event_id, payment_status");

  return (events as Event[]).map((e) => {
    const eventBookings = (bookings as Booking[] | null)?.filter(
      (b) => b.event_id === e.id
    ) ?? [];
    const paid = eventBookings.filter((b) => b.payment_status === "paid").length;
    return {
      ...e,
      total_bookings: eventBookings.length,
      paid_bookings: paid,
      revenue: paid * e.price,
    };
  });
}

export default async function AdminPage() {
  noStore();

  const events = await getEventStats();

  const { data: lecturers } = await supabaseAdmin
    .from("lecturers")
    .select("id, name, slug, receipt_issuer_name")
    .order("name", { ascending: true })
    .returns<Pick<Lecturer, "id" | "name" | "slug" | "receipt_issuer_name">[]>();

  const lecturerList = lecturers ?? [];

  const { count: newContactCount } = await supabaseAdmin
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .eq("status", "new");

  const totalRevenue = events.reduce((acc, e) => acc + e.revenue, 0);
  const totalPaid = events.reduce((acc, e) => acc + e.paid_bookings, 0);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            管理画面
          </h1>
          <div className="text-right">
            <div className="text-xs text-slate-500">総売上 / 総入金件数</div>
            <div className="text-lg font-bold text-slate-900">
              ¥{totalRevenue.toLocaleString()}{" "}
              <span className="text-sm text-slate-500">/ {totalPaid}件</span>
            </div>
          </div>
        </div>

        {(newContactCount ?? 0) > 0 && (
          <Link
            href="/admin/contacts"
            className="mb-8 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800 transition hover:bg-rose-100"
          >
            <span>
              <strong>未対応のお問い合わせが {newContactCount} 件</strong>
              あります
            </span>
            <span className="font-medium">確認する →</span>
          </Link>
        )}

        {lecturerList.length > 0 && (
          <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-bold text-slate-900">
              講師紹介・領収書設定
            </h2>
            <p className="mb-4 text-sm text-slate-500">
              講師紹介ページの内容と、領収書の発行元名を編集できます。
            </p>
            <div className="space-y-3">
              {lecturerList.map((l) => (
                <div
                  key={l.id}
                  className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="text-base font-bold text-slate-900">
                      {l.name}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      slug: <code>{l.slug}</code>
                    </div>
                    {l.receipt_issuer_name && (
                      <div className="mt-1 text-sm text-slate-600">
                        領収書発行元：{l.receipt_issuer_name}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/lecturers/${l.id}/settings`}
                      className="inline-flex shrink-0 items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
                    >
                      講師紹介を編集
                    </Link>
                    <Link
                      href={`/lecturer/${l.slug}`}
                      target="_blank"
                      className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                      ページを見る
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {events.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-slate-500">
            まだイベントがありません。Supabase からイベントを追加してください。
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((e) => (
              <div
                key={e.id}
                className="bg-white rounded-xl shadow-sm p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold text-slate-900 truncate">
                      {e.title}
                    </h2>
                    {!e.is_published && (
                      <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                        非公開
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500">
                    {formatJpDate(e.event_date)} ・ slug:{" "}
                    <code className="text-xs">{e.slug}</code>
                  </div>
                  <div className="mt-3 flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-slate-500">予約: </span>
                      <span className="font-bold text-slate-900">
                        {e.paid_bookings}
                        <span className="text-slate-400">
                          {" "}
                          / {e.total_bookings}
                        </span>
                        {e.capacity && (
                          <span className="text-slate-400">
                            {" "}
                            (定員 {e.capacity})
                          </span>
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">売上: </span>
                      <span className="font-bold text-slate-900">
                        ¥{e.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/events/${e.id}/sessions`}
                    className="text-sm bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg"
                  >
                    日程管理
                  </Link>
                  <Link
                    href={`/admin/events/${e.id}/lp`}
                    className="text-sm bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg"
                  >
                    LP編集
                  </Link>
                  <Link
                    href={`/admin/events/${e.id}/settings`}
                    className="text-sm bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg"
                  >
                    メール設定
                  </Link>
                  <Link
                    href="/admin/export"
                    className="text-sm bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg"
                  >
                    リスト出力
                  </Link>
                  <a
                    href={`/api/export?event_id=${e.id}`}
                    className="text-sm bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg"
                  >
                    CSV（全件）
                  </a>
                  <Link
                    href={`/${e.slug}`}
                    target="_blank"
                    className="text-sm bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg"
                  >
                    LPを開く
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
