-- ============================================================
-- お問い合わせ（contacts）テーブル
-- 申込以外のお問い合わせ（質問・相談など）の受付・管理用
-- ============================================================

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new', -- new / in_progress / done
  admin_note TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts (status);

-- ============================================================
-- RLS（Row Level Security）
-- 匿名ユーザーからの読み取りはブロック。書き込みのみ許可（フォーム送信）
-- 管理画面側は service_role キーで操作するため RLS の影響を受けない
-- ============================================================

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contacts_insert_anon" ON contacts;
CREATE POLICY "contacts_insert_anon"
  ON contacts FOR INSERT
  TO anon
  WITH CHECK (true);
