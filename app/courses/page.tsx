import { createClient } from '@/lib/supabase/server'
import CourseCard from '@/components/features/CourseCard'
import type { Course } from '@/types/database'

// モックデータ（データベース接続後に削除）- YouTubeサムネイル付き
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'React + Next.js 完全マスター講座',
    description: 'Reactの基礎からNext.jsを使った本格的なWebアプリケーション開発まで学べます。TypeScriptも含めて実践的なスキルを身につけましょう。',
    thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    title: 'AI開発入門 - Python & TensorFlow',
    description: '人工知能開発の基礎をPythonとTensorFlowで学習。機械学習の概念から実装まで、初心者でも分かりやすく解説します。',
    thumbnail_url: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z'
  },
  {
    id: '3',
    title: 'フルスタック開発講座',
    description: 'フロントエンドからバックエンド、データベースまで。モダンな技術スタックを使った完全なWebアプリケーション開発を学びます。',
    thumbnail_url: 'https://img.youtube.com/vi/ScMzIvxBSi4/maxresdefault.jpg',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z'
  },
  {
    id: '4',
    title: 'JavaScript基礎講座',
    description: 'プログラミング初心者向けのJavaScript基礎講座。変数、関数、オブジェクトから始めて、モダンJavaScriptまで学習します。',
    thumbnail_url: 'https://img.youtube.com/vi/W6NZfCO5SIk/maxresdefault.jpg',
    created_at: '2024-04-01T00:00:00Z',
    updated_at: '2024-04-01T00:00:00Z'
  },
  {
    id: '5',
    title: 'CSS Grid & Flexbox マスター講座',
    description: 'モダンなCSSレイアウト技術であるCSS GridとFlexboxを使いこなして、レスポンシブなWebデザインを作成します。',
    thumbnail_url: 'https://img.youtube.com/vi/jV8B24rSN5o/maxresdefault.jpg',
    created_at: '2024-05-01T00:00:00Z',
    updated_at: '2024-05-01T00:00:00Z'
  },
  {
    id: '6',
    title: 'Node.js & Express API開発',
    description: 'Node.jsとExpressを使ったRESTful API開発の基礎から応用まで。データベース連携やセキュリティも学習します。',
    thumbnail_url: 'https://img.youtube.com/vi/L72fhGm1tfE/maxresdefault.jpg',
    created_at: '2024-06-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z'
  }
]

export default async function CoursesPage() {
  // ユーザー情報を取得
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // データベースから講座を取得
  const { data: dbCourses, error: coursesError } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  // データベースの講座とモックデータを結合
  const courses = [
    ...(dbCourses || []),
    ...mockCourses
  ]

  // エラーハンドリング
  if (coursesError) {
    console.error('講座取得エラー:', coursesError)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">すべての講座</h1>
          <p className="mt-2 text-gray-600">
            プログラミングとAI開発の講座を学習しよう
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <CourseCard
              key={course.id}
              course={course}
              showProgress={!!user}
              userId={user?.id}
              priority={index < 3}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// メタデータ
export const metadata = {
  title: '講座一覧 | HiroCodeオンライン講座',
  description: 'プログラミングとAI開発の講座一覧。React、Next.js、AI開発など様々なテーマの講座を提供しています。'
}

// キャッシュ設定 - データベース更新を確実に反映するため無効化
export const dynamic = 'force-dynamic' // ユーザー固有の進捗データのため