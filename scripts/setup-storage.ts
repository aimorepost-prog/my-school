/**
 * Storage バケットを初回作成するワンショットスクリプト
 * 実行: npx tsx scripts/setup-storage.ts
 */
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

async function main() {
  const { ensureStorageBucket } = await import("../lib/ensure-storage-bucket");
  const { getStorageBucket } = await import("../lib/storage");

  const bucket = getStorageBucket();
  console.log(`Storage バケット "${bucket}" を確認中...`);

  const error = await ensureStorageBucket();
  if (error) {
    console.error("失敗:", error);
    process.exit(1);
  }

  console.log(`OK: バケット "${bucket}" の準備ができました`);
}

main();
