-- 管理画面機能のためのデータベース拡張
-- 実行前に既存のdatabase_schema.sqlが実行済みであることを確認してください

-- プロフィールテーブルに管理者フラグを追加
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 管理者用RLSポリシーを作成

-- 管理者は全てのプロフィールにアクセス可能
CREATE POLICY "管理者は全てのプロフィールにアクセス可能" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 管理者は講座を管理可能
CREATE POLICY "管理者は講座を管理可能" ON courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 管理者はセクションを管理可能
CREATE POLICY "管理者はセクションを管理可能" ON sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 管理者はレッスンを管理可能
CREATE POLICY "管理者はレッスンを管理可能" ON lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 管理者は進捗データを閲覧可能
CREATE POLICY "管理者は進捗データを閲覧可能" ON user_lesson_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 初期管理者設定用のコメント
-- 注意: 以下のクエリは手動で実行し、実際のメールアドレスに変更してください
-- 例: UPDATE profiles SET is_admin = true WHERE email = 'your-admin-email@example.com';

-- 管理者権限の確認用ビュー
CREATE OR REPLACE VIEW admin_users AS
SELECT
  p.id,
  au.email,
  p.is_admin,
  p.created_at,
  p.updated_at
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.is_admin = true;

-- 管理画面統計用のビュー
CREATE OR REPLACE VIEW admin_stats AS
SELECT
  (SELECT COUNT(*) FROM courses) as total_courses,
  (SELECT COUNT(*) FROM sections) as total_sections,
  (SELECT COUNT(*) FROM lessons) as total_lessons,
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM profiles WHERE is_admin = true) as total_admins,
  (SELECT COUNT(*) FROM user_lesson_progress WHERE completed = true) as total_completed_lessons;

-- 権限チェック用の関数
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 注意: ビューはアプリケーション側で管理者権限チェックを行います
-- RLSはビューには適用できないため、lib/admin.ts の requireAdmin() で制御cd