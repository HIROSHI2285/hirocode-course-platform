# 06. 視聴進捗管理・表示

## 概要
ユーザーの学習進捗を管理し、講座一覧や詳細ページで進捗状況を可視化する機能を実装する。モチベーション向上のための進捗表示を提供。

## 優先度
**中（Phase 2 - UX向上）**

## 関連技術
- Supabase Database
- React Hooks
- Chart.js / Recharts
- Next.js Server Components

## 前提条件
- [05-youtube-video-player.md](./05-youtube-video-player.md) が完了していること

## 作業内容

### 進捗管理機能の実装
- [ ] 進捗データの管理ロジック
- [ ] 講座全体の進捗計算
- [ ] セクション別進捗表示
- [ ] 進捗統計ダッシュボード

## 実装ファイル

### 進捗計算ユーティリティ
```typescript
// lib/progress.ts
import { createClient } from '@/lib/supabase/server'

export interface CourseProgress {
  courseId: string
  totalLessons: number
  completedLessons: number
  progressPercentage: number
  sections: SectionProgress[]
}

export interface SectionProgress {
  sectionId: string
  sectionTitle: string
  totalLessons: number
  completedLessons: number
  progressPercentage: number
  lessons: LessonProgress[]
}

export interface LessonProgress {
  lessonId: string
  lessonTitle: string
  completed: boolean
  progressPercentage: number
  lastWatchedAt?: string
}

export async function getCourseProgress(
  courseId: string,
  userId: string
): Promise<CourseProgress | null> {
  const supabase = createClient()

  // コース情報とセクション、レッスンを取得
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      sections!inner (
        id,
        title,
        order_index,
        lessons!inner (
          id,
          title,
          order_index
        )
      )
    `)
    .eq('id', courseId)
    .single()

  if (courseError || !course) {
    return null
  }

  // ユーザーの進捗データを取得
  const { data: progressData } = await supabase
    .from('user_lesson_progress')
    .select('lesson_id, progress_percentage, completed, last_watched_at')
    .eq('user_id', userId)

  const progressMap = new Map(
    progressData?.map(p => [p.lesson_id, p]) || []
  )

  let totalLessons = 0
  let completedLessons = 0
  const sections: SectionProgress[] = []

  for (const section of course.sections.sort((a, b) => a.order_index - b.order_index)) {
    const lessons: LessonProgress[] = []
    let sectionCompletedLessons = 0

    for (const lesson of section.lessons.sort((a, b) => a.order_index - b.order_index)) {
      const progress = progressMap.get(lesson.id)
      const completed = progress?.completed || false

      lessons.push({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        completed,
        progressPercentage: progress?.progress_percentage || 0,
        lastWatchedAt: progress?.last_watched_at,
      })

      totalLessons++
      if (completed) {
        completedLessons++
        sectionCompletedLessons++
      }
    }

    sections.push({
      sectionId: section.id,
      sectionTitle: section.title,
      totalLessons: section.lessons.length,
      completedLessons: sectionCompletedLessons,
      progressPercentage: section.lessons.length > 0
        ? Math.round((sectionCompletedLessons / section.lessons.length) * 100)
        : 0,
      lessons,
    })
  }

  return {
    courseId,
    totalLessons,
    completedLessons,
    progressPercentage: totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0,
    sections,
  }
}

export async function getUserOverallProgress(userId: string) {
  const supabase = createClient()

  // ユーザーが進捗のあるコース一覧を取得
  const { data: progressData } = await supabase
    .from('user_lesson_progress')
    .select(`
      lesson_id,
      completed,
      lessons!inner (
        section_id,
        sections!inner (
          course_id,
          courses!inner (
            id,
            title,
            thumbnail_url
          )
        )
      )
    `)
    .eq('user_id', userId)

  if (!progressData) return []

  // コース別に進捗をグループ化
  const courseMap = new Map()

  for (const progress of progressData) {
    const course = progress.lessons.sections.courses
    if (!courseMap.has(course.id)) {
      courseMap.set(course.id, {
        courseId: course.id,
        title: course.title,
        thumbnailUrl: course.thumbnail_url,
        totalLessons: 0,
        completedLessons: 0,
      })
    }

    const courseData = courseMap.get(course.id)
    courseData.totalLessons++
    if (progress.completed) {
      courseData.completedLessons++
    }
  }

  return Array.from(courseMap.values()).map(course => ({
    ...course,
    progressPercentage: Math.round((course.completedLessons / course.totalLessons) * 100)
  }))
}
```

### 講座進捗表示コンポーネント
```tsx
// components/features/CourseProgress.tsx
'use client'

import { useEffect, useState } from 'react'
import { CourseProgress as CourseProgressType } from '@/lib/progress'

interface CourseProgressProps {
  courseProgress: CourseProgressType
  showDetails?: boolean
}

