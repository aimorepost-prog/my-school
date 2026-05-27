-- ============================================================
-- 07_storage.sql
-- Supabase Storage: 画像アップロード用バケット
-- Supabase Dashboard > SQL Editor で実行してください
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 公開読み取り（LP・管理画面のプレビュー用）
DROP POLICY IF EXISTS "Public read images" ON storage.objects;
CREATE POLICY "Public read images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');
