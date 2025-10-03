import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import AdminLayout from '@/components/layout/AdminLayout'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'ユーザー管理 | 管理画面',
  description: '登録ユーザーの管理'
}

export default async function AdminUsersPage() {
  await requireAdmin()

  const supabase = await createClient()

  // ユーザー一覧を取得
  const { data: profiles } = await supabase
    .from('profiles')
    .select(`
      id,
      avatar_url,
      google_id,
      created_at,
      updated_at
    `)
    .order('created_at', { ascending: false })

  // 各ユーザーの進捗情報を取得
  const usersWithStats = await Promise.all(
    (profiles || []).map(async (profile) => {
      // auth.usersからメール情報を取得
      const { data: authUser } = await supabase.auth.admin.getUserById(profile.id)

      // 進捗データを取得
      const { data: progressData } = await supabase
        .from('user_lesson_progress')
        .select('id, completed')
        .eq('user_id', profile.id)

      const totalLessons = progressData?.length || 0
      const completedLessons = progressData?.filter(p => p.completed).length || 0

      return {
        ...profile,
        email: authUser?.user?.email || 'N/A',
        full_name: authUser?.user?.user_metadata?.full_name || 'N/A',
        totalLessons,
        completedLessons,
        progressPercentage: totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0
      }
    })
  )

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
            <li className="text-gray-900 font-medium">ユーザー管理</li>
          </ol>
        </nav>

        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ユーザー管理
            </h1>
            <p className="text-gray-600">
              全{usersWithStats.length}名のユーザー
            </p>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">総ユーザー数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {usersWithStats.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">アクティブユーザー</p>
                <p className="text-2xl font-bold text-gray-900">
                  {usersWithStats.filter(u => u.totalLessons > 0).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">平均進捗率</p>
                <p className="text-2xl font-bold text-gray-900">
                  {usersWithStats.length > 0
                    ? Math.round(
                        usersWithStats.reduce((sum, u) => sum + u.progressPercentage, 0) /
                        usersWithStats.length
                      )
                    : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">今月の新規</p>
                <p className="text-2xl font-bold text-gray-900">
                  {usersWithStats.filter(u => {
                    const createdAt = new Date(u.created_at)
                    const now = new Date()
                    return createdAt.getMonth() === now.getMonth() &&
                           createdAt.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ユーザー一覧テーブル */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ユーザー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    メールアドレス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    登録日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    学習進捗
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    進捗率
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usersWithStats.map((userProfile) => (
                  <tr key={userProfile.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {userProfile.avatar_url ? (
                            <Image
                              src={userProfile.avatar_url}
                              alt={userProfile.full_name}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-gray-600 font-medium text-sm">
                                {userProfile.full_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {userProfile.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {userProfile.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{userProfile.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(userProfile.created_at).toLocaleDateString('ja-JP')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {userProfile.completedLessons} / {userProfile.totalLessons} レッスン
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 max-w-xs">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${userProfile.progressPercentage}%` }}
                            />
                          </div>
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-900">
                          {userProfile.progressPercentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {usersWithStats.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                ユーザーがいません
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                登録されているユーザーがありません
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
