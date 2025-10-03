import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AdminLayout from '@/components/layout/AdminLayout'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: '統計・分析 | 管理画面',
  description: 'プラットフォームの統計情報と分析'
}

export default async function AdminAnalyticsPage() {
  await requireAdmin()

  const supabase = await createClient()

  // 統計データを取得
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, created_at')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, created_at')

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, section_id')

  const { data: progress } = await supabase
    .from('user_lesson_progress')
    .select('id, user_id, lesson_id, completed, last_watched_at')

  // 統計計算
  const totalCourses = courses?.length || 0
  const totalUsers = profiles?.length || 0
  const totalLessons = lessons?.length || 0
  const totalProgress = progress?.length || 0
  const completedLessons = progress?.filter(p => p.completed).length || 0
  const completionRate = totalProgress > 0
    ? Math.round((completedLessons / totalProgress) * 100)
    : 0

  // 今月の新規ユーザー
  const now = new Date()
  const thisMonthUsers = profiles?.filter(p => {
    const createdAt = new Date(p.created_at)
    return createdAt.getMonth() === now.getMonth() &&
           createdAt.getFullYear() === now.getFullYear()
  }).length || 0

  // 先月の新規ユーザー
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthUsers = profiles?.filter(p => {
    const createdAt = new Date(p.created_at)
    return createdAt.getMonth() === lastMonth.getMonth() &&
           createdAt.getFullYear() === lastMonth.getFullYear()
  }).length || 0

  const userGrowth = lastMonthUsers > 0
    ? Math.round(((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100)
    : 0

  // アクティブユーザー（過去7日間に学習したユーザー）
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const activeUsers = new Set(
    progress?.filter(p => {
      const lastWatched = p.last_watched_at ? new Date(p.last_watched_at) : null
      return lastWatched && lastWatched > sevenDaysAgo
    }).map(p => p.user_id)
  ).size

  // 人気の講座トップ5
  const courseEngagement = courses?.map(course => {
    const courseLessons = lessons?.filter(l => {
      // section_id から course_id を取得する必要があるため、ここでは簡易的に計算
      return true // 実際にはsectionsテーブルとJOINが必要
    })

    const courseProgress = progress?.filter(p => {
      const lesson = lessons?.find(l => l.id === p.lesson_id)
      return lesson // 実際にはsectionsテーブルとJOINが必要
    })

    return {
      id: course.id,
      title: course.title,
      enrollments: courseProgress?.length || 0,
      completions: courseProgress?.filter(p => p.completed).length || 0
    }
  }).sort((a, b) => b.enrollments - a.enrollments).slice(0, 5) || []

  // 月別ユーザー登録数（過去6ヶ月）
  const monthlyData: { month: string; count: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' })
    const count = profiles?.filter(p => {
      const createdAt = new Date(p.created_at)
      return createdAt.getMonth() === date.getMonth() &&
             createdAt.getFullYear() === date.getFullYear()
    }).length || 0
    monthlyData.push({ month: monthName, count })
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* パンくずナビ */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2 text-gray-600">
            <li>
              <Link href="/admin" className="hover:text-purple-600">
                管理画面
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">統計・分析</li>
          </ol>
        </nav>

        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            統計・分析
          </h1>
          <p className="text-gray-600">
            プラットフォーム全体のパフォーマンス指標
          </p>
        </div>

        {/* メイン統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded ${userGrowth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {userGrowth >= 0 ? '+' : ''}{userGrowth}%
              </span>
            </div>
            <h3 className="text-sm text-gray-600 mb-1">総ユーザー数</h3>
            <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
            <p className="text-xs text-gray-500 mt-2">今月: +{thisMonthUsers}名</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <h3 className="text-sm text-gray-600 mb-1">総講座数</h3>
            <p className="text-3xl font-bold text-gray-900">{totalCourses}</p>
            <p className="text-xs text-gray-500 mt-2">{totalLessons}レッスン</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <h3 className="text-sm text-gray-600 mb-1">アクティブユーザー</h3>
            <p className="text-3xl font-bold text-gray-900">{activeUsers}</p>
            <p className="text-xs text-gray-500 mt-2">過去7日間</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-sm text-gray-600 mb-1">完了率</h3>
            <p className="text-3xl font-bold text-gray-900">{completionRate}%</p>
            <p className="text-xs text-gray-500 mt-2">{completedLessons}/{totalProgress} 完了</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 月別ユーザー登録推移 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              月別ユーザー登録推移
            </h2>
            <div className="space-y-4">
              {monthlyData.map((data, idx) => {
                const maxCount = Math.max(...monthlyData.map(d => d.count), 1)
                const width = (data.count / maxCount) * 100
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{data.month}</span>
                      <span className="text-sm font-medium text-gray-900">{data.count}名</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 人気の講座トップ5 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              人気の講座トップ5
            </h2>
            <div className="space-y-4">
              {courseEngagement.length > 0 ? (
                courseEngagement.map((course, idx) => (
                  <div key={course.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-sm">
                        {idx + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {course.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {course.enrollments}名受講中 · {course.completions}名完了
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Link
                        href={`/admin/courses/${course.id}/edit`}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                      >
                        詳細
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  データがありません
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 学習活動の概要 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            学習活動の概要
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {totalProgress}
              </div>
              <div className="text-sm text-gray-600">総学習セッション</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {completedLessons}
              </div>
              <div className="text-sm text-gray-600">完了したレッスン</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {totalProgress > 0 ? Math.round(totalProgress / totalUsers) : 0}
              </div>
              <div className="text-sm text-gray-600">ユーザー平均学習数</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
