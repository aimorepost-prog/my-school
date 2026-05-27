import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import type { Contact, ContactStatus } from "@/types";

export const dynamic = "force-dynamic";

function formatJpDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate()
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

const STATUS_LABEL: Record<ContactStatus, string> = {
  new: "未対応",
  in_progress: "対応中",
  done: "完了",
};

const STATUS_STYLE: Record<ContactStatus, string> = {
  new: "bg-rose-100 text-rose-700",
  in_progress: "bg-amber-100 text-amber-700",
  done: "bg-emerald-100 text-emerald-700",
};

export default async function AdminContactsPage() {
  noStore();

  const { data, error } = await supabaseAdmin
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Contact[]>();

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-5xl rounded-xl bg-white p-8 shadow-sm">
          <h1 className="mb-3 text-xl font-bold text-slate-900">お問い合わせ</h1>
          <p className="text-sm text-rose-600">読み込みに失敗しました: {error.message}</p>
        </div>
      </main>
    );
  }

  const contacts = data ?? [];
  const counts = {
    new: contacts.filter((c) => c.status === "new").length,
    in_progress: contacts.filter((c) => c.status === "in_progress").length,
    done: contacts.filter((c) => c.status === "done").length,
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            お問い合わせ
          </h1>
          <div className="flex gap-2 text-xs">
            <span className={`rounded-full px-3 py-1 font-bold ${STATUS_STYLE.new}`}>
              未対応 {counts.new}
            </span>
            <span className={`rounded-full px-3 py-1 font-bold ${STATUS_STYLE.in_progress}`}>
              対応中 {counts.in_progress}
            </span>
            <span className={`rounded-full px-3 py-1 font-bold ${STATUS_STYLE.done}`}>
              完了 {counts.done}
            </span>
          </div>
        </div>

        {contacts.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
            まだお問い合わせはありません。
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">状態</th>
                  <th className="px-4 py-3 text-left font-medium">受信日時</th>
                  <th className="px-4 py-3 text-left font-medium">お名前</th>
                  <th className="px-4 py-3 text-left font-medium">件名</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLE[c.status]}`}
                      >
                        {STATUS_LABEL[c.status]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatJpDate(c.created_at)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {c.name}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-slate-700">
                      {c.subject}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/contacts/${c.id}`}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        詳細
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
