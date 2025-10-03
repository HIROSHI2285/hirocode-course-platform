-- 検索機能のためのデータベース拡張
-- 実行日: 2025-09-27

-- =====================================================
-- 検索用インデックスの作成
-- =====================================================

-- 講座検索用のGINインデックス
CREATE INDEX IF NOT EXISTS courses_search_idx ON courses
USING gin(to_tsvector('japanese', title || ' ' || COALESCE(description, '')));

-- レッスン検索用のGINインデックス
CREATE INDEX IF NOT EXISTS lessons_search_idx ON lessons
USING gin(to_tsvector('japanese', title || ' ' || COALESCE(description, '')));

-- =====================================================
-- カテゴリテーブルの作成
-- =====================================================

-- カテゴリテーブル
CREATE TABLE IF NOT EXISTS course_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 講座カテゴリの関連テーブル
CREATE TABLE IF NOT EXISTS course_category_relations (
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  category_id UUID REFERENCES course_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, category_id)
);

-- =====================================================
-- RLS設定
-- =====================================================

-- カテゴリテーブル（公開読み取り）
ALTER TABLE course_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "カテゴリは誰でも閲覧可能" ON course_categories;

CREATE POLICY "カテゴリは誰でも閲覧可能" ON course_categories
  FOR SELECT USING (true);

-- 講座カテゴリ関連テーブル（公開読み取り）
ALTER TABLE course_category_relations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "講座カテゴリ関連は誰でも閲覧可能" ON course_category_relations;

CREATE POLICY "講座カテゴリ関連は誰でも閲覧可能" ON course_category_relations
  FOR SELECT USING (true);

-- =====================================================
-- 初期カテゴリデータの投入
-- =====================================================

INSERT INTO course_categories (name, slug, description) VALUES
  ('プログラミング基礎', 'programming-basics', 'プログラミングの基礎を学ぶ講座'),
  ('Web開発', 'web-development', 'WebアプリケーションやWebサイト開発'),
  ('AI・機械学習', 'ai-ml', '人工知能と機械学習の技術'),
  ('データベース', 'database', 'データベース設計と管理'),
  ('フロントエンド', 'frontend', 'フロントエンド開発技術')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- サンプル講座にカテゴリを割り当て
-- =====================================================

-- Next.js講座をWeb開発カテゴリに
INSERT INTO course_category_relations (course_id, category_id)
SELECT
  '00000000-0000-0000-0000-000000000001',
  id
FROM course_categories
WHERE slug = 'web-development'
ON CONFLICT DO NOTHING;

-- TypeScript講座をプログラミング基礎カテゴリに
INSERT INTO course_category_relations (course_id, category_id)
SELECT
  '00000000-0000-0000-0000-000000000002',
  id
FROM course_categories
WHERE slug = 'programming-basics'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 完了メッセージ
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ 検索機能のデータベース拡張が完了しました！';
    RAISE NOTICE '🔍 検索用GINインデックスが作成されました';
    RAISE NOTICE '🏷️  カテゴリテーブルとリレーションテーブルが作成されました';
    RAISE NOTICE '📝 初期カテゴリデータが投入されました';
END $$;