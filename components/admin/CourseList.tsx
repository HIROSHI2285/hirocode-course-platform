'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { sanitizeImageUrl } from '@/lib/image-utils'

interface Course {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  created_at: string
  lesson_count: number
  section_count: number
}

interface CourseListProps {
  courses: Course[]
  onDelete: (courseId: string, title: string) => Promise<void>
}

export default function CourseList({ courses, onDelete }: CourseListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (courseId: string, title: string) => {
    if (!confirm(`講座「${title}」を削除しますか？この操作は取り消せません。`)) {
      return
    }

    setDeletingId(courseId)
    try {
      await onDelete(courseId, title)
    } catch (error) {
      console.error('削除エラー:', error)
      alert('削除に失敗しました')
    } finally {
      setDeletingId(null)
    }
  }

  // 有効な画像URLかチェック（example.comは除外）
  const isValidImageUrl = (url: string | null) => {
    return url && !url.includes('example.com') && (url.startsWith('https://') || url.startsWith('http://'))
  }

  // プレースホルダー画像を生成
  const getPlaceholderImage = (title: string) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-orange-500 to-orange-600',
      'bg-gradient-to-br from-pink-500 to-pink-600'
    ]
    const colorIndex = title.length % colors.length
    return colors[colorIndex]
  }

  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">講座がありません</h3>
        <p className="text-gray-600 mb-4">新しい講座を作成してみましょう</p>
        <Link
          href="/admin/courses/new"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          講座を作成
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* テーブルヘッダー */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
          <div className="col-span-1">講座名</div>
          <div className="col-span-5"></div>
          <div className="col-span-2 text-center">セクション数</div>
          <div className="col-span-2 text-center">動画数</div>
          <div className="col-span-2 text-center">作成日</div>
        </div>
      </div>

      {/* 講座一覧 */}
      <div className="divide-y divide-gray-200">
        {courses.map((course) => (
          <div key={course.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* サムネイルと講座情報 */}
              <div className="col-span-6 flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {isValidImageUrl(course.thumbnail_url) ? (
                    <Image
                      src={sanitizeImageUrl(course.thumbnail_url) || ''}
                      alt={course.title}
                      width={64}
                      height={64}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <div className={`w-16 h-16 ${getPlaceholderImage(course.title)} rounded-lg flex items-center justify-center`}>
                      <div className="text-center text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {course.description}
                    </p>
                  )}
                </div>
              </div>

              {/* セクション数 */}
              <div className="col-span-2 text-center">
                <span className="text-lg font-semibold text-gray-900">
                  {course.section_count}
                </span>
              </div>

              {/* 動画数 */}
              <div className="col-span-2 text-center">
                <span className="text-lg font-semibold text-gray-900">
                  {course.lesson_count}
                </span>
              </div>

              {/* 作成日 */}
              <div className="col-span-2 text-center text-sm text-gray-600">
                {new Date(course.created_at).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                })}
                <div className="flex justify-center space-x-1 mt-2">
                  <Link
                    href={`/admin/courses/${course.id}/edit`}
                    className="bg-purple-100 text-purple-600 px-3 py-1 rounded text-xs font-medium hover:bg-purple-200 transition-colors"
                  >
                    編集
                  </Link>
                  <Link
                    href={`/admin/courses/${course.id}/videos`}
                    className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                  >
                    動画管理
                  </Link>
                  <button
                    onClick={() => handleDelete(course.id, course.title)}
                    disabled={deletingId === course.id}
                    className="bg-red-100 text-red-600 px-3 py-1 rounded text-xs font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}