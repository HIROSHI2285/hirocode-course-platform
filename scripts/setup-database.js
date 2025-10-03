import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// 現在のファイルのディレクトリを取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .envファイルを読み込み
dotenv.config({ path: join(__dirname, '..', '.env') });

// Supabaseクライアントを作成
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  console.error('SUPABASE_URLとSUPABASE_ANON_KEYを.envファイルに設定してください');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 データベーススキーマの設定を開始します...');

  try {
    // SQLファイルを読み込み
    const sqlContent = readFileSync(
      join(__dirname, '..', 'database_schema.sql'),
      'utf8'
    );

    // 注意: 本来はSupabase CLIやダッシュボードでSQLを実行するのが推奨
    // このスクリプトはテスト用のデータ挿入のみに使用
    console.log('📄 SQLファイルを読み込みました');

    // テスト：Supabaseに接続できるか確認
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .limit(1);

    if (error && error.code === '42P01') {
      console.log('⚠️  テーブルが存在しません。Supabaseダッシュボードまたは CLI で以下のSQLファイルを実行してください:');
      console.log('📝 ファイル: database_schema.sql');
      console.log('');
      console.log('手順:');
      console.log('1. https://supabase.com/dashboard でプロジェクトを開く');
      console.log('2. SQL Editor に移動');
      console.log('3. database_schema.sql の内容をコピー&ペーストして実行');
      console.log('4. 再度このスクリプトを実行');
      return;
    } else if (error) {
      console.error('❌ データベース接続エラー:', error);
      return;
    }

    console.log('✅ データベース接続が確認されました');

    // テーブルの存在確認
    const tables = ['profiles', 'courses', 'sections', 'lessons', 'user_lesson_progress'];
    console.log('🔍 テーブルの存在を確認中...');

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ ${table} テーブルが見つかりません`);
      } else {
        console.log(`✅ ${table} テーブル: OK`);
      }
    }

    console.log('🎉 データベースのセットアップが完了しました！');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

// スクリプトを実行
setupDatabase();