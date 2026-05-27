/**
 * RLS 強化 SQL を表示（Supabase SQL Editor で実行）
 * 実行: npx tsx scripts/apply-rls-hardening.ts
 */
import { readFileSync } from "fs";
import { resolve } from "path";

const sql = readFileSync(
  resolve(process.cwd(), "supabase", "10_rls_hardening.sql"),
  "utf8"
);

console.log("==============================================");
console.log("Supabase SQL Editor に貼り付けて RUN してください:");
console.log("==============================================\n");
console.log(sql);
