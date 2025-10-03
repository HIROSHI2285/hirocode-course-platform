# 03. 基本画面実装

## 概要
HiroCodeオンライン講座プラットフォームの基本的なページ構成を実装する。講座一覧、講座詳細、レッスン視聴ページを作成。

## 優先度
**高（Phase 1 - MVP Core）**

## 関連技術
- Next.js App Router
- Server Components
- Client Components
- Tailwind CSS

## 前提条件
- [01-environment-setup.md](./01-environment-setup.md) が完了していること
- [02-supabase-client-setup.md](./02-supabase-client-setup.md) が完了していること

## 作業内容

### ページ構成の作成
- [x] ホームページの更新
- [x] 講座一覧ページの実装
- [x] 講座詳細ページの実装
- [x] レッスン視聴ページの実装
- [x] 基本的なレイアウトコンポーネントの作成

## ディレクトリ構造

```
app/
├── page.tsx                    # ホームページ
├── courses/
│   ├── page.tsx               # 講座一覧
│   └── [id]/
│       ├── page.tsx           # 講座詳細
│       └── lessons/
│           └── [lessonId]/
│               └── page.tsx   # レッスン視聴
components/
├── ui/                        # 基本UIコンポーネント
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Badge.tsx
├── features/                  # 機能固有コンポーネント
│   ├── CourseCard.tsx
│   ├── CourseHero.tsx
│   ├── LessonList.tsx
│   └── VideoPlayer.tsx
└── layout/                    # レイアウトコンポーネント
    ├── Header.tsx
    ├── Footer.tsx
    └── Sidebar.tsx
```

## 実装ファイル

### ホームページ更新
```tsx
// app/page.tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CourseCard from '@/components/features/CourseCard'

export default async function HomePage() {
  const supabase = createClient()

  // 人気講座を取得（最初の3件）
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .limit(3)

  return (
    <div className="min-h-screen">
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            HiroCodeオンライン講座
          </h1>
          <p className="text-xl mb-8">
            プログラミングとAI開発を学ぼう
          </p>
          <Link
            href="/courses"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            講座を見る
          </Link>
        </div>
      </section>

      {/* 人気講座セクション */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">人気の講座</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses?.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/courses"
              className="text-blue-600 font-semibold hover:underline"
            >
              すべての講座を見る →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
```

### 講座一覧ページ
```tsx
// app/courses/page.tsx
import { createClient } from '@/lib/supabase/server'
import CourseCard from '@/components/features/CourseCard'

export default async function CoursesPage() {
  const supabase = createClient()

  const { data: courses, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <div>講座の読み込みに失敗しました</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">すべての講座</h1>

      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">講座がまだありません</p>
        </div>
      )}
    </div>
  )
}

// メタデータ
export const metadata = {
  title: '講座一覧 | HiroCodeオンライン講座',
  description: 'プログラミングとAI開発の講座一覧'
}
```

### 講座詳細ページ
```tsx
// app/courses/[id]/page.tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CourseHero from '@/components/features/CourseHero'
import LessonList from '@/components/features/LessonList'

interface CoursePageProps {
  params: { id: string }
}

export default async function CoursePage({ params }: CoursePageProps) {
  const supabase = createClient()

  // 講座情報を取得
  const { data: course, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !course) {
    notFound()
  }

  // セクションとレッスンを取得
  const { data: sections } = await supabase
    .from('sections')
    .select(`
      *,
      lessons (*)
    `)
    .eq('course_id', params.id)
    .order('order_index')

  // 現在のユーザーの認証状態を確認
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen">
      <CourseHero course={course} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2">
            <div className="prose max-w-none">
              <h2>講座について</h2>
              <p>{course.description}</p>
            </div>
          </div>

          {/* サイドバー（レッスンリスト） */}
          <div className="lg:col-span-1">
            <LessonList
              sections={sections || []}
              courseId={course.id}
              isAuthenticated={!!user}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// 動的メタデータ
export async function generateMetadata({ params }: CoursePageProps) {
  const supabase = createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('title, description')
    .eq('id', params.id)
    .single()

  return {
    title: course?.title ? `${course.title} | HiroCodeオンライン講座` : '講座詳細',
    description: course?.description || '講座詳細ページ'
  }
}
```

