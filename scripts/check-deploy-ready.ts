/**
 * デプロイ前チェック
 * 実行: npx tsx scripts/check-deploy-ready.ts
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    console.error("❌ .env.local がありません");
    process.exit(1);
  }
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!process.env[key]) process.env[key] = trimmed.slice(eq + 1).trim();
  }
}

const REQUIRED = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "NEXT_PUBLIC_BASE_URL",
  "ADMIN_PASSWORD",
  "CRON_SECRET",
] as const;

const RECOMMENDED = [
  "STRIPE_WEBHOOK_SECRET",
  "ADMIN_NOTIFY_EMAIL",
  "ADMIN_SESSION_SECRET",
  "RECEIPT_ISSUER_NAME",
] as const;

loadEnvLocal();

console.log("=== デプロイ前チェック ===\n");

let ok = true;

for (const key of REQUIRED) {
  const val = process.env[key]?.trim();
  if (!val) {
    console.log(`❌ 必須: ${key} が未設定`);
    ok = false;
  } else {
    console.log(`✅ 必須: ${key}`);
  }
}

console.log("");
for (const key of RECOMMENDED) {
  const val = process.env[key]?.trim();
  if (!val) {
    console.log(`⚠️  推奨: ${key} が未設定`);
  } else {
    console.log(`✅ 推奨: ${key}`);
  }
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
if (baseUrl.includes("localhost")) {
  console.log(
    "\n⚠️  NEXT_PUBLIC_BASE_URL が localhost です。Vercel デプロイ後は本番URLに変更してください。"
  );
}

if (process.env.STRIPE_SECRET_KEY?.startsWith("sk_test")) {
  console.log(
    "\nℹ️  Stripe はテストモードです。本番公開時は sk_live_... に切り替えてください。"
  );
}

if (process.env.RESEND_FROM_EMAIL === "onboarding@resend.dev") {
  console.log(
    "\nℹ️  Resend はサンドボックス送信元です。本番では独自ドメイン認証後に変更してください。"
  );
}

console.log("");
if (ok) {
  console.log("✅ 必須項目はすべて設定されています。npm run build でビルド確認してください。");
} else {
  console.log("❌ 未設定の必須項目があります。.env.local を確認してください。");
  process.exit(1);
}
