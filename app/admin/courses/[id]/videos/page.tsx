import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/layout/AdminLayout'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { addVideo, updateLesson, deleteLesson } from './actions'
import VideoManagementForm from './VideoManagementForm'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

export default async function CourseVideosPage({ params }: PageProps) {
  await requireAdmin()

  const { id } = await params
  const supabase = await createClient()

  // 講座情報を取得
  const { data: course } = await supabase
    .from('courses')
    .select('id, title')
    .eq('id', id)
    .single()

  if (!course) {
    notFound()
  }

  // セクションとレッスンを取得
  const { data: sections } = await supabase
    .from('sections')
    .select(`
      id,
      title,
      order_index,
      lessons (
        id,
        title,
        description,
        youtube_url,
        duration,
        order_index,
        is_free
      )
    `)
    .eq('course_id', id)
    .order('order_index')

  return (
    <AdminLayout>
      <div className="p-8">
        {/* パンくずナビゲーション */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                ダッシュボード
              </Link>
            </li>
            <li>
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li>
              <Link href="/admin/courses" className="text-gray-500 hover:text-gray-700">
                講座管理
              </Link>
            </li>
            <li>
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li>
              <span className="text-gray-900 font-medium">動画管理</span>
            </li>
          </ol>
        </nav>
        {/* ページヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">動画管理</h1>
          <p className="text-gray-600 mt-2">第1章: {course.title} の動画を管理します</p>
        </div>

        {/* 新規動画追加フォーム */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">新規動画追加</h2>

          <form action={addVideo} className="space-y-6">
            <input type="hidden" name="courseId" value={id} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  セクションタイトル
                </label>
                <input
                  type="text"
                  name="sectionTitle"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="例: 第1章: 基礎編"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  動画タイトル
                </label>
                <input
                  type="text"
                  name="videoTitle"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="例: Claude Code入門"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                動画説明
              </label>
              <textarea
                name="videoDescription"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="動画の説明を入力してください"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube URL
                </label>
                <input
                  type="url"
                  name="youtubeUrl"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://youtu.be/a1-1471voo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  動画時間（分）
                </label>
                <input
                  type="number"
                  name="duration"
                  min="1"
                  className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="10"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_free"
                name="isFree"
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="is_free" className="ml-2 text-sm font-medium text-gray-700">
                無料で公開する
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium whitespace-nowrap flex-shrink-0"
              >
                追加
              </button>
            </div>
          </form>
        </div>

        {/* 動画一覧 */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">動画一覧</h3>
          </div>

          {/* テーブルヘッダー */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
              <div className="col-span-1">番号</div>
              <div className="col-span-5">動画タイトル</div>
              <div className="col-span-2 text-center">YouTube URL</div>
              <div className="col-span-2 text-center">動画</div>
              <div className="col-span-1 text-center">無料</div>
              <div className="col-span-1 text-center">操作</div>
            </div>
          </div>

          {/* 動画一覧 */}
          <div className="divide-y divide-gray-200">
            {(!sections || sections.length === 0) ? (
              <div className="p-8 text-center text-gray-500">
                動画がまだ追加されていません。上のフォームから動画を追加してください。
              </div>
            ) : (
              sections.map((section) => (
                <div key={section.id}>
                  {/* セクションヘッダー */}
                  <div className="bg-blue-50 px-6 py-3 border-b border-gray-200">
                    <h3 className="text-md font-semibold text-blue-900">
                      {section.title} ({section.lessons.length}動画)
                    </h3>
                  </div>

                  {/* セクション内の動画一覧 */}
                  {section.lessons.map((lesson, lessonIndex) => (
                    <VideoManagementForm
                      key={lesson.id}
                      lesson={lesson}
                      courseId={id}
                      lessonIndex={lessonIndex}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}