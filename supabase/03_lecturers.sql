-- ============================================================
-- 03_lecturers.sql
--
-- 講師（lecturers）テーブルを新規追加し、
-- events に lecturer_id および LP表示用カラムを追加する
--
-- 実行方法：Supabase ダッシュボード > SQL Editor で全文コピペ実行
-- ============================================================

-- ----------------------------------------
-- 1. lecturers テーブル
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS lecturers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  -- /lecturer/[slug] のURL用（例: 'tanaka-sakura'）

  name TEXT NOT NULL,
  -- 表示名（例: '田中 さくら'）

  title TEXT,
  -- 肩書（例: '思考の学校 認定講師'）

  catch_copy TEXT,
  -- ヒーロー部分のキャッチコピー

  bio TEXT,
  -- 自己紹介・想い（長文・改行可）

  achievements JSONB DEFAULT '[]'::jsonb,
  -- 経歴・実績の配列（["講師歴10年", "受講生1,000名突破", ...]）

  image_url TEXT,
  -- 講師写真URL（顔写真）

  hero_image_url TEXT,
  -- ヒーロー背景画像URL（任意）

  message TEXT,
  -- 講師から受講生へのメッセージ（任意）

  social_links JSONB DEFAULT '{}'::jsonb,
  -- SNSリンク（{ "instagram": "...", "twitter": "...", "youtube": "...", "website": "..." }）

  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------
-- 2. events に lecturer_id を追加
-- ----------------------------------------
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS lecturer_id UUID REFERENCES lecturers(id) ON DELETE SET NULL;

-- ----------------------------------------
-- 3. events に LP用カラムを追加
-- ----------------------------------------
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS catch_copy TEXT;
-- ヒーローのキャッチコピー（例: '心が軽くなる、新しい思考のヒント'）

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS subtitle TEXT;
-- サブタイトル（任意）

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS location_text TEXT;
-- 開催形式・場所の説明（例: 'オンライン開催（Zoom）' / '東京都渋谷区...'）

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS duration_text TEXT;
-- 所要時間の説明（例: '120分（休憩込み）'）

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS benefits JSONB DEFAULT '[]'::jsonb;
-- 得られるもの: [{ "title": "気づきが得られる", "description": "..." }, ...]

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '[]'::jsonb;
-- 当日スケジュール: [{ "time": "10:00", "title": "受付開始", "description": "..." }, ...]

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS target_audience JSONB DEFAULT '[]'::jsonb;
-- こんな方におすすめ: ["心がモヤモヤする方", "...", ...]

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]'::jsonb;
-- よくある質問: [{ "q": "...", "a": "..." }, ...]

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS notes TEXT;
-- 注意事項（キャンセルポリシー等、改行可）

-- ----------------------------------------
-- 4. インデックス
-- ----------------------------------------
CREATE INDEX IF NOT EXISTS idx_lecturers_slug ON lecturers(slug);
CREATE INDEX IF NOT EXISTS idx_lecturers_published ON lecturers(is_published);
CREATE INDEX IF NOT EXISTS idx_events_lecturer_id ON events(lecturer_id);

-- ----------------------------------------
-- 5. updated_at 自動更新トリガー（lecturers）
-- ----------------------------------------
CREATE OR REPLACE FUNCTION set_lecturers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lecturers_updated_at ON lecturers;
CREATE TRIGGER trg_lecturers_updated_at
  BEFORE UPDATE ON lecturers
  FOR EACH ROW
  EXECUTE FUNCTION set_lecturers_updated_at();
