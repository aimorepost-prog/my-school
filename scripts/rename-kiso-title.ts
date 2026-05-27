/**
 * 基礎講座のタイトルを統一感ある短いものに更新
 * 実行: npx tsx scripts/rename-kiso-title.ts
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

loadEnvLocal();

async function main() {
  const { supabaseAdmin } = await import("../lib/supabase");
  const newTitle = "思考の学校　基礎講座「３時間で思考の扱い方を学ぶ」";

  const { error } = await supabaseAdmin
    .from("events")
    .update({ title: newTitle })
    .eq("slug", "kiso-koza");

  if (error) throw error;
  console.log(`OK: kiso-koza title -> ${newTitle}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
