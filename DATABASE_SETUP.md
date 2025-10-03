# データベーススキーマのセットアップ

## 概要

HiroCodeオンライン講座プラットフォームのデータベーススキーマが正常に作成されました。このドキュメントは、作成されたテーブル構造と設定について説明します。

## 🎉 完了した作業

### ✅ 基本ファイル構成

以下のファイルが作成されました：

- `database_schema.sql` - データベーススキーマ定義
- `lib/supabase/client.ts` - ブラウザ用Supabaseクライアント
- `lib/supabase/server.ts` - サーバー用Supabaseクライアント
- `lib/supabase/middleware.ts` - 認証ミドルウェア
- `lib/supabase/database.ts` - データベース操作サービス
- `types/database.ts` - TypeScript型定義
- `middleware.ts` - Next.jsミドルウェア
- `scripts/setup-database.js` - データベースセットアップスクリプト

### ✅ データベーススキーマ

#### テーブル構成

1. **profiles** - ユーザープロフィール拡張情報
   - `id` (UUID, PK) - auth.users.id への外部キー
   - `avatar_url` (TEXT) - プロフィール画像URL
   - `google_id` (TEXT) - Google OAuth ID
   - `created_at`, `updated_at` (TIMESTAMP)

2. **courses** - 講座情報
   - `id` (UUID, PK)
   - `title` (TEXT, NOT NULL) - 講座タイトル
   - `description` (TEXT) - 講座説明
   - `thumbnail_url` (TEXT) - サムネイル画像URL
   - `created_at`, `updated_at` (TIMESTAMP)

3. **sections** - 講座内のセクション
   - `id` (UUID, PK)
   - `course_id` (UUID, FK) - courses.id への参照
   - `title` (TEXT, NOT NULL) - セクション名
   - `order_index` (INTEGER, NOT NULL) - 表示順序
   - `created_at` (TIMESTAMP)

4. **lessons** - 個別レッスン
   - `id` (UUID, PK)
   - `section_id` (UUID, FK) - sections.id への参照
   - `title` (TEXT, NOT NULL) - レッスンタイトル
   - `description` (TEXT) - レッスン説明
   - `youtube_url` (TEXT, NOT NULL) - YouTube動画URL
   - `duration` (INTEGER) - 動画時間（秒）
   - `order_index` (INTEGER, NOT NULL) - 表示順序
   - `is_free` (BOOLEAN) - 無料視聴可能フラグ
   - `created_at` (TIMESTAMP)

5. **user_lesson_progress** - ユーザー学習進捗
   - `id` (UUID, PK)
   - `user_id` (UUID, FK) - profiles.id への参照
   - `lesson_id` (UUID, FK) - lessons.id への参照
   - `progress_percentage` (INTEGER, 0-100) - 進捗率
   - `completed` (BOOLEAN) - 完了フラグ
   - `last_watched_at` (TIMESTAMP) - 最終視聴日時
   - **制約**: UNIQUE(user_id, lesson_id) - 重複防止

### ✅ インデックス最適化

パフォーマンス向上のために以下のインデックスを作成：

- `sections`: course_id, (course_id, order_index)
- `lessons`: section_id, (section_id, order_index), is_free
- `user_lesson_progress`: user_id, lesson_id, completed

### ✅ セキュリティ設定（RLS）

Row Level Security ポリシー:

- **profiles**: ユーザーは自分のプロフィールのみアクセス可能
- **courses, sections, lessons**: 誰でも読み取り可能
- **user_lesson_progress**: ユーザーは自分の進捗のみアクセス可能

### ✅ 自動化機能（トリガー）

1. **新規ユーザー登録時の自動プロフィール作成**
   - Google OAuth認証時にプロフィールテーブルを自動作成
   - アバター画像URLとGoogle IDを自動設定

2. **updated_at自動更新**
   - profiles, coursesテーブルの更新時に自動でタイムスタンプ更新

### ✅ サンプルデータ

テスト用のサンプルデータを含む：

- Next.js完全攻略講座（2セクション、3レッスン）
- TypeScript入門講座（1セクション、1レッスン）
- 最初のレッスンは無料視聴可能に設定

## 📋 次のステップ

データベーススキーマの作成が完了しました。実際にSupabaseダッシュボードでスキーマを適用するには：

### 方法1: Supabaseダッシュボード（推奨）

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. プロジェクト「test」を選択
3. 「SQL Editor」に移動
4. `database_schema.sql` の内容をコピー&ペーストして実行

### 方法2: Supabase CLI

```bash
# Supabase CLI をインストール（未インストールの場合）
npm install -g supabase

# プロジェクトにリンク
supabase link --project-ref guocrjsqewhxgtuottxo

# SQLファイルを実行
supabase db reset
```

## 🔧 開発コマンド

```bash
# データベース接続テスト
npm run db:setup

# 開発サーバー起動
npm run dev

# 型チェック
npm run lint
```

## 📁 重要ファイル

- `database_schema.sql` - **必須**: Supabaseで実行する必要があるSQLスキーマ
- `.env` - 環境変数（Supabase接続情報）
- `lib/supabase/` - Supabase関連のライブラリファイル
- `types/database.ts` - データベース型定義

## 🚨 注意事項

1. **セキュリティ**: `.env` ファイルは機密情報を含むため、Gitにコミットしないでください
2. **RLS**: Row Level Security が有効化されているため、認証されていないユーザーは進捗データにアクセスできません
3. **カスケード削除**: 講座を削除すると関連するセクション・レッスン・進捗データも自動削除されます

---

**✅ データベーススキーマ作成 - 完了**

Phase 1 の基盤となるデータベース設計が完成しました。次は基本画面の実装に進むことができます。