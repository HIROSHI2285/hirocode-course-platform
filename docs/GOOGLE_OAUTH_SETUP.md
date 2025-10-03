# 🔐 Google OAuth設定ガイド

## 概要
HiroCodeオンライン講座プラットフォームでGoogle OAuth認証を設定するための詳細ガイドです。

## 📋 前提条件
- Googleアカウント
- Google Cloud Consoleへのアクセス権限
- supabase-tutorial-ytプロジェクトのアクセス権限

## 🚀 Step 1: Google Cloud Projectの作成

### 1.1 Google Cloud Consoleにアクセス
1. [Google Cloud Console](https://console.cloud.google.com) にアクセス
2. Googleアカウントでログイン

### 1.2 新しいプロジェクトを作成
1. 右上の「プロジェクト選択」をクリック
2. 「新しいプロジェクト」をクリック
3. プロジェクト名: `hirocode-course-platform`
4. 「作成」をクリック

## 🔑 Step 2: OAuth 2.0認証情報の作成

### 2.1 APIs & Services を有効化
1. 左サイドメニューから「APIs & Services」→「ライブラリ」
2. 「Google+ API」を検索して有効化
3. 「Google Identity」を検索して有効化

### 2.2 OAuth同意画面の設定
1. 「APIs & Services」→「OAuth同意画面」
2. User Type: **外部** を選択
3. 「作成」をクリック

#### アプリ情報
- **アプリ名**: `HiroCode オンライン講座`
- **ユーザーサポートメール**: あなたのGmailアドレス
- **デベロッパーの連絡先情報**: あなたのGmailアドレス

#### スコープ
- 「スコープを追加または削除」をクリック
- 以下のスコープを追加:
  - `../auth/userinfo.email`
  - `../auth/userinfo.profile`
  - `openid`

#### テストユーザー（開発段階）
- あなたのGmailアドレスを追加
- 他の開発者のメールアドレスも追加

### 2.3 認証情報を作成
1. 「認証情報」タブに移動
2. 「+ 認証情報を作成」→「OAuth 2.0 クライアント ID」
3. アプリケーションの種類: **ウェブアプリケーション**

#### ウェブクライアントの詳細
- **名前**: `hirocode-course-web-client`

#### 承認済みJavaScript生成元
```
http://localhost:3000
https://yourdomain.vercel.app  # 本番環境のURL
```

#### 承認済みリダイレクトURI
```
http://localhost:3000/auth/callback
https://yourdomain.vercel.app/auth/callback  # 本番環境のURL
https://tyhmqqwytrqafgkvxmxq.supabase.co/auth/v1/callback
```

4. 「作成」をクリック
5. **Client IDとClient Secretをメモ** 📝

## 🔧 Step 3: Supabase認証設定

### 3.1 Supabase認証プロバイダー設定
1. [Supabase Dashboard](https://supabase.com/dashboard/project/tyhmqqwytrqafgkvxmxq/auth/providers) にアクセス
2. 「Google」プロバイダーを選択
3. 「Enable sign in with Google」をオン

#### 設定値
- **Client ID**: Google Cloud Consoleで取得したClient ID
- **Client Secret**: Google Cloud Consoleで取得したClient Secret

### 3.2 リダイレクトURLの確認
Supabaseの設定画面で以下のリダイレクトURLが表示されることを確認:
```
https://tyhmqqwytrqafgkvxmxq.supabase.co/auth/v1/callback
```

## 🌐 Step 4: 環境変数の更新

`.env` ファイルを更新:

```env
# Google OAuth 設定
GOOGLE_CLIENT_ID=1234567890-abcdefgh.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_actual_client_secret_here

# Next.js認証設定
NEXTAUTH_URL=http://localhost:3000  # 開発環境
# NEXTAUTH_URL=https://yourdomain.vercel.app  # 本番環境
NEXTAUTH_SECRET=your-super-secret-jwt-secret-here
```

## 🧪 Step 5: 動作テスト

### 5.1 開発環境でのテスト
```bash
npm run dev
```

1. http://localhost:3000 にアクセス
2. ログインボタンをクリック
3. Google認証フローが正常に動作することを確認

### 5.2 確認ポイント
- [ ] Google認証画面が表示される
- [ ] 認証後にアプリケーションにリダイレクトされる
- [ ] ユーザー情報が正しく取得される
- [ ] Supabaseのauth.usersテーブルにユーザーが作成される
- [ ] profilesテーブルに自動でプロフィールが作成される

## 🚨 トラブルシューティング

### よくある問題と解決方法

#### 1. redirect_uri_mismatch エラー
**原因**: リダイレクトURIの設定ミス

**解決方法**:
- Google Cloud ConsoleのOAuth設定でリダイレクトURIを再確認
- Supabaseの認証コールバックURLも含めているか確認

#### 2. access_denied エラー
**原因**: OAuth同意画面の設定問題

**解決方法**:
- OAuth同意画面でテストユーザーを追加
- スコープが正しく設定されているか確認

#### 3. 認証後のリダイレクト失敗
**原因**: NEXTAUTH_URLの設定ミス

**解決方法**:
- 環境変数のNEXTAUTH_URLが正しいか確認
- 開発環境では http://localhost:3000

## 📝 本番環境への移行時

### 本番環境設定チェックリスト
- [ ] Google Cloud ConsoleでVercelの本番URLを追加
- [ ] 環境変数を本番用に更新
- [ ] OAuth同意画面を「本番環境」に公開申請（必要に応じて）

---

**この設定が完了すると、Google認証によるユーザー登録・ログインが利用可能になります。**