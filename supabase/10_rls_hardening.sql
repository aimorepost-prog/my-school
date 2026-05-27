-- ============================================================
-- RLS（Row Level Security）強化
--
-- 目的：anon キーを知られた場合でも、個人情報を含むテーブルへの
--       不正アクセスを防止する。
--
-- 設計：
--   - events / lecturers       … 公開情報 → anon 読み取り可（is_published のみ）
--   - bookings / customers     … 個人情報 → anon 読み書きすべて禁止
--   - contacts                 … フォームから書き込みのみ可、読み取り禁止
--   - email_settings/logs      … 内部用 → anon 全アクセス禁止
--
--   アプリ側は SUPABASE_SERVICE_ROLE_KEY を使用しており、
--   service_role は RLS をバイパスするため、管理画面の動作には影響しない。
-- ============================================================

-- ----------------------------------------
-- 1. events（講座）
-- ----------------------------------------
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_select_anon_published" ON events;
CREATE POLICY "events_select_anon_published"
  ON events FOR SELECT
  TO anon
  USING (is_published = true);

-- 既存の anon 書き込みポリシーがあれば削除
DROP POLICY IF EXISTS "events_insert_anon" ON events;
DROP POLICY IF EXISTS "events_update_anon" ON events;
DROP POLICY IF EXISTS "events_delete_anon" ON events;

-- ----------------------------------------
-- 2. lecturers（講師）
-- ----------------------------------------
ALTER TABLE lecturers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lecturers_select_anon_published" ON lecturers;
CREATE POLICY "lecturers_select_anon_published"
  ON lecturers FOR SELECT
  TO anon
  USING (is_published = true);

DROP POLICY IF EXISTS "lecturers_insert_anon" ON lecturers;
DROP POLICY IF EXISTS "lecturers_update_anon" ON lecturers;
DROP POLICY IF EXISTS "lecturers_delete_anon" ON lecturers;

-- ----------------------------------------
-- 3. bookings（予約・個人情報を含む）
-- ----------------------------------------
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 既存ポリシーをクリーンに削除（anon の読み書き全面禁止）
DROP POLICY IF EXISTS "bookings_select_anon" ON bookings;
DROP POLICY IF EXISTS "bookings_insert_anon" ON bookings;
DROP POLICY IF EXISTS "bookings_update_anon" ON bookings;
DROP POLICY IF EXISTS "bookings_delete_anon" ON bookings;

-- ※ アプリ側は service_role キーで API 経由で書き込んでいるため、
--    anon ポリシーは作らない。

-- ----------------------------------------
-- 4. customers（顧客・個人情報を含む）
-- ----------------------------------------
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customers_select_anon" ON customers;
DROP POLICY IF EXISTS "customers_insert_anon" ON customers;
DROP POLICY IF EXISTS "customers_update_anon" ON customers;
DROP POLICY IF EXISTS "customers_delete_anon" ON customers;

-- ----------------------------------------
-- 5. contacts（お問い合わせ）
-- 既に 09_contacts.sql で設定済みだが念のため再確認
-- ----------------------------------------
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contacts_select_anon" ON contacts;
DROP POLICY IF EXISTS "contacts_update_anon" ON contacts;
DROP POLICY IF EXISTS "contacts_delete_anon" ON contacts;

DROP POLICY IF EXISTS "contacts_insert_anon" ON contacts;
CREATE POLICY "contacts_insert_anon"
  ON contacts FOR INSERT
  TO anon
  WITH CHECK (true);

-- ----------------------------------------
-- 6. email_settings（メール設定・内部用）
-- ----------------------------------------
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_settings_select_anon" ON email_settings;
DROP POLICY IF EXISTS "email_settings_insert_anon" ON email_settings;
DROP POLICY IF EXISTS "email_settings_update_anon" ON email_settings;
DROP POLICY IF EXISTS "email_settings_delete_anon" ON email_settings;

-- ----------------------------------------
-- 7. email_logs（メール送信ログ・内部用）
-- ----------------------------------------
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_logs_select_anon" ON email_logs;
DROP POLICY IF EXISTS "email_logs_insert_anon" ON email_logs;
DROP POLICY IF EXISTS "email_logs_update_anon" ON email_logs;
DROP POLICY IF EXISTS "email_logs_delete_anon" ON email_logs;

-- ----------------------------------------
-- 8. event_sessions（開催日程・公開情報のみ読み取り可）
-- ----------------------------------------
ALTER TABLE event_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "event_sessions_select_anon_published" ON event_sessions;
CREATE POLICY "event_sessions_select_anon_published"
  ON event_sessions FOR SELECT
  TO anon
  USING (is_published = true);

DROP POLICY IF EXISTS "event_sessions_insert_anon" ON event_sessions;
DROP POLICY IF EXISTS "event_sessions_update_anon" ON event_sessions;
DROP POLICY IF EXISTS "event_sessions_delete_anon" ON event_sessions;

-- ============================================================
-- 確認用クエリ（実行時の出力は無視してOK）
-- 各テーブルの RLS 有効化状況を確認したい場合は下記を実行：
--
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
-- ============================================================
