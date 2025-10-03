import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import VideoPlayer from '@/components/features/VideoPlayer'
import type { Course, Section, Lesson } from '@/types/database'

// モックデータ（データベース接続後に削除）
const mockCourse: Course = {
  id: '1',
  title: 'React + Next.js 完全マスター講座',
  description: 'Reactの基礎からNext.jsを使った本格的なWebアプリケーション開発まで学べます。',
  thumbnail_url: null,
  created_at: '2024-01-15T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z'
}

const mockLessons: Lesson[] = [
  {
    id: '1',
    section_id: '1',
    title: 'Reactとは何か？',
    description: 'Reactの基本概念と特徴について学習します。コンポーネント指向開発の考え方や、仮想DOMの仕組みについて詳しく解説します。',
    youtube_url: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
    duration: 600,
    order_index: 1,
    is_free: true,
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    section_id: '1',
    title: 'JSXの基本',
    description: 'JSXの書き方と基本的なルールを学習します。HTMLとの違いや、JavaScriptの埋め込み方法について学びます。',
    youtube_url: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
    duration: 720,
    order_index: 2,
    is_free: false,
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    section_id: '2',
    title: 'App Routerの使い方',
    description: 'Next.js 13以降のApp Routerの使い方を学習します。ファイルベースルーティングやレイアウトの概念について学びます。',
    youtube_url: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
    duration: 900,
    order_index: 1,
    is_free: false,
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '4',
    section_id: '2',
    title: 'サーバーコンポーネント',
    description: 'Server ComponentsとClient Componentsの違いと使い分けについて学習します。',
    youtube_url: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
    duration: 800,
    order_index: 2,
    is_free: false,
    created_at: '2024-01-15T00:00:00Z'
  }
]

const mockSections: Section[] = [
  {
    id: '1',
    course_id: '1',
    title: 'React基礎編',
    order_index: 1,
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    course_id: '1',
    title: 'Next.js応用編',
    order_index: 2,
    created_at: '2024-01-15T00:00:00Z'
  }
]

interface LessonPageProps {
  params: Promise<{ id: string; lessonId: string }>
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours > 0) {
    return `${hours}時間${remainingMinutes}分`
  }
  return `${minutes}分`
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id, lessonId } = await params
  const supabase = await createClient()

  // 認証チェック
  const { data: { user } } = await supabase.auth.getUser()

  // データベースからコース、レッスン、セクション情報を取得
  const { data: courseData, error: courseError } = await supabase
    .from('courses')
    .select(`
      *,
      sections(
        *,
        lessons(*)
      )
    `)
    .eq('id', id)
    .single()

  // データベースにない場合はモックデータ（id=1のみ）を確認
  if (courseError || !courseData) {
    if (id !== '1') {
      notFound()
    }

    // モックデータを使用
    const lesson = mockLessons.find(l => l.id === lessonId)
    if (!lesson) {
      notFound()
    }

    // 無料レッスン以外は認証が必要
    if (!lesson.is_free && !user) {
      redirect('/login')
    }

    const course = mockCourse
    const currentSection = mockSections.find(s => s.id === lesson.section_id)
    const currentLessonIndex = mockLessons.findIndex(l => l.id === lessonId)
    const nextLesson = mockLessons[currentLessonIndex + 1]
    const prevLesson = mockLessons[currentLessonIndex - 1]

    return renderLessonPage({
      course,
      lesson,
      currentSection,
      nextLesson,
      prevLesson,
      allLessons: mockLessons,
      user,
      id,
      lessonId
    })
  }

  // データベースからのデータを使用
  const course = courseData
  const sections = courseData.sections.map((section: any) => ({
    ...section,
    lessons: section.lessons.sort((a: any, b: any) => a.order_index - b.order_index)
  })).sort((a: any, b: any) => a.order_index - b.order_index)

  // すべてのレッスンを順序付きでフラット化
  const allLessons = sections.flatMap((section: any) => section.lessons)

  // 現在のレッスンを取得
  const lesson = allLessons.find((l: any) => l.id === lessonId)
  if (!lesson) {
    notFound()
  }

  // 無料レッスン以外は認証が必要
  if (!lesson.is_free && !user) {
    redirect('/login')
  }

  // 現在のセクションを取得
  const currentSection = sections.find((s: any) => s.id === lesson.section_id)

  // 前後のレッスンを取得
  const currentLessonIndex = allLessons.findIndex((l: any) => l.id === lessonId)
  const nextLesson = allLessons[currentLessonIndex + 1]
  const prevLesson = allLessons[currentLessonIndex - 1]

  return renderLessonPage({
    course,
    lesson,
    currentSection,
    nextLesson,
    prevLesson,
    allLessons,
    user,
    id,
    lessonId
  })
}

