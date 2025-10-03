# オンライン講座プラットフォーム 要件定義書

## 📖 プロジェクト概要

### 目的
YouTubeで作成された動画をベースとした、Udemyライクなオンライン講座プラットフォームのMVP開発

### 背景
- hirocodeさんのUdemy講座の一環として学習目的で開発
- プログラミングやAI開発に関する講座動画を提供
- 後々課金機能を追加予定

## 🛠️ 技術スタック

- **フロントエンド**: Next.js (App Router)
- **データベース**: Supabase
- **認証**: Supabase Auth
- **デプロイ**: Vercel
- **動画**: YouTube埋め込み

## 📋 機能要件

### 基本機能

#### 講座構造（3階層）
```
講座（Course）
├── セクション（Section）
    ├── レッスン（Lesson/Video）
    ├── レッスン（Lesson/Video）
    └── ...
├── セクション（Section）
└── ...
```

#### 動画・講座仕様
- 1講座あたり約30動画
- ジャンル: プログラミング、AI開発
- 動画情報: タイトル、説明、再生時間、YouTube URL
- 最初の動画は誰でも視聴可能、それ以降は認証必須

#### 認証・ユーザー管理
- **Google認証のみ**（Supabase Auth使用）
- メールアドレス/パスワード認証は実装しない
- 最初のレッスンのみ未認証でも視聴可能
- Google OAuth設定が必要

#### 視聴進捗管理
- **進捗単位**: 動画完了時に「完了」マーク
- **進捗表示**: 
  - 講座一覧での全体進捗率表示
  - 個別講座内でのセクション・レッスン毎の進捗表示
- モチベーション向上のための進捗可視化

### 機能優先度

| 機能 | 優先度 | 説明 |
|------|--------|------|
| 講座一覧・詳細表示 | 高 | 基本的なコンテンツ表示 |
| 動画プレーヤー（YouTube埋め込み） | 高 | メイン機能 |
| ユーザー認証 | 高 | ログイン・サインアップ |
| 視聴進捗管理・表示 | 中 | ユーザー体験向上 |
| 検索機能 | 中 | コンテンツ発見性 |
| レスポンシブ対応 | 低 | MVP後に対応 |

## 🗄️ データベース設計

### テーブル構成

#### profiles（ユーザープロフィール）
```sql
profiles (
  id: uuid (primary key, foreign key -> auth.users.id)
  email: text
  full_name: text (Googleアカウントの名前)
  avatar_url: text (Googleプロフィール画像URL)
  google_id: text (Google OAuth ID)
  created_at: timestamp
  updated_at: timestamp
)
```

#### courses（講座）
```sql
courses (
  id: uuid (primary key)
  title: text
  description: text
  thumbnail_url: text
  created_at: timestamp
  updated_at: timestamp
)
```

#### sections（セクション）
```sql
sections (
  id: uuid (primary key)
  course_id: uuid (foreign key -> courses.id)
  title: text
  order_index: integer
  created_at: timestamp
)
```

#### lessons（レッスン）
```sql
lessons (
  id: uuid (primary key)
  section_id: uuid (foreign key -> sections.id)
  title: text
  description: text
  youtube_url: text
  duration: integer (秒)
  order_index: integer
  is_free: boolean (最初のレッスンをfreeに設定)
  created_at: timestamp
)
```

#### user_lesson_progress（視聴進捗）
```sql
user_lesson_progress (
  id: uuid (primary key)
  user_id: uuid (foreign key -> profiles.id)
  lesson_id: uuid (foreign key -> lessons.id)
  progress_percentage: integer (0-100)
  completed: boolean
  last_watched_at: timestamp
)
```

### Supabaseセットアップ時の注意点

#### RLS（Row Level Security）設定
- `profiles` テーブル：ユーザーは自分のプロフィールのみ読み書き可能
- `user_lesson_progress` テーブル：ユーザーは自分の進捗のみ読み書き可能

#### トリガー設定
```sql
-- 新規ユーザー登録時に自動でprofileを作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'display_name');
  RETURN new;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## 🚀 開発フェーズ

### Phase 1（高優先度）- MVP Core
1. **環境セットアップ**
   - Next.js プロジェクト作成
   - Supabaseセットアップ・Google OAuth認証設定
   - Google Cloud Consoleでの認証設定
   - データベーステーブル作成（profiles, courses, sections, lessons, user_lesson_progress）
   - RLS（Row Level Security）設定
   - 新規ユーザー用トリガー設定（Google認証対応）
   - Vercelデプロイ設定

2. **基本画面実装**
   - 講座一覧ページ
   - 講座詳細ページ
   - レッスン視聴ページ

3. **認証機能**
   - Google OAuth認証
   - 認証状態管理
   - 認証ガード実装

4. **動画プレーヤー**
   - YouTube埋め込みプレーヤー
   - 基本的な視聴機能

### Phase 2（中優先度）- UX向上
5. **視聴進捗機能**
   - 進捗データ管理
   - 進捗表示UI
   - 完了状態管理

6. **検索機能**
   - 講座・レッスン検索
   - フィルタリング機能

### Phase 3（追加機能）- 管理・運用
7. **管理画面**
   - 講座・セクション・レッスン管理
   - コンテンツ追加・編集機能

8. **UI/UX改善**
   - レスポンシブ対応
   - パフォーマンス最適化
   - アクセシビリティ向上

## 📝 補足事項

### 今後の拡張予定
- 課金機能の実装
- より詳細な学習分析
- コミュニティ機能（コメント、Q&A）
- 修了証明書発行

### 技術的考慮事項
- SEO対策（講座ページの検索エンジン最適化）
- パフォーマンス（画像最適化、遅延読み込み）
- セキュリティ（Google OAuth認証、認可の適切な実装）
- Google OAuth設定（本番・開発環境でのリダイレクトURL設定）

### 学習目標
hirocodeさんのUdemy講座の一環として、実際のWebアプリケーション開発を通じた学習を行う