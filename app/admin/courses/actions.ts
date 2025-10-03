'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { revalidatePath } from 'next/cache'
import {
  courseSchema,
  courseUpdateSchema,
  courseDeleteSchema,
  uuidSchema,
  validateData,
  ValidationError,
  checkRateLimit,
  RateLimitError,
  sanitizeInput
} from '@/lib/validation'
import { headers } from 'next/headers'

// レート制限のヘルパー関数
async function getRateLimitKey(): Promise<string> {
  const headersList = await headers()
  const forwarded = headersList.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || 'unknown'
  return `admin_actions_${ip}`
}

export async function createCourse(formData: FormData) {
  try {
    // レート制限チェック（管理者操作: 5回/分）
    const rateLimitKey = await getRateLimitKey()
    if (!checkRateLimit(rateLimitKey, 5, 60000)) {
      throw new RateLimitError()
    }

    // 管理者権限チェック
    await requireAdmin()

    // 入力データの取得とサニタイゼーション
    const rawData = {
      title: sanitizeInput(formData.get('title')),
      description: sanitizeInput(formData.get('description')),
      thumbnail_url: sanitizeInput(formData.get('thumbnail_url'))
    }

    // 入力検証
    const validatedData = validateData(courseSchema, rawData)

    const supabase = await createClient()

    const { error } = await supabase
      .from('courses')
      .insert({
        title: validatedData.title,
        description: validatedData.description || null,
        thumbnail_url: validatedData.thumbnail_url || null,
      })

    if (error) {
      console.error('Course creation error:', error)
      throw new Error(`講座の作成に失敗しました: ${error.message}`)
    }

    revalidatePath('/admin/courses')
    revalidatePath('/courses')

    return { success: true, message: '講座が正常に作成されました' }
  } catch (error) {
    if (error instanceof ValidationError) {
      const errorMessages = error.errors.errors.map(e => e.message).join(', ')
      return { success: false, error: `入力エラー: ${errorMessages}` }
    }
    if (error instanceof RateLimitError) {
      return { success: false, error: error.message }
    }
    console.error('Unexpected error in createCourse:', error)
    return { success: false, error: '予期しないエラーが発生しました' }
  }
}

export async function updateCourse(formData: FormData) {
  try {
    // レート制限チェック
    const rateLimitKey = await getRateLimitKey()
    if (!checkRateLimit(rateLimitKey, 5, 60000)) {
      throw new RateLimitError()
    }

    // 管理者権限チェック
    await requireAdmin()

    // 入力データの取得とサニタイゼーション
    const rawData = {
      id: sanitizeInput(formData.get('id')),
      title: sanitizeInput(formData.get('title')),
      description: sanitizeInput(formData.get('description')),
      thumbnail_url: sanitizeInput(formData.get('thumbnail_url'))
    }

    // 入力検証
    const validatedData = validateData(courseUpdateSchema, rawData)

    const supabase = await createClient()

    const { error } = await supabase
      .from('courses')
      .update({
        title: validatedData.title,
        description: validatedData.description || null,
        thumbnail_url: validatedData.thumbnail_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatedData.id)

    if (error) {
      console.error('Course update error:', error)
      throw new Error(`講座の更新に失敗しました: ${error.message}`)
    }

    revalidatePath('/admin/courses')
    revalidatePath(`/courses/${validatedData.id}`)
    revalidatePath('/courses')

    return { success: true, message: '講座が正常に更新されました' }
  } catch (error) {
    if (error instanceof ValidationError) {
      const errorMessages = error.errors.errors.map(e => e.message).join(', ')
      return { success: false, error: `入力エラー: ${errorMessages}` }
    }
    if (error instanceof RateLimitError) {
      return { success: false, error: error.message }
    }
    console.error('Unexpected error in updateCourse:', error)
    return { success: false, error: '予期しないエラーが発生しました' }
  }
}

export async function deleteCourse(formData: FormData) {
  try {
    // レート制限チェック（削除操作はより厳格に: 3回/分）
    const rateLimitKey = await getRateLimitKey()
    if (!checkRateLimit(rateLimitKey + '_delete', 3, 60000)) {
      throw new RateLimitError()
    }

    // 管理者権限チェック
    await requireAdmin()

    // 入力データの取得とサニタイゼーション
    const rawData = {
      id: sanitizeInput(formData.get('id'))
    }

    // 入力検証
    const validatedData = validateData(courseDeleteSchema, rawData)

    const supabase = await createClient()

    // 関連するセクションとレッスンも CASCADE で削除される
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', validatedData.id)

    if (error) {
      console.error('Course deletion error:', error)
      throw new Error(`講座の削除に失敗しました: ${error.message}`)
    }

    revalidatePath('/admin/courses')
    revalidatePath('/courses')

    return { success: true, message: '講座が正常に削除されました' }
  } catch (error) {
    if (error instanceof ValidationError) {
      const errorMessages = error.errors.errors.map(e => e.message).join(', ')
      return { success: false, error: `入力エラー: ${errorMessages}` }
    }
    if (error instanceof RateLimitError) {
      return { success: false, error: error.message }
    }
    console.error('Unexpected error in deleteCourse:', error)
    return { success: false, error: '予期しないエラーが発生しました' }
  }
}

export async function getCourseWithStats(courseId: string) {
  try {
    // 管理者権限チェック
    await requireAdmin()

    // 入力検証
    const validatedId = validateData(uuidSchema, courseId)

    const supabase = await createClient()

    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        *,
        sections (
          id,
          title,
          order_index,
          lessons (
            id,
            title,
            order_index
          )
        )
      `)
      .eq('id', validatedId)
      .single()

    if (error || !course) {
      throw new Error('講座が見つかりません')
    }

    // 統計情報を追加
    const sectionCount = course.sections.length
    const lessonCount = course.sections.reduce(
      (total: number, section: any) => total + section.lessons.length, 0
    )

    return {
      ...course,
      section_count: sectionCount,
      lesson_count: lessonCount
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      const errorMessages = error.errors.errors.map(e => e.message).join(', ')
      throw new Error(`入力エラー: ${errorMessages}`)
    }
    console.error('Unexpected error in getCourseWithStats:', error)
    throw new Error('予期しないエラーが発生しました')
  }
}