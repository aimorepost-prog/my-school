import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import type { Contact } from "@/types";
import ContactStatusForm from "./ContactStatusForm";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

function formatJpDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate()
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

export default async function AdminContactDetailPage({ params }: Props) {
  noStore();

  const { data: contact } = await supabaseAdmin
    .from("contacts")
    .select("*")
    .eq("id", params.id)
    .maybeSingle<Contact>();

  if (!contact) notFound();

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link
          href="/admin/contacts"
          className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <span aria-hidden>←</span> 一覧に戻る
        </Link>

        <div className="rounded-xl bg-white p-8 shadow-sm">
          <div className="mb-6 border-b border-slate-200 pb-6">
            <p className="mb-2 text-xs text-slate-500">
              受信日時: {formatJpDate(contact.created_at)}
            </p>
            <h1 className="text-xl font-bold text-slate-900 md:text-2xl">
              {contact.subject}
            </h1>
          </div>

          <dl className="mb-6 space-y-3 text-sm">
            <Row label="お名前" value={contact.name} />
            <Row
              label="メールアドレス"
              value={
                <a
                  href={`mailto:${contact.email}`}
                  className="text-sky-700 underline underline-offset-2"
                >
                  {contact.email}
                </a>
              }
            />
            {contact.phone && <Row label="電話番号" value={contact.phone} />}
          </dl>

          <div className="mb-8">
            <p className="mb-2 text-xs font-medium text-slate-500">
              お問い合わせ内容
            </p>
            <div className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-relaxed text-slate-800">
              {contact.message}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-5">
            <h2 className="mb-3 text-sm font-bold text-slate-700">
              対応状況
            </h2>
            <ContactStatusForm
              contactId={contact.id}
              initialStatus={contact.status}
              initialAdminNote={contact.admin_note ?? ""}
            />
          </div>

          {(contact.user_agent || contact.ip_address) && (
            <details className="mt-6 text-xs text-slate-500">
              <summary className="cursor-pointer hover:text-slate-700">
                送信情報（デバッグ用）
              </summary>
              <div className="mt-2 space-y-1 rounded-lg bg-slate-50 px-4 py-3">
                {contact.ip_address && <div>IP: {contact.ip_address}</div>}
                {contact.user_agent && (
                  <div className="break-all">UA: {contact.user_agent}</div>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    </main>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <dt className="w-32 shrink-0 text-slate-500">{label}</dt>
      <dd className="flex-1 text-slate-900">{value}</dd>
    </div>
  );
}
