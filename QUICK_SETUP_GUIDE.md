# 🚀 クイックセットアップガイド（supabase-tutorial-yt）

## 🎯 今すぐやるべきこと

### 1. APIキーの取得と設定

1. **Supabase APIキー取得**:
   - [https://supabase.com/dashboard/project/tyhmqqwytrqafgkvxmxq/settings/api](https://supabase.com/dashboard/project/tyhmqqwytrqafgkvxmxq/settings/api) にアクセス
   - `anon` キー と `service_role` キー をコピー

2. **`.env` ファイル更新**:
   ```bash
   # 現在のファイルを確認
   cat .env

   # 以下の部分を実際のキーに置き換え
   SUPABASE_ANON_KEY=REPLACE_WITH_ACTUAL_SERVICE_ROLE_KEY
   NEXT_PUBLIC_SUPABASE_ANON_KEY=REPLACE_WITH_ACTUAL_ANON_KEY
   ```

### 2. データベーススキーマ実行

1. **SQL Editor にアクセス**:
   - [https://supabase.com/dashboard/project/tyhmqqwytrqafgkvxmxq/sql/new](https://supabase.com/dashboard/project/tyhmqqwytrqafgkvxmxq/sql/new)

2. **SQLファイルの内容をコピー**:
   ```bash
   # database_schema.sql の内容をコピー
   cat database_schema.sql
   ```

3. **SQL Editorで実行**:
   - コピーしたSQLをペースト
   - 「Run」ボタンをクリック

### 3. 動作確認

```bash
# 接続テスト
npm run db:setup
```

**成功時の表示**:
```
🚀 データベーススキーマの設定を開始します...
✅ profiles テーブル: OK
✅ courses テーブル: OK
✅ sections テーブル: OK
✅ lessons テーブル: OK
✅ user_lesson_progress テーブル: OK
🎉 データベースのセットアップが完了しました！
```

## 📋 作成されるテーブル

- **profiles** - ユーザープロフィール
- **courses** - 講座情報
- **sections** - セクション（章）
- **lessons** - レッスン（動画）
- **user_lesson_progress** - 学習進捗

## 🎉 完了後

チケット00番「データベーススキーマ作成」完了！
次は チケット01番「環境セットアップ」に進めます。

---

**問題が発生した場合は、`SUPABASE_MIGRATION_GUIDE.md` の詳細ガイドを確認してください。**