export default function CourseProgress({
  courseProgress,
  showDetails = false
}: CourseProgressProps) {
  const { totalLessons, completedLessons, progressPercentage, sections } = courseProgress

  return (
    <div className="space-y-4">
      {/* 全体進捗 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">講座の進捗</h3>
          <span className="text-2xl font-bold text-blue-600">
            {progressPercentage}%
          </span>
        </div>

        {/* 進捗バー */}
        <div className="mb-4">
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            完了: {completedLessons}/{totalLessons} レッスン
          </span>
          {progressPercentage === 100 && (
            <span className="text-green-600 font-semibold flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              完了！
            </span>
          )}
        </div>
      </div>

      {/* セクション別進捗（詳細表示時） */}
      {showDetails && (
        <div className="space-y-3">
          <h4 className="text-md font-semibold">セクション別進捗</h4>
          {sections.map((section) => (
            <div key={section.sectionId} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium">{section.sectionTitle}</h5>
                <span className="text-sm font-semibold text-blue-600">
                  {section.progressPercentage}%
                </span>
              </div>

              <div className="mb-2">
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all duration-300"
                    style={{ width: `${section.progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>
                  {section.completedLessons}/{section.totalLessons} レッスン
                </span>
                {section.progressPercentage === 100 && (
                  <span className="text-green-600">✓ 完了</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### 進捗ダッシュボード
```tsx
// app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserOverallProgress } from '@/lib/progress'
import ProgressDashboard from '@/components/features/ProgressDashboard'

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login?redirect=/dashboard')
  }

  const overallProgress = await getUserOverallProgress(user.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">学習ダッシュボード</h1>

      <ProgressDashboard
        userId={user.id}
        overallProgress={overallProgress}
      />
    </div>
  )
}

// 認証が必要なページのため
export const revalidate = 0

export const metadata = {
  title: '学習ダッシュボード | HiroCodeオンライン講座',
  description: 'あなたの学習進捗を確認できます'
}
```

### 進捗ダッシュボードコンポーネント
```tsx
// components/features/ProgressDashboard.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import ProgressChart from './ProgressChart'

interface CourseProgressSummary {
  courseId: string
  title: string
  thumbnailUrl?: string
  totalLessons: number
  completedLessons: number
  progressPercentage: number
}

interface ProgressDashboardProps {
  userId: string
  overallProgress: CourseProgressSummary[]
}

export default function ProgressDashboard({
  userId,
  overallProgress
}: ProgressDashboardProps) {
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalLessons: 0,
    completedLessons: 0,
  })

  useEffect(() => {
    const totalCourses = overallProgress.length
    const completedCourses = overallProgress.filter(
      course => course.progressPercentage === 100
    ).length
    const totalLessons = overallProgress.reduce(
      (sum, course) => sum + course.totalLessons, 0
    )
    const completedLessons = overallProgress.reduce(
      (sum, course) => sum + course.completedLessons, 0
    )

    setStats({
      totalCourses,
      completedCourses,
      totalLessons,
      completedLessons,
    })
  }, [overallProgress])

  return (
    <div className="space-y-8">
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="受講中講座"
          value={stats.totalCourses}
          icon="📚"
          color="blue"
        />
        <StatCard
          title="完了講座"
          value={stats.completedCourses}
          icon="✅"
          color="green"
        />
        <StatCard
          title="総レッスン数"
          value={stats.totalLessons}
          icon="📖"
          color="purple"
        />
        <StatCard
          title="完了レッスン"
          value={stats.completedLessons}
          icon="🎯"
          color="orange"
        />
      </div>

      {/* 進捗チャート */}
      {overallProgress.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">講座別進捗</h2>
          <ProgressChart data={overallProgress} />
        </div>
      )}

      {/* コース別進捗 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">受講中の講座</h2>
        </div>

        {overallProgress.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {overallProgress
              .sort((a, b) => b.progressPercentage - a.progressPercentage)
              .map((course) => (
                <div key={course.courseId} className="p-6">
                  <Link
                    href={`/courses/${course.courseId}`}
                    className="block group"
                  >
                    <div className="flex items-start space-x-4">
                      {/* サムネイル */}
                      {course.thumbnailUrl && (
                        <div className="flex-shrink-0">
                          <Image
                            src={course.thumbnailUrl}
                            alt={course.title}
                            width={80}
                            height={60}
                            className="rounded-lg object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium group-hover:text-blue-600 transition-colors">
                          {course.title}
                        </h3>

                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">
                              進捗: {course.completedLessons}/{course.totalLessons} レッスン
                            </span>
                            <span className="text-sm font-semibold text-blue-600">
                              {course.progressPercentage}%
                            </span>
                          </div>

                          <div className="bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                course.progressPercentage === 100
                                  ? 'bg-green-500'
                                  : 'bg-blue-500'
                              }`}
                              style={{ width: `${course.progressPercentage}%` }}
                            />
                          </div>
                        </div>

                        {course.progressPercentage === 100 && (
                          <div className="mt-2 flex items-center text-green-600 text-sm font-semibold">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            講座完了！
                          </div>
                        )}
                      </div>

                      {/* 矢印 */}
                      <div className="flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <p>まだ受講を開始した講座がありません</p>
            <Link
              href="/courses"
              className="inline-block mt-4 text-blue-600 hover:underline"
            >
              講座一覧を見る →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

// 統計カードコンポーネント
function StatCard({
  title,
  value,
  icon,
  color
}: {
  title: string
  value: number
  icon: string
  color: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-600',
    green: 'bg-green-500 text-green-600',
    purple: 'bg-purple-500 text-purple-600',
    orange: 'bg-orange-500 text-orange-600',
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg bg-opacity-10 ${colorClasses[color].split(' ')[0]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-semibold ${colorClasses[color].split(' ')[1]}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}
```

### 進捗チャートコンポーネント
```tsx
// components/features/ProgressChart.tsx
'use client'

import { useMemo } from 'react'

interface CourseProgressData {
  courseId: string
  title: string
  progressPercentage: number
}

interface ProgressChartProps {
  data: CourseProgressData[]
}

export default function ProgressChart({ data }: ProgressChartProps) {
  const chartData = useMemo(() => {
    return data.map(course => ({
      ...course,
      title: course.title.length > 20
        ? `${course.title.substring(0, 20)}...`
        : course.title
    }))
  }, [data])

  const maxProgress = Math.max(...data.map(d => d.progressPercentage))
  const scale = maxProgress > 0 ? 100 / maxProgress : 1

  return (
    <div className="space-y-4">
      {chartData.map((course, index) => (
        <div key={course.courseId} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {course.title}
            </span>
            <span className="text-sm font-semibold text-blue-600">
              {course.progressPercentage}%
            </span>
          </div>

          <div className="relative">
            <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  course.progressPercentage === 100
                    ? 'bg-green-500'
                    : 'bg-gradient-to-r from-blue-400 to-blue-600'
                }`}
                style={{
                  width: `${course.progressPercentage}%`,
                  animationDelay: `${index * 100}ms`
                }}
              />
            </div>

            {course.progressPercentage === 100 && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      ))}

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          進捗データがありません
        </div>
      )}
    </div>
  )
}
```

### 講座カードの進捗表示更新
```tsx
// components/features/CourseCard.tsx（進捗表示付き）
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'

