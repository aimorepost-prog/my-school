/**
 * contacts テーブルを Supabase に作成
 * 実行: npx tsx scripts/apply-contacts-table.ts
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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Supabase の環境変数が設定されていません");
  }

  const sql = readFileSync(
    resolve(process.cwd(), "supabase", "09_contacts.sql"),
    "utf8"
  );

  // Supabase の SQL Editor 相当の API（PostgREST 経由では DDL はできないため、
  // ここでは案内のみ出力する）
  console.log("==============================================");
  console.log("以下の SQL を Supabase の SQL Editor で実行してください:");
  console.log("https://supabase.com/dashboard → プロジェクト選択 → SQL Editor → New query");
  console.log("==============================================");
  console.log("");
  console.log(sql);
  console.log("");
  console.log("==============================================");
  console.log("実行後、ブラウザから /contact にアクセスして動作確認してください");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
