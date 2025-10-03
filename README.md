# HiroCode オンライン講座プラットフォーム

YouTubeの動画をベースとしたUdemyライクなオンライン学習プラットフォームのMVPです。プログラミングやAI開発に関する講座動画を提供します。

## 🚀 デモ

**本番環境**: [https://hirocode-course-platform.vercel.app](https://hirocode-course-platform.vercel.app)

## ✨ 主要機能

- 📚 **講座管理**: 3階層構造（講座 → セクション → レッスン）
- 🎥 **YouTube動画プレーヤー**: 講座動画の視聴
- 🔐 **Google OAuth認証**: Supabase Authを使用
- 📊 **視聴進捗管理**: 動画完了時の「完了」マーク、進捗率表示
- 🔍 **検索・フィルター機能**: 講座・レッスンの検索
- 👨‍💼 **管理画面**: 講座・レッスン・ユーザー管理、統計分析
- 📱 **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応

## 🛠 技術スタック

### フロントエンド
- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **React**

### バックエンド
- **Supabase** (PostgreSQL)
- **Supabase Auth** (Google OAuth)

### デプロイ
- **Vercel**

### 開発ツール
- **Turbopack**
- **ESLint**

## 📋 必要要件

- Node.js 18.0.0以上
- npm または yarn
- Supabaseアカウント
- Google Cloud Platformアカウント（OAuth用）
- Vercelアカウント（デプロイ用、オプション）

## 🔧 セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/HIROSHI2285/hirocode-course-platform.git
cd hirocode-course-platform
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth設定（Supabase Dashboardで設定）
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 4. Supabaseのセットアップ

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. データベーススキーマを適用（SQL Editorで実行）
3. **Authentication → Providers → Google** でGoogle OAuthプロバイダーを有効化
4. **Authentication → URL Configuration** を設定：
   - **Site URL**: `http://localhost:3000` (開発) / `https://your-domain.vercel.app` (本番)
   - **Redirect URLs**:
     - `http://localhost:3000/**`
     - `http://localhost:3000/auth/callback`
     - `https://your-domain.vercel.app/**`
     - `https://your-domain.vercel.app/auth/callback`

### 5. Google Cloud Consoleの設定

1. [Google Cloud Console](https://console.cloud.google.com)でプロジェクトを作成
2. **APIs & Services → Credentials** でOAuth 2.0クライアントIDを作成
3. **承認済みのリダイレクトURI** に以下を追加：
   - `https://your-supabase-project.supabase.co/auth/v1/callback` ← **必須**
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.vercel.app/auth/callback`

### 6. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 📁 プロジェクト構造

```
app/
├── (auth)/               # 認証関連ページ
│   └── login/           # ログインページ
├── courses/             # 講座関連ページ
│   ├── page.tsx        # 講座一覧
│   └── [id]/           # 講座詳細・視聴ページ
├── dashboard/          # ダッシュボード（進捗管理）
├── admin/              # 管理画面
│   ├── courses/        # 講座管理
│   ├── analytics/      # 統計分析
│   └── users/          # ユーザー管理
├── search/             # 検索ページ
├── layout.tsx          # ルートレイアウト
└── page.tsx           # ホームページ

components/
├── ui/                 # 基本UIコンポーネント
├── features/           # 機能固有コンポーネント
│   ├── VideoPlayer.tsx
│   ├── CourseCard.tsx
│   └── ProgressDashboard.tsx
└── layout/            # レイアウトコンポーネント
    └── Header.tsx

lib/
├── supabase/          # Supabaseクライアント
│   ├── client.ts      # クライアント用
│   ├── server.ts      # サーバー用
│   └── middleware.ts  # ミドルウェア用
├── utils.ts           # ユーティリティ関数
└── validation.ts      # 入力検証（削除予定）

hooks/                 # カスタムReactフック
types/                 # TypeScript型定義
```

## 🗄 データベース設計

### 主要テーブル

- **profiles**: ユーザープロフィール（Google OAuth連携）
- **courses**: 講座
- **sections**: セクション
- **lessons**: レッスン（YouTube動画）
- **user_lesson_progress**: 視聴進捗（完了状態・進捗率）

### アクセス制御

- **Row Level Security (RLS)** によるデータ保護
- ユーザーは自分のデータのみアクセス可能
- 管理者のみ全データにアクセス可能

## 🚀 デプロイ

### Vercelへのデプロイ

1. Vercelアカウントでリポジトリをインポート
2. **Settings → Environment Variables** で環境変数を設定：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. デプロイ

```bash
# または、Vercel CLIを使用
npm install -g vercel
vercel
```

4. **重要**: デプロイ後、Supabaseの **URL Configuration** と Google Cloud Console の **リダイレクトURI** に本番URLを追加してください。

## 🔒 セキュリティ対策

- ✅ Google OAuth認証のみ（メール/パスワード認証なし）
- ✅ Row Level Security (RLS)
- ✅ CSPヘッダー設定
- ✅ 環境変数の適切な管理（`.env*` はGitで除外）
- ✅ XSS/CSRF保護

## 📝 開発コマンド

```bash
# 開発サーバー起動（Turbopack使用）
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm run start

# ESLint実行
npm run lint
```

## 🐛 トラブルシューティング

### 認証エラーが発生する場合

1. Supabaseの **URL Configuration** が正しく設定されているか確認
2. Google Cloud Consoleの **承認済みのリダイレクトURI** に Supabaseのコールバック URL (`https://your-project.supabase.co/auth/v1/callback`) が含まれているか確認
3. 環境変数が正しく設定されているか確認
4. Vercelでデプロイした場合は、Redeployを試す

### 動画が再生されない場合

- YouTube URLが正しいか確認
- YouTubeの埋め込み制限がないか確認

## 🎯 今後の拡張予定

- [ ] レート制限の再実装
- [ ] 課金機能の実装
- [ ] 詳細な学習分析
- [ ] コミュニティ機能（コメント、Q&A）
- [ ] 修了証明書発行
- [ ] メール通知機能
