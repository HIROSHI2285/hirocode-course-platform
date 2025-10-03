# 00. データベーススキーマ作成

## 概要
HiroCodeオンライン講座プラットフォームのデータベーススキーマを設計・作成し、テーブル間の関係性とデータ整合性を確保する。

## 優先度
**最高（Phase 0 - 基盤作成）**

## 関連技術
- Supabase PostgreSQL
- SQL DDL (Data Definition Language)
- Row Level Security (RLS)
- PostgreSQL Functions & Triggers

## 前提条件
- Supabaseプロジェクトが作成済みであること

## 作業内容

### データベース設計分析
- [ ] オンライン学習プラットフォームの要件整理
- [ ] エンティティ関係図 (ERD) の作成
- [ ] 正規化レベルの決定（第3正規化を基本とする）
- [ ] インデックス戦略の検討

## データベース設計

### エンティティ関係図

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   auth.users    │◄─────1:1┤    profiles     │         │     courses     │
│  (Supabase)     │         │                 │         │                 │
│ • id (PK)       │         │ • id (PK, FK)   │         │ • id (PK)       │
│ • email         │         │ • avatar_url    │         │ • title         │
│ • full_name     │         │ • google_id     │         │ • description   │
│ • created_at    │         │ • created_at    │         │ • thumbnail_url │
│ • ...           │         │ • updated_at    │         │ • created_at    │
│                 │         │                 │         │ • updated_at    │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                     │                            │
                                     │                            │ 1
                                     │                            │
                                     │ 1                          ▼ *
                                     │                   ┌─────────────────┐
                                     │                   │    sections     │
                                     │                   │                 │
                                     │                   │ • id (PK)       │
                                     │                   │ • course_id (FK)│
                                     │                   │ • title         │
                                     │                   │ • order_index   │
                                     │                   │ • created_at    │
                                     │                   │                 │
                                     │                   └─────────────────┘
                                     │                            │ 1
                                     │                            │
                                     │                            ▼ *
                                     │                   ┌─────────────────┐
                                     │                   │     lessons     │
                                     │                   │                 │
                                     │                   │ • id (PK)       │
                                     │                   │ • section_id(FK)│
                                     │                   │ • title         │
                                     │                   │ • description   │
                                     │                   │ • youtube_url   │
                                     │                   │ • duration      │
                                     │                   │ • order_index   │
                                     │                   │ • is_free       │
                                     │                   │ • created_at    │
                                     │                   │                 │
                                     │                   └─────────────────┘
                                     │                            │ 1
                                     │                            │
                                     │                            │
                                     └──────────────────*         ▼ *
                                                ┌─────────────────────────────────┐
                                                │    user_lesson_progress         │
                                                │                                 │
                                                │ • id (PK)                       │
                                                │ • user_id (FK → profiles.id)    │
                                                │ • lesson_id (FK → lessons.id)   │
                                                │ • progress_percentage           │
                                                │ • completed                     │
                                                │ • last_watched_at               │
                                                │                                 │
                                                │ UNIQUE(user_id, lesson_id)      │
                                                └─────────────────────────────────┘
```

### テーブル設計理念

#### 1. 講座の3階層構造
```
Course → Section → Lesson
```
- **Course**: 講座全体（例：「Next.js完全攻略」）
- **Section**: 章・パート（例：「第1章：環境構築」）
- **Lesson**: 個別動画（例：「Node.jsのインストール」）

#### 2. ユーザー管理設計
- **auth.users**: Supabase Auth管理（email, full_name等の機密情報）
- **profiles**: アプリケーション用拡張情報（avatar_url, google_id等）

#### 3. 進捗管理設計
- **user_lesson_progress**: ユーザー×レッスンの進捗
- 複合ユニーク制約でデータ重複防止
- 進捗率（0-100%）と完了フラグの併用

## テーブル作成順序

### Step 1: 基本テーブル作成
```sql
-- 1. ユーザープロフィール
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  avatar_url TEXT,
  google_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. 講座
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. セクション
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. レッスン
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

