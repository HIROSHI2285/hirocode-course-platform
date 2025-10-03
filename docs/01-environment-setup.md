# 01. 環境セットアップ

## 概要
HiroCodeオンライン講座プラットフォームの開発環境を構築し、必要なサービスとの連携設定を行う。

## 優先度
**高（Phase 1 - MVP Core）**

## 関連技術
- Next.js 15 (App Router)
- Supabase
- Google Cloud Console
- Vercel

## 作業内容

### Supabaseプロジェクト設定
- [ ] Supabaseプロジェクトの作成
- [ ] 環境変数の設定（`.env.local`）
- [ ] データベーステーブルの作成
- [ ] RLS（Row Level Security）の設定
- [ ] Google OAuth認証の設定

### Google Cloud Console設定
- [ ] Google Cloud Projectの作成
- [ ] OAuth 2.0認証情報の作成
- [ ] 承認済みリダイレクトURIの設定
  - 開発環境: `http://localhost:3000/auth/callback`
  - 本番環境: `https://yourdomain.com/auth/callback`

### Vercelデプロイ設定
- [ ] Vercelプロジェクトの作成
- [ ] 環境変数の設定
- [ ] デプロイメント設定の確認

## データベーステーブル作成

### profiles（ユーザープロフィール）
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  google_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS設定
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ユーザーは自分のプロフィールのみアクセス可能" ON profiles
  FOR ALL USING (auth.uid() = id);
```

### courses（講座）
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 公開読み取り許可
CREATE POLICY "講座は誰でも閲覧可能" ON courses
  FOR SELECT USING (true);
```

### sections（セクション）
```sql
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 公開読み取り許可
CREATE POLICY "セクションは誰でも閲覧可能" ON sections
  FOR SELECT USING (true);
```

### lessons（レッスン）
```sql
CREATE TABLE lessons (
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

-- 公開読み取り許可
CREATE POLICY "レッスンは誰でも閲覧可能" ON lessons
  FOR SELECT USING (true);
```

### user_lesson_progress（視聴進捗）
```sql
CREATE TABLE user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- RLS設定
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ユーザーは自分の進捗のみアクセス可能" ON user_lesson_progress
  FOR ALL USING (auth.uid() = user_id);
```

## 新規ユーザー登録トリガー

```sql
-- 新規ユーザー登録時に自動でprofileを作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, google_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'sub'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## 必要パッケージのインストール

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## 環境変数（.env.local）

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 完了条件
- [ ] Supabaseプロジェクトが正常に動作
- [ ] すべてのデータベーステーブルが作成済み
- [ ] RLSポリシーが適切に設定済み
- [ ] Google OAuth認証が動作
- [ ] Vercelにデプロイ可能

## 備考
- Google OAuth設定では、開発環境と本番環境で異なるリダイレクトURLを設定する必要がある
- Supabaseの新規ユーザー登録トリガーは、Google認証のメタデータを適切に処理する
- RLSポリシーは各テーブルの要件に応じて適切に設定するcd