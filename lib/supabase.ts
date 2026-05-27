import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Next.js の fetch キャッシュをバイパスして、常に最新データを取得する
const noStoreFetch: typeof fetch = (input, init) =>
  fetch(input as RequestInfo, { ...init, cache: "no-store" });

/**
 * クライアント用 Supabase インスタンス
 * - ブラウザから呼ばれる場合に使用
 * - RLS（Row Level Security）の影響を受ける
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * サーバー用 Supabase インスタンス
 * - service_role キーを使用するため RLS をバイパスする
 * - 必ずサーバーサイド（API Route, Server Component）でのみ使用すること
 * - Next.js の fetch キャッシュをバイパスし、常に最新データを取得
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    fetch: noStoreFetch,
  },
});
