-- HiroCode Online Course Platform Database Schema
-- データベース作成日: 2025-09-26

-- =====================================================
-- Step 1: 基本テーブルの作成
-- =====================================================

-- 1. ユーザープロフィール（auth.usersテーブルに対する拡張テーブル）
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  avatar_url TEXT,
  google_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. 講座テーブル
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. セクションテーブル
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. レッスンテーブル
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT NOT NULL,
  duration INTEGER, -- 秒単位
  order_index INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. ユーザーレッスン進捗テーブル
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- =====================================================
-- Step 2: インデックスの作成
-- =====================================================

-- パフォーマンス向上のためのインデックス
CREATE INDEX IF NOT EXISTS idx_sections_course_id ON sections(course_id);
CREATE INDEX IF NOT EXISTS idx_sections_order ON sections(course_id, order_index);

CREATE INDEX IF NOT EXISTS idx_lessons_section_id ON lessons(section_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(section_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_free ON lessons(is_free);

CREATE INDEX IF NOT EXISTS idx_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson_id ON user_lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_progress_completed ON user_lesson_progress(completed);

-- =====================================================
-- Step 3: Row Level Security (RLS) ポリシーの設定
-- =====================================================

-- profiles テーブル
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーがある場合は削除
DROP POLICY IF EXISTS "ユーザーは自分のプロフィールのみアクセス可能" ON profiles;

CREATE POLICY "ユーザーは自分のプロフィールのみアクセス可能" ON profiles
  FOR ALL USING (auth.uid() = id);

-- courses テーブル（公開読み取り）
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "講座は誰でも閲覧可能" ON courses;

CREATE POLICY "講座は誰でも閲覧可能" ON courses
  FOR SELECT USING (true);

-- sections テーブル（公開読み取り）
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "セクションは誰でも閲覧可能" ON sections;

CREATE POLICY "セクションは誰でも閲覧可能" ON sections
  FOR SELECT USING (true);

-- lessons テーブル（公開読み取り）
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "レッスンは誰でも閲覧可能" ON lessons;

CREATE POLICY "レッスンは誰でも閲覧可能" ON lessons
  FOR SELECT USING (true);

-- user_lesson_progress テーブル
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ユーザーは自分の進捗のみアクセス可能" ON user_lesson_progress;

CREATE POLICY "ユーザーは自分の進捗のみアクセス可能" ON user_lesson_progress
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- Step 4: トリガー・関数の作成
-- =====================================================

-- 新規ユーザー登録時の自動プロフィール作成関数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, avatar_url, google_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'sub'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーの設定（既存がある場合は削除してから作成）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- updated_at自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_atトリガーの設定
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- =====================================================
-- Step 5: サンプルデータの挿入
-- =====================================================

-- サンプル講座データ
INSERT INTO courses (id, title, description, thumbnail_url) VALUES
('00000000-0000-0000-0000-000000000001', 'Next.js完全攻略講座', 'React開発者のためのNext.jsマスター講座', 'https://example.com/thumbnails/nextjs-course.jpg'),
('00000000-0000-0000-0000-000000000002', 'TypeScript入門講座', 'JavaScript開発者のためのTypeScript基礎講座', 'https://example.com/thumbnails/typescript-course.jpg')
ON CONFLICT (id) DO NOTHING;

-- サンプルセクションデータ
INSERT INTO sections (id, course_id, title, order_index) VALUES
('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', '第1章: 環境構築', 1),
('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', '第2章: 基本概念', 2),
('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000002', '第1章: TypeScript基礎', 1)
ON CONFLICT (id) DO NOTHING;

-- サンプルレッスンデータ
INSERT INTO lessons (id, section_id, title, description, youtube_url, duration, order_index, is_free) VALUES
('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000011', 'Node.jsのインストール', 'Next.js開発に必要なNode.jsをインストールしよう', 'https://youtube.com/watch?v=sample1', 600, 1, true),
('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000011', 'Next.jsプロジェクトの作成', 'create-next-appでプロジェクトを作成しよう', 'https://youtube.com/watch?v=sample2', 480, 2, false),
('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000012', 'App Routerの理解', 'Next.js 13以降のApp Routerを理解しよう', 'https://youtube.com/watch?v=sample3', 720, 1, false),
('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000021', 'TypeScriptとは', 'TypeScriptの基本概念を学ぼう', 'https://youtube.com/watch?v=sample4', 540, 1, true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 完了メッセージ
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ HiroCodeオンライン講座プラットフォームのデータベーススキーマが正常に作成されました！';
    RAISE NOTICE '📊 作成されたテーブル: profiles, courses, sections, lessons, user_lesson_progress';
    RAISE NOTICE '🔒 Row Level Security (RLS) ポリシーが設定されました';
    RAISE NOTICE '⚡ パフォーマンス向上のためのインデックスが作成されました';
    RAISE NOTICE '🔄 自動トリガーが設定されました';
    RAISE NOTICE '📝 サンプルデータが挿入されました';
END $$;