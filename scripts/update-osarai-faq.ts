/**
 * おさらい会の参加費 FAQ を二段階料金向けに更新
 * 実行: npx tsx scripts/update-osarai-faq.ts
 */
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!process.env[key]) process.env[key] = trimmed.slice(eq + 1).trim();
  }
}

const NEW_ANSWER =
  "基礎講座受講済の方 1,650円、体験講座受講済の方 2,200円です。お申し込みフォームで該当する区分をお選びください。";

async function main() {
  loadEnvLocal();
  const { supabaseAdmin } = await import("../lib/supabase");

  const { data, error } = await supabaseAdmin
    .from("events")
    .select("faqs")
    .eq("slug", "osarai-kai")
    .single();

  if (error) throw error;

  const faqs = (data?.faqs ?? []).map(
    (f: { q?: string; a?: string }) =>
      f.q?.includes("参加費") ? { q: f.q, a: NEW_ANSWER } : f
  );

  const { error: uerr } = await supabaseAdmin
    .from("events")
    .update({ faqs })
    .eq("slug", "osarai-kai");

  if (uerr) throw uerr;
  console.log("OK: おさらい会の参加費 FAQ を更新しました");
  console.log(JSON.stringify(faqs, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
