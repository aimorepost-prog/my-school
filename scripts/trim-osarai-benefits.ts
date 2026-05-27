/**
 * おさらい会の benefits を3件に更新
 * 実行: npx tsx scripts/trim-osarai-benefits.ts
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

const benefits = [
  {
    title: "思考の仕組みをやさしく再確認",
    description: "今の現実の見方が変わります",
  },
  {
    title: "ワークの解決策を得られる",
    description: "いき詰まっている理由がわかります",
  },
  {
    title: "他の受講生の話から深い気づき",
    description: "潜在意識の声を聞く時間になります",
  },
];

async function main() {
  const { supabaseAdmin } = await import("../lib/supabase");
  const { error } = await supabaseAdmin
    .from("events")
    .update({ benefits })
    .eq("slug", "osarai-kai");

  if (error) throw error;
  console.log("OK: おさらい会の benefits を3件に更新しました");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
