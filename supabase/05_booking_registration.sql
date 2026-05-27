-- ============================================================
-- 05_booking_registration.sql
-- 申込フォーム拡張：領収書・紹介者・質問回答
--
-- Supabase ダッシュボード > SQL Editor で実行
-- ============================================================

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS receipt_name TEXT;
-- 領収書の宛名（空の場合は申込者名を使用）

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS referrer TEXT;
-- ご紹介者（任意・複数名可）

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '{}'::jsonb;
-- 申込時の質問回答
-- {
--   "enrollment_reason": "メルマガ",
--   "past_courses": ["ない　初めて"],
--   "medical_acknowledged": true
-- }

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS receipt_issued_at TIMESTAMPTZ;
-- 領収書発行日時（入金完了時に自動設定）

CREATE INDEX IF NOT EXISTS idx_bookings_receipt_issued
  ON bookings(receipt_issued_at)
  WHERE receipt_issued_at IS NOT NULL;