interface Course {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
}

interface CourseCardProps {
  course: Course
  showProgress?: boolean
  userId?: string
}

export default async function CourseCard({
  course,
  showProgress = false,
  userId
}: CourseCardProps) {
  let progressData = null

  // 進捗表示が有効で、ユーザーIDがある場合は進捗を取得
  if (showProgress && userId) {
    const supabase = createClient()

    const { data } = await supabase
      .from('user_lesson_progress')
      .select(`
        lesson_id,
        completed,
        lessons!inner (
          section_id,
          sections!inner (
            course_id
          )
        )
      `)
      .eq('user_id', userId)
      .eq('lessons.sections.course_id', course.id)

    if (data && data.length > 0) {
      const completedLessons = data.filter(p => p.completed).length
      const totalLessons = data.length

      progressData = {
        completed: completedLessons,
        total: totalLessons,
        percentage: Math.round((completedLessons / totalLessons) * 100)
      }
    }
  }

  return (
    <Link href={`/courses/${course.id}`} className="block group">
      <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
        {/* サムネイル */}
        <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
          {course.thumbnail_url ? (
            <Image
              src={course.thumbnail_url}
              alt={course.title}
              width={400}
              height={225}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
              <span className="text-white text-4xl">📚</span>
            </div>
          )}
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors">
            {course.title}
          </h3>

          {course.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {course.description}
            </p>
          )}

          {/* 進捗表示 */}
          {progressData && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  進捗: {progressData.completed}/{progressData.total} レッスン
                </span>
                <span className="text-sm font-semibold text-blue-600">
                  {progressData.percentage}%
                </span>
              </div>

              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    progressData.percentage === 100
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${progressData.percentage}%` }}
                />
              </div>

              {progressData.percentage === 100 && (
                <div className="mt-2 flex items-center text-green-600 text-sm font-semibold">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  完了！
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
```

## タスクリスト

### ユーティリティ実装
- [×] `lib/progress.ts` を作成

### 進捗表示コンポーネント作成
- [×] `components/features/CourseProgress.tsx` を作成
- [×] `components/features/ProgressDashboard.tsx` を作成
- [×] `components/features/ProgressChart.tsx` を作成

### ダッシュボードページ作成
- [×] `app/dashboard/page.tsx` を作成

### 既存コンポーネント更新
- [×] `components/features/CourseCard.tsx` を更新（進捗表示追加）

### ナビゲーション更新
- [×] ヘッダーにダッシュボードリンクを追加

## 完了条件
- [×] 講座全体の進捗が正確に計算される
- [×] セクション別進捗が正常に表示される
- [×] 進捗ダッシュボードが正常に機能する
- [×] 進捗チャートが適切に表示される
- [×] 講座カードに進捗が表示される

## 注意事項
- 進捗計算は正確性を重視する
- パフォーマンスを考慮したデータ取得を行う
- 進捗データのキャッシング戦略を検討する
- ユーザー体験を向上させる視覚的フィードバックを提供
- レスポンシブデザインを考慮する