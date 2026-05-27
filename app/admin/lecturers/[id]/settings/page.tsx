import { notFound } from "next/navigation";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import type { Lecturer } from "@/types";
import LecturerSettingsForm from "./LecturerSettingsForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function LecturerSettingsPage({ params }: PageProps) {
  noStore();

  const { data: lecturer } = await supabaseAdmin
    .from("lecturers")
    .select("*")
    .eq("id", params.id)
    .maybeSingle<Lecturer>();

  if (!lecturer) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link
          href="/admin"
          className="mb-4 inline-block text-sm text-slate-500 hover:text-slate-700"
        >
          ← 管理画面に戻る
        </Link>

        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-slate-900 md:text-3xl">
              講師紹介の編集
            </h1>
            <p className="text-sm text-slate-500">
              {lecturer.name} / slug: <code>{lecturer.slug}</code>
            </p>
          </div>
          <Link
            href={`/lecturer/${lecturer.slug}`}
            target="_blank"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            公開ページを見る
          </Link>
        </div>

        <LecturerSettingsForm initialLecturer={lecturer} />
      </div>
    </main>
  );
}
