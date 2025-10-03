import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import CourseList from '@/components/admin/CourseList'
import { deleteCourse } from './actions'
import AdminLayout from '@/components/layout/AdminLayout'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminCoursesPage() {
  await requireAdmin()

  const supabase = await createClient()

  const { data: courses } = await supabase
    .from('courses')
    .select(`
      *,
      sections (
        id,
        lessons (id)
      )
    `)
    .order('created_at', { ascending: false })

  // 講座にレッスン数を追加
  const coursesWithStats = courses?.map(course => ({
    ...course,
    lesson_count: course.sections.reduce(
      (total: number, section: any) => total + section.lessons.length, 0
    ),
    section_count: course.sections.length
  })) || []

  const handleDeleteCourse = async (courseId: string) => {
    'use server'
    const formData = new FormData()
    formData.append('id', courseId)
    await deleteCourse(formData)
  }

  return (
    <AdminLayout>
      <div className="p-8">
        {/* ページヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">講座管理</h1>
            <p className="text-gray-600 mt-2">講座の作成・編集・削除を行います</p>
          </div>
          <Link
            href="/admin/courses/new"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 font-medium"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>新規講座作成</span>
          </Link>
        </div>

        <CourseList courses={coursesWithStats} onDelete={handleDeleteCourse} />
      </div>
    </AdminLayout>
  )
}