-- 5. 視聴進捗
CREATE TABLE user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);
```

### Step 2: インデックス作成
```sql
-- パフォーマンス向上のためのインデックス
CREATE INDEX idx_sections_course_id ON sections(course_id);
CREATE INDEX idx_sections_order ON sections(course_id, order_index);

CREATE INDEX idx_lessons_section_id ON lessons(section_id);
CREATE INDEX idx_lessons_order ON lessons(section_id, order_index);
CREATE INDEX idx_lessons_free ON lessons(is_free);

CREATE INDEX idx_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX idx_progress_lesson_id ON user_lesson_progress(lesson_id);
CREATE INDEX idx_progress_completed ON user_lesson_progress(completed);
```

### Step 3: Row Level Security (RLS) 設定
```sql
-- profiles テーブル
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ユーザーは自分のプロフィールのみアクセス可能" ON profiles
  FOR ALL USING (auth.uid() = id);

-- courses テーブル（公開読み取り）
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "講座は誰でも閲覧可能" ON courses
  FOR SELECT USING (true);

-- sections テーブル（公開読み取り）
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "セクションは誰でも閲覧可能" ON sections
  FOR SELECT USING (true);

-- lessons テーブル（公開読み取り）
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "レッスンは誰でも閲覧可能" ON lessons
  FOR SELECT USING (true);

-- user_lesson_progress テーブル
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ユーザーは自分の進捗のみアクセス可能" ON user_lesson_progress
  FOR ALL USING (auth.uid() = user_id);
```

### Step 4: トリガー・関数作成
```sql
-- 新規ユーザー登録時の自動プロフィール作成
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
```

## データ整合性制約

### 必須制約
- **NOT NULL**: 必須フィールドの定義
- **CHECK**: データ範囲の制限（進捗率0-100%）
- **UNIQUE**: データ重複防止（user_id + lesson_id）
- **FOREIGN KEY**: 参照整合性の確保

### カスケード設定
- **ON DELETE CASCADE**: 親レコード削除時の子レコード自動削除
- 講座削除 → セクション・レッスン・進捗も削除
- セクション削除 → レッスン・進捗も削除

## パフォーマンス考慮事項

### インデックス戦略
1. **主要な検索条件**: course_id, section_id, user_id
2. **ソート条件**: order_index（講座・レッスン順序）
3. **フィルタ条件**: is_free, completed

### クエリ最適化
- JOINクエリを考慮したインデックス設計
- N+1問題回避のための一括取得設計
- ページネーション対応

## セキュリティ設計

### RLS（Row Level Security）
- **profiles**: 自分のデータのみアクセス
- **user_lesson_progress**: 自分の進捗のみアクセス
- **courses/sections/lessons**: 全員が読み取り可能

### アクセス制御
- 管理者権限の将来的な拡張を考慮
- API経由でのデータ操作制限

## タスクリスト

### スキーマ設計
- [x] エンティティ関係図の作成
- [x] 正規化の検証
- [x] インデックス戦略の決定
- [x] RLS ポリシーの設計

### データベース作成
- [x] 基本テーブルの作成
- [x] 外部キー制約の設定
- [x] インデックスの作成
- [x] RLS ポリシーの適用

### トリガー・関数
- [x] 新規ユーザー登録トリガーの作成
- [x] updated_at自動更新トリガーの作成
- [x] データ整合性チェック関数の作成

### テスト・検証
- [x] スキーマの動作確認
- [x] RLS ポリシーのテスト
- [x] パフォーマンステスト
- [x] データ整合性の確認

## 完了条件
- [x] すべてのテーブルが正常に作成済み
- [x] 外部キー制約が適切に設定済み
- [x] RLS ポリシーが正常に動作
- [x] インデックスが適切に作成済み
- [x] トリガー・関数が正常に動作
- [x] 基本的なCRUD操作が可能

## 注意事項
- PostgreSQLの制約とSupabaseの機能を適切に活用する
- 将来の拡張性を考慮したスキーマ設計を行う
- セキュリティを最優先に設計する
- パフォーマンスと保守性のバランスを取る

## 備考
- このチケットは他のすべてのチケットの前提条件となる
- スキーマ変更は慎重に行い、マイグレーション戦略を検討する
- 本番環境への適用前に十分なテストを実施する