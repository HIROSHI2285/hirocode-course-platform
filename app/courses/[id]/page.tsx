import { notFound } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/server'
import { getCourseWithContent } from '@/lib/database-utils'
import type { Course, Section, Lesson } from '@/types/database'

// モックデータ（データベース接続後に削除）
const mockCourse: Course = {
  id: '1',
  title: 'React + Next.js 完全マスター講座',
  description: 'Reactの基礎からNext.jsを使った本格的なWebアプリケーション開発まで学べます。TypeScriptも含めて実践的なスキルを身につけましょう。本講座では、モダンなフロントエンド開発に必要な技術を網羅的に学習できます。',
  thumbnail_url: null,
  created_at: '2024-01-15T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z'
}

const mockSections: (Section & { lessons: Lesson[] })[] = [
  {
    id: '1',
    course_id: '1',
    title: 'React基礎編',
    order_index: 1,
    created_at: '2024-01-15T00:00:00Z',
    lessons: [
      {
        id: '1',
        section_id: '1',
        title: 'Reactとは何か？',
        description: 'Reactの基本概念と特徴について学習します',
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
        description: 'JSXの書き方と基本的なルールを学習します',
        youtube_url: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
        duration: 720,
        order_index: 2,
        is_free: false,
        created_at: '2024-01-15T00:00:00Z'
      }
    ]
  },
  {
    id: '2',
    course_id: '1',
    title: 'Next.js応用編',
    order_index: 2,
    created_at: '2024-01-15T00:00:00Z',
    lessons: [
      {
        id: '3',
        section_id: '2',
        title: 'App Routerの使い方',
        description: 'Next.js 13以降のApp Routerの使い方を学習します',
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
        description: 'Server ComponentsとClient Componentsの違いと使い分け',
        youtube_url: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
        duration: 800,
        order_index: 2,
        is_free: false,
        created_at: '2024-01-15T00:00:00Z'
      }
    ]
  }
]

interface CoursePageProps {
  params: Promise<{ id: string }>
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

function renderCoursePage(
  course: Course,
  sections: (Section & { lessons: Lesson[] })[],
  totalLessons: number,
  totalDuration: number,
  id: string
) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                HiroCodeオンライン講座
              </Link>
            </div>
            <div className="flex items-center">
              <Link
                href="/courses"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                講座一覧に戻る
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2">
            {/* 講座概要 */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="mb-4">
                <Badge variant="default">講座</Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
              <p className="text-gray-600 mb-6">{course.description}</p>

              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>{totalLessons}レッスン</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formatDuration(totalDuration)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{new Date(course.created_at).toLocaleDateString('ja-JP')}</span>
                </div>
              </div>

              {sections.length > 0 && sections[0].lessons.length > 0 && (
                <Button size="lg" asChild>
                  <Link href={`/courses/${id}/lessons/${sections[0].lessons[0].id}`}>
                    学習を開始する
                  </Link>
                </Button>
              )}
            </div>

            {/* 講座内容 */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">講座内容</h2>
              </div>

              <div className="divide-y">
                {sections.map((section) => (
                  <div key={section.id} className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {section.title}
                    </h3>

                    <div className="space-y-3">
                      {section.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex flex-row items-center justify-between p-3 rounded-lg hover:bg-gray-50 gap-3"
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="w-8 h-8 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9 4h10a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 flex-wrap">
                                <span className="font-medium text-gray-900 truncate">{lesson.title}</span>
                                {lesson.is_free && (
                                  <Badge variant="success">無料</Badge>
                                )}
                              </div>
                              {lesson.description && (
                                <p className="text-sm text-gray-600 line-clamp-2">{lesson.description}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 flex-shrink-0">
                            {lesson.duration && (
                              <span className="text-sm text-gray-500 hidden sm:inline">
                                {formatDuration(lesson.duration)}
                              </span>
                            )}
                            <Link
                              href={`/courses/${id}/lessons/${lesson.id}`}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap"
                            >
                              再生
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* サイドバー */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>この講座について</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">学習内容</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• プログラミングの基本概念</li>
                      <li>• 実践的な開発手法</li>
                      <li>• モダンな技術スタックの活用</li>
                      <li>• プロジェクト開発のベストプラクティス</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">対象者</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• プログラミング初心者</li>
                      <li>• スキルアップを目指す方</li>
                      <li>• 実践的な開発を学びたい方</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { id } = await params

  // Supabaseからデータを取得
  const supabase = await createClient()
  const { data: courseData, error } = await supabase
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

  // データベースにコースが見つからない場合は、モックデータ（id=1のみ）を確認
  if (error || !courseData) {
    if (id !== '1') {
      notFound()
    }

    // モックデータを使用
    const course = mockCourse
    const sections = mockSections

    const totalLessons = sections.reduce((acc: number, section: any) => acc + section.lessons.length, 0)
    const totalDuration = sections.reduce(
      (acc: number, section: any) => acc + section.lessons.reduce((lessonAcc: number, lesson: any) => lessonAcc + (lesson.duration || 0), 0),
      0
    )

    return renderCoursePage(course, sections, totalLessons, totalDuration, id)
  }

  // データベースからのデータを使用
  const course = courseData
  const sections = courseData.sections.map((section: any) => ({
    ...section,
    lessons: section.lessons.sort((a: any, b: any) => a.order_index - b.order_index)
  })).sort((a: any, b: any) => a.order_index - b.order_index)

  const totalLessons = sections.reduce((acc: number, section: any) => acc + section.lessons.length, 0)
  const totalDuration = sections.reduce(
    (acc: number, section: any) => acc + section.lessons.reduce((lessonAcc: number, lesson: any) => lessonAcc + (lesson.duration || 0), 0),
    0
  )

  return renderCoursePage(course, sections, totalLessons, totalDuration, id)
}

// メタデータ
export async function generateMetadata({ params }: CoursePageProps) {
  const { id } = await params

  // データベースからコース情報を取得
  const supabase = await createClient()
  const { data: course } = await supabase
    .from('courses')
    .select('title, description')
    .eq('id', id)
    .single()

  if (course) {
    return {
      title: `${course.title} | HiroCodeオンライン講座`,
      description: course.description || `${course.title}の詳細ページです。`
    }
  }

  // フォールバック（モックデータ）
  if (id === '1') {
    return {
      title: 'React + Next.js 完全マスター講座 | HiroCodeオンライン講座',
      description: 'Reactの基礎からNext.jsを使った本格的なWebアプリケーション開発まで学べます。'
    }
  }

  return {
    title: '講座詳細 | HiroCodeオンライン講座',
    description: 'オンライン講座の詳細ページです。'
  }
}

// 講座詳細ページのキャッシュ設定
