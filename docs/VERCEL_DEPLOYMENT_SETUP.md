# 🚀 Vercelデプロイ設定ガイド

## 概要
HiroCodeオンライン講座プラットフォームをVercelにデプロイするための詳細ガイドです。

## 📋 前提条件
- GitHubアカウント
- Vercelアカウント（GitHubでサインアップ推奨）
- supabase-tutorial-ytプロジェクトの設定完了
- Google OAuth設定完了

## 🌟 Step 1: GitHubリポジトリの準備

### 1.1 リポジトリの作成
1. GitHubで新しいリポジトリを作成
   - リポジトリ名: `hirocode-course-platform`
   - 可視性: Private（推奨）

### 1.2 ローカルコードをプッシュ
```bash
# Gitを初期化（まだの場合）
git init

# リモートリポジトリを追加
git remote add origin https://github.com/YOUR_USERNAME/hirocode-course-platform.git

# 必要ファイルをステージング
git add .

# .envファイルが誤ってコミットされていないことを確認
git status

# コミットとプッシュ
git commit -m "feat: Initial commit with database schema and environment setup"
git branch -M main
git push -u origin main
```

### 1.3 .gitignoreの確認
`.gitignore` ファイルで以下が除外されていることを確認:

```gitignore
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# Dependencies
node_modules/

# Next.js
.next/
out/

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

## 🔧 Step 2: Vercelプロジェクトの作成

### 2.1 Vercelにサインアップ/ログイン
1. [Vercel](https://vercel.com) にアクセス
2. GitHubアカウントでサインアップ/ログイン

### 2.2 新しいプロジェクトをインポート
1. Vercelダッシュボードで「Add New Project」
2. GitHubから `hirocode-course-platform` リポジトリを選択
3. 「Import」をクリック

### 2.3 プロジェクト設定
#### Framework Preset
- **Framework**: Next.js（自動検出される）
- **Root Directory**: `/` （デフォルト）

#### Build and Output Settings
- **Build Command**: `npm run build`（デフォルト）
- **Output Directory**: `.next`（デフォルト）
- **Install Command**: `npm install`（デフォルト）

## 🌐 Step 3: 環境変数の設定

### 3.1 Vercelで環境変数を追加
「Environment Variables」セクションで以下を追加:

#### Supabase設定
```
SUPABASE_URL = https://tyhmqqwytrqafgkvxmxq.supabase.co
SUPABASE_ANON_KEY = [実際のService Role Key]
NEXT_PUBLIC_SUPABASE_URL = https://tyhmqqwytrqafgkvxmxq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = [実際のAnon Key]
```

#### Google OAuth設定
```
GOOGLE_CLIENT_ID = [Google Cloud ConsoleのClient ID]
GOOGLE_CLIENT_SECRET = [Google Cloud ConsoleのClient Secret]
```

#### Next.js認証設定
```
NEXTAUTH_URL = https://YOUR_PROJECT.vercel.app
NEXTAUTH_SECRET = [強力なランダム文字列]
```

### 3.2 NEXTAUTHシークレットの生成
```bash
# ランダムな32文字のシークレットを生成
openssl rand -base64 32
```

## 🔄 Step 4: デプロイメント設定

### 4.1 初回デプロイ
1. 環境変数設定後「Deploy」をクリック
2. ビルドプロセスが成功することを確認

### 4.2 カスタムドメイン設定（オプション）
1. プロジェクト設定の「Domains」タブ
2. カスタムドメインを追加
3. DNS設定でCNAMEレコードを設定

## 🔐 Step 5: 本番環境でのOAuth設定更新

### 5.1 Google Cloud Console更新
デプロイ後のVercel URLを使用:

#### 承認済みJavaScript生成元に追加
```
https://YOUR_PROJECT.vercel.app
```

#### 承認済みリダイレクトURIに追加
```
https://YOUR_PROJECT.vercel.app/auth/callback
```

### 5.2 Supabase認証設定更新
1. [Supabase認証設定](https://supabase.com/dashboard/project/tyhmqqwytrqafgkvxmxq/auth/url-configuration) にアクセス
2. 「Site URL」を本番URLに更新:
```
https://YOUR_PROJECT.vercel.app
```

3. 「Redirect URLs」に本番URLを追加:
```
https://YOUR_PROJECT.vercel.app/auth/callback
```

## 🧪 Step 6: 本番環境テスト

### 6.1 動作確認チェックリスト
- [ ] サイトが正常にロードされる
- [ ] データベース接続が動作する
- [ ] Google OAuth認証が動作する
- [ ] ユーザー登録・ログインが正常に動作する
- [ ] レスポンシブデザインが適切に表示される

### 6.2 パフォーマンステスト
- [ ] Lighthouseスコアが良好（90+推奨）
- [ ] Core Web Vitalsが良好
- [ ] 画像最適化が適切に動作

## 🔄 Step 7: 継続的デプロイメント設定

### 7.1 自動デプロイ
Vercelは自動的に以下を設定:
- **mainブランチ**: 本番環境に自動デプロイ
- **feature브랜치**: プレビューデプロイメント作成

### 7.2 デプロイメントフック（オプション）
特定の条件でデプロイを実行:
1. Webhookの設定
2. GitHub Actionsとの連携

## 📊 Step 8: モニタリング設定

### 8.1 Vercel Analytics
1. プロジェクト設定で「Analytics」を有効化
2. トラフィックとパフォーマンスをモニタリング

### 8.2 エラートラッキング（推奨）
- Sentry
- LogRocket
- Vercel専用のモニタリングツール

## 🚨 トラブルシューティング

### よくある問題と解決方法

#### 1. ビルドエラー
**原因**: 依存関係やTypeScriptエラー

**解決方法**:
```bash
# ローカルでビルドテスト
npm run build

# TypeScriptエラーをチェック
npm run type-check  # スクリプトがあれば
```

#### 2. 環境変数が読み込まれない
**原因**: 環境変数の設定ミス

**解決方法**:
- Vercelダッシュボードで環境変数を再確認
- プレフィックス（NEXT_PUBLIC_）の確認
- 再デプロイの実行

#### 3. OAuth認証エラー
**原因**: リダイレクトURL設定の不整合

**解決方法**:
- Google Cloud ConsoleのリダイレクトURI確認
- Supabaseの認証設定確認
- NEXTAUTH_URLの確認

## ⚡ 最適化のベストプラクティス

### パフォーマンス最適化
- **画像最適化**: Next.js Image コンポーネントの使用
- **コード分割**: Dynamic Importの活用
- **キャッシュ戦略**: SWRやReact Queryの使用

### SEO最適化
- **メタタグ**: Next.js Head コンポーネント
- **構造化データ**: JSON-LDの実装
- **サイトマップ**: 自動生成の設定

---

**このガイドに従ってVercelデプロイを完了すると、本番環境でHiroCode講座プラットフォームが利用可能になります。**