### レッスン視聴ページ
```tsx
// app/courses/[id]/lessons/[lessonId]/page.tsx
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import VideoPlayer from '@/components/features/VideoPlayer'
import LessonList from '@/components/features/LessonList'

interface LessonPageProps {
  params: { id: string; lessonId: string }
}

export default async function LessonPage({ params }: LessonPageProps) {
  const supabase = createClient()

  // レッスン情報を取得
  const { data: lesson, error } = await supabase
    .from('lessons')
    .select(`
      *,
      sections!inner (
        course_id,
        courses (*)
      )
    `)
    .eq('id', params.lessonId)
    .single()

  if (error || !lesson) {
    notFound()
  }

  // 講座IDの整合性チェック
  if (lesson.sections.course_id !== params.id) {
    notFound()
  }

  // ユーザー認証チェック
  const { data: { user } } = await supabase.auth.getUser()

  // 無料レッスン以外は認証必須
  if (!lesson.is_free && !user) {
    redirect(`/login?redirect=/courses/${params.id}/lessons/${params.lessonId}`)
  }

  // コースのセクション一覧を取得
  const { data: sections } = await supabase
    .from('sections')
    .select(`
      *,
      lessons (*)
    `)
    .eq('course_id', params.id)
    .order('order_index')

  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-4 h-screen">
        {/* メインコンテンツ */}
        <div className="lg:col-span-3 flex flex-col">
          {/* 動画プレーヤー */}
          <div className="flex-1">
            <VideoPlayer
              youtubeUrl={lesson.youtube_url}
              lessonId={lesson.id}
              userId={user?.id}
            />
          </div>

          {/* レッスン情報 */}
          <div className="p-6 border-t">
            <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
            {lesson.description && (
              <p className="text-gray-600">{lesson.description}</p>
            )}
          </div>
        </div>

        {/* サイドバー（レッスンリスト） */}
        <div className="lg:col-span-1 border-l bg-gray-50 overflow-y-auto">
          <LessonList
            sections={sections || []}
            courseId={params.id}
            currentLessonId={params.lessonId}
            isAuthenticated={!!user}
          />
        </div>
      </div>
    </div>
  )
}

// キャッシュ無効化（認証状態に依存するため）
export const revalidate = 0

export async function generateMetadata({ params }: LessonPageProps) {
  const supabase = createClient()

  const { data: lesson } = await supabase
    .from('lessons')
    .select(`
      title,
      sections!inner (
        courses (title)
      )
    `)
    .eq('id', params.lessonId)
    .single()

  return {
    title: lesson ?
      `${lesson.title} | ${lesson.sections.courses.title}` :
      'レッスン',
  }
}
```

## タスクリスト

### ページファイル作成
- [x] `app/page.tsx` を更新
- [x] `app/courses/page.tsx` を作成
- [x] `app/courses/[id]/page.tsx` を作成
- [x] `app/courses/[id]/lessons/[lessonId]/page.tsx` を作成

### 基本コンポーネント作成
- [x] `components/ui/Button.tsx` を作成
- [x] `components/ui/Card.tsx` を作成
- [x] `components/ui/Badge.tsx` を作成

### 機能コンポーネント作成
- [x] `components/features/CourseCard.tsx` を作成
- [x] `components/features/CourseHero.tsx` を作成
- [x] `components/features/LessonList.tsx` を作成
- [x] `components/features/VideoPlayer.tsx` を作成（基本版）

### スタイリング
- [x] 各ページのレスポンシブデザイン対応
- [x] 一貫性のあるカラーパレットの適用
- [x] ローディング状態の実装

## 完了条件
- [x] すべてのページが正常に表示される
- [x] データベースからデータが正しく取得できる
- [x] 認証状態に応じてコンテンツが適切に制御される
- [x] レスポンシブデザインが実装されている
- [x] TypeScriptエラーがない

## 注意事項
- Server Componentでデータフェッチを行う
- 認証が必要なページでは適切にリダイレクト処理を実装
- メタデータは動的に生成する
- エラーハンドリングを適切に実装
- パフォーマンスを考慮したデータ取得を行う