function renderLessonPage({
  course,
  lesson,
  currentSection,
  nextLesson,
  prevLesson,
  allLessons,
  user,
  id,
  lessonId
}: {
  course: Course
  lesson: Lesson
  currentSection?: Section
  nextLesson?: Lesson
  prevLesson?: Lesson
  allLessons: Lesson[]
  user: any
  id: string
  lessonId: string
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-blue-600">
                HiroCodeオンライン講座
              </Link>
              <span className="text-gray-400">/</span>
              <Link href={`/courses/${id}`} className="text-gray-600 hover:text-blue-600">
                {course.title}
              </Link>
            </div>
            <div className="flex items-center">
              {user ? (
                <span className="text-sm text-gray-700">
                  {user.email}
                </span>
              ) : (
                <Button size="sm" asChild>
                  <Link href="/login">ログイン</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* メインコンテンツ */}
          <div className="lg:col-span-3">
            {/* 動画プレーヤー */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <VideoPlayer youtubeUrl={lesson.youtube_url} lessonId={lesson.id} userId={user?.id} />
            </div>

            {/* レッスン情報 */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="default">{currentSection?.title}</Badge>
                  {lesson.is_free && (
                    <Badge variant="success">無料</Badge>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatDuration(lesson.duration || 0)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(lesson.created_at).toLocaleDateString('ja-JP')}</span>
                  </div>
                </div>
              </div>
              {lesson.description && (
                <p className="text-gray-600 leading-relaxed">{lesson.description}</p>
              )}
            </div>

            {/* ナビゲーション */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between">
                <div>
                  {prevLesson ? (
                    <Button variant="outline" asChild>
                      <Link href={`/courses/${id}/lessons/${prevLesson.id}`}>
                        ← 前のレッスン
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" disabled>
                      ← 前のレッスン
                    </Button>
                  )}
                </div>

                <div>
                  {nextLesson ? (
                    nextLesson.is_free || user ? (
                      <Button asChild>
                        <Link href={`/courses/${id}/lessons/${nextLesson.id}`}>
                          次のレッスン →
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild>
                        <Link href="/login">
                          ログインして次へ →
                        </Link>
                      </Button>
                    )
                  ) : (
                    <Button disabled>
                      次のレッスン →
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* サイドバー */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">レッスン一覧</h3>

              <div className="space-y-1">
                {allLessons.map((l, index) => (
                  <div
                    key={l.id}
                    className={`p-3 rounded-lg transition-colors ${
                      l.id === lessonId
                        ? 'bg-blue-50 border-blue-200 border'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <Link
                      href={`/courses/${id}/lessons/${l.id}`}
                      className={`block ${
                        l.id === lessonId ? 'text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium text-gray-500">
                            {index + 1}
                          </span>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">{l.title}</span>
                              {l.is_free && (
                                <Badge variant="success">無料</Badge>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDuration(l.duration || 0)}
                            </span>
                          </div>
                        </div>

                        {l.id === lessonId && (
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/courses/${id}`}>
                    講座詳細に戻る
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// メタデータ
export async function generateMetadata({ params }: LessonPageProps) {
  const { id, lessonId } = await params

  // データベースからレッスン情報を取得
  const supabase = await createClient()
  const { data: lessonData } = await supabase
    .from('lessons')
    .select(`
      title,
      description,
      sections!inner(
        course_id,
        courses(title)
      )
    `)
    .eq('id', lessonId)
    .single()

  if (lessonData) {
    const section = lessonData.sections as any
    const courses = section?.courses
    const courseTitle = Array.isArray(courses) ? courses[0]?.title : courses?.title
    return {
      title: `${lessonData.title} | ${courseTitle || 'HiroCodeオンライン講座'}`,
      description: lessonData.description || `${lessonData.title}のレッスンページです。`
    }
  }

  // フォールバック（モックデータ）
  const lesson = mockLessons.find(l => l.id === lessonId)

  if (!lesson) {
    return {
      title: 'レッスンが見つかりません | HiroCodeオンライン講座'
    }
  }

  return {
    title: `${lesson.title} | HiroCodeオンライン講座`,
    description: lesson.description
  }
}

// レッスン詳細ページのキャッシュ設定
