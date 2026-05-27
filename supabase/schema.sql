-- ============================================================
-- 講師向け予約販売システム DBスキーマ
-- Supabase ダッシュボード > SQL Editor で実行してください
-- ============================================================

-- イベント
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  capacity INTEGER,
  image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 予約
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  payment_status TEXT DEFAULT 'pending',
  -- pending / paid / cancelled
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- メール設定
CREATE TABLE IF NOT EXISTS email_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE UNIQUE,
  dunning_enabled BOOLEAN DEFAULT false,
  dunning_1st_days INTEGER DEFAULT 3,
  dunning_2nd_days INTEGER DEFAULT 7,
  reminder_1_enabled BOOLEAN DEFAULT false,
  reminder_1_timing INTEGER,
  -- 分単位（例：1440=1日前、180=3時間前）
  reminder_2_enabled BOOLEAN DEFAULT false,
  reminder_2_timing INTEGER
);

-- メール送信ログ（二重送信防止）
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  mail_type TEXT NOT NULL,
  -- 'confirm_pending' / 'confirm_paid'
  -- 'dunning_1' / 'dunning_2'
  -- 'reminder_1' / 'reminder_2'
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- インデックス（パフォーマンス向上）
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_email_logs_booking_id ON email_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_unique ON email_logs(booking_id, mail_type);

-- ============================================================
-- サンプルデータ（動作確認用、不要なら削除可）
-- ============================================================
-- INSERT INTO events (slug, title, description, price, event_date, capacity, is_published)
-- VALUES (
--   'sample-event',
--   'サンプルイベント',
--   'これはサンプルイベントです。\n改行も対応しています。',
--   5000,
--   NOW() + INTERVAL '14 days',
--   30,
--   true
-- );
