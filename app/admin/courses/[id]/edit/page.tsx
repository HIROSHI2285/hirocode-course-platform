import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import CourseForm from '@/components/admin/CourseForm'
import { updateCourse } from '../../actions'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface EditCoursePageProps {
  params: Promise<{ id: string }>
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  await requireAdmin()

  const { id } = await params
  const supabase = await createClient()

  const { data: course, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !course) {
    notFound()
  }

  const handleUpdateCourse = async (data: { title: string; description: string; thumbnail_url?: string }) => {
    const formData = new FormData()
    formData.append('id', id)
    formData.append('title', data.title)
    formData.append('description', data.description)
    if (data.thumbnail_url) {
      formData.append('thumbnail_url', data.thumbnail_url)
    }
    await updateCourse(formData)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 管理画面ヘッダー */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-xl font-bold text-gray-900">HiroCode Admin</span>
              </Link>
            </div>

            <nav className="flex items-center space-x-6">
              <Link
                href="/admin"
                className="text-gray-700 hover:text-purple-600 font-medium"
              >
                ダッシュボード
              </Link>
              <Link
                href="/admin/courses"
                className="text-purple-600 font-medium"
              >
                講座管理
              </Link>
              <Link
                href="/admin/users"
                className="text-gray-700 hover:text-purple-600 font-medium"
              >
                ユーザー管理
              </Link>
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                サイトに戻る
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          {/* パンくずリスト */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link href="/admin" className="hover:text-gray-900">管理画面</Link>
            <span>/</span>
            <Link href="/admin/courses" className="hover:text-gray-900">講座管理</Link>
            <span>/</span>
            <span className="text-gray-900">編集</span>
          </nav>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">講座を編集</h1>
            <p className="text-gray-600 mt-2">{course.title}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <CourseForm course={course} onSubmit={handleUpdateCourse} />
          </div>
        </div>
      </div>
    </div>
  )
}