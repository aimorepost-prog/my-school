-- ============================================================
-- 06_receipt_issuer.sql
-- 領収書の発行元名を講師・講座ごとに設定できるようにする
--
-- Supabase ダッシュボード > SQL Editor で実行
-- ============================================================

ALTER TABLE lecturers
  ADD COLUMN IF NOT EXISTS receipt_issuer_name TEXT;
-- 例: My Stage　神谷京花

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS receipt_issuer_name TEXT;
-- 講座ごとに上書きしたい場合のみ設定（空なら講師の設定を使用）

-- 今回の設定例（サンプル講師に反映）
UPDATE lecturers
SET receipt_issuer_name = 'My Stage　神谷京花'
WHERE slug = 'sample-lecturer';
