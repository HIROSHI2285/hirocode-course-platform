# Supabaseプロジェクト移行ガイド

## 🎯 目的

現在「test」プロジェクト（ID: guocrjsqewhxgtuottxo）で開発していますが、実際の本番環境では「supabase-tutorial-yt」プロジェクト（ID: tyhmqqwytrqafgkvxmxq）を使用する必要があります。

## ✅ 現在の状況

### 完了済み
- ✅ 完全なデータベーススキーマ設計
- ✅ TypeScript型定義
- ✅ Supabaseクライアント設定
- ✅ 認証ミドルウェア
- ✅ データベース操作サービス
- ✅ サンプルデータ

### 作成済みファイル
- `database_schema.sql` - **重要**: メインのデータベーススキーマ
- `lib/supabase/` - Supabase関連設定
- `types/database.ts` - TypeScript型定義
- `scripts/setup-database.js` - データベースセットアップスクリプト

## 🔄 移行手順

### Step 1: Supabaseプロジェクトの確認

まず、正しいプロジェクトのAPIキーを取得します：

1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. 「supabase-tutorial-yt」プロジェクトを選択
3. Settings → API → Project URL と anon/service_role キーをメモ

### Step 2: 環境変数の更新

**重要**: `.env` ファイルの APIキーを実際の値に置き換えてください。

現在の `.env` ファイル:
```env
# Supabase設定 (supabase-tutorial-yt プロジェクト)
SUPABASE_URL=https://tyhmqqwytrqafgkvxmxq.supabase.co
# TODO: 実際のAPIキーをSupabaseダッシュボードから取得して置き換えてください
SUPABASE_ANON_KEY=REPLACE_WITH_ACTUAL_SERVICE_ROLE_KEY

# Next.js用 (フロントエンドで使用)
NEXT_PUBLIC_SUPABASE_URL=https://tyhmqqwytrqafgkvxmxq.supabase.co
# TODO: 実際のAPIキーをSupabaseダッシュボードから取得して置き換えてください
NEXT_PUBLIC_SUPABASE_ANON_KEY=REPLACE_WITH_ACTUAL_ANON_KEY
```

**APIキー取得方法**:
1. [https://supabase.com/dashboard/project/tyhmqqwytrqafgkvxmxq/settings/api](https://supabase.com/dashboard/project/tyhmqqwytrqafgkvxmxq/settings/api) にアクセス
2. `anon` キーと `service_role` キーをコピー
3. 上記の `REPLACE_WITH_ACTUAL_*` 部分を実際のキーに置き換え

### Step 3: データベーススキーマの適用

#### 方法1: Supabaseダッシュボード（推奨）

1. [Supabase Dashboard](https://supabase.com/dashboard/project/tyhmqqwytrqafgkvxmxq) にアクセス
2. 左サイドバーから「SQL Editor」をクリック
3. `database_schema.sql` の内容をコピー
4. SQL Editorにペーストして「Run」をクリック

#### 方法2: Supabase CLI

```bash
# Supabase CLIがインストールされていない場合
npm install -g supabase

# プロジェクトにリンク
supabase link --project-ref tyhmqqwytrqafgkvxmxq

# SQLファイルを実行
supabase db reset
```

### Step 4: 接続テスト

環境変数を更新後、接続をテスト：

```bash
npm run db:setup
```

成功すると以下のように表示されます：
```
🚀 データベーススキーマの設定を開始します...
✅ courses テーブル: OK
✅ sections テーブル: OK
✅ lessons テーブル: OK
✅ profiles テーブル: OK
✅ user_lesson_progress テーブル: OK
🎉 データベースのセットアップが完了しました！
```

## 🛠️ 作業完了チェックリスト

### 必須作業
- [ ] Supabaseダッシュボードで正しいプロジェクト（supabase-tutorial-yt）を確認
- [ ] APIキーを正しく取得
- [ ] `.env` ファイルの環境変数を更新
- [ ] `database_schema.sql` をSupabaseで実行
- [ ] `npm run db:setup` で接続テスト成功

### 確認項目
- [ ] 5つのテーブルが正常に作成されている
- [ ] Row Level Security (RLS) が有効化されている
- [ ] サンプルデータが挿入されている
- [ ] トリガーと関数が作成されている
- [ ] Next.js アプリケーションがSupabaseに接続できる

## 📋 データベース構造

### テーブル一覧
1. **profiles** - ユーザープロフィール
2. **courses** - 講座情報
3. **sections** - セクション（章）
4. **lessons** - レッスン（動画）
5. **user_lesson_progress** - 学習進捗

### 重要な機能
- **自動プロフィール作成**: Google OAuth認証時に自動実行
- **RLS セキュリティ**: ユーザーは自分のデータのみアクセス可能
- **カスケード削除**: 講座削除時に関連データも自動削除
- **進捗管理**: 視聴率と完了状況を追跡

## 🚨 注意事項

1. **セキュリティ**:
   - `.env` ファイルをGitにコミットしないこと
   - API keyは機密情報として扱うこと

2. **データ整合性**:
   - テーブルの削除は慎重に行うこと
   - カスケード削除が設定されているため、親レコードの削除時は注意

3. **パフォーマンス**:
   - インデックスが適切に設定されている
   - 大量データの処理時はページネーションを考慮

## 🎉 次のステップ

データベース移行が完了したら、次のチケットに進むことができます：

- **01番**: 環境セットアップ（認証設定）
- **02番**: Supabaseクライアントセットアップ
- **03番**: 基本ページ実装

---

**この移行ガイドに従って、supabase-tutorial-ytプロジェクトでの開発環境を整備してください。**