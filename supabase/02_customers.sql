-- ============================================================
-- 顧客管理機能の追加マイグレーション
-- Supabase の SQL Editor で実行してください
-- ============================================================

-- 顧客テーブル
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  total_spent INTEGER DEFAULT 0,         -- 累計購入金額（円）
  total_events INTEGER DEFAULT 0,        -- 累計参加イベント数
  last_purchase_at TIMESTAMPTZ,          -- 最終購入日時
  note TEXT,                             -- 自由記述メモ
  tags TEXT[] DEFAULT '{}',              -- タグ配列（VIP, 休眠, 要フォロー など）
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- bookings に customer_id を追加（既存予約は後で紐付け）
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

-- インデックス
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_last_purchase ON customers(last_purchase_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);

-- ============================================================
-- 既存予約データの移行
-- 既に登録されている bookings から customers を生成し、customer_id を紐付け
-- ============================================================

-- 1. 既存予約からユニークな顧客を作成
INSERT INTO customers (email, name, phone, created_at)
SELECT DISTINCT ON (email)
  email,
  name,
  phone,
  MIN(created_at) OVER (PARTITION BY email)
FROM bookings
WHERE email IS NOT NULL
ON CONFLICT (email) DO NOTHING;

-- 2. bookings に customer_id を紐付け
UPDATE bookings b
SET customer_id = c.id
FROM customers c
WHERE b.email = c.email
  AND b.customer_id IS NULL;

-- 3. 既存の paid 予約から、各顧客の累計金額を計算
UPDATE customers c
SET
  total_spent = COALESCE(stats.total_spent, 0),
  total_events = COALESCE(stats.total_events, 0),
  last_purchase_at = stats.last_purchase_at
FROM (
  SELECT
    b.customer_id,
    SUM(e.price) AS total_spent,
    COUNT(*) AS total_events,
    MAX(b.created_at) AS last_purchase_at
  FROM bookings b
  JOIN events e ON e.id = b.event_id
  WHERE b.payment_status = 'paid'
    AND b.customer_id IS NOT NULL
  GROUP BY b.customer_id
) AS stats
WHERE c.id = stats.customer_id;

-- ============================================================
-- updated_at 自動更新トリガー
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_customers_updated_at ON customers;
CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
