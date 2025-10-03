'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'

export async function addVideo(formData: FormData) {
  await requireAdmin()

  const courseId = formData.get('courseId') as string
  const sectionTitle = formData.get('sectionTitle') as string
  const videoTitle = formData.get('videoTitle') as string
  const videoDescription = formData.get('videoDescription') as string
  const youtubeUrl = formData.get('youtubeUrl') as string
  const duration = parseInt(formData.get('duration') as string) || 0
  const isFree = formData.get('isFree') === 'on'

  if (!courseId || !sectionTitle || !videoTitle || !youtubeUrl) {
    throw new Error('必須項目が入力されていません')
  }

  const supabase = await createClient()

  try {
    // セクションが存在するかチェック、なければ作成
    let section = null
    const { data: existingSection } = await supabase
      .from('sections')
      .select('*')
      .eq('course_id', courseId)
      .eq('title', sectionTitle)
      .single()

    if (existingSection) {
      section = existingSection
    } else {
      // 新しいセクションの order_index を取得
      const { data: sectionsCount } = await supabase
        .from('sections')
        .select('order_index')
        .eq('course_id', courseId)
        .order('order_index', { ascending: false })
        .limit(1)

      const nextOrderIndex = sectionsCount && sectionsCount.length > 0
        ? sectionsCount[0].order_index + 1
        : 1

      // セクションを作成
      const { data: newSection, error: sectionError } = await supabase
        .from('sections')
        .insert([{
          course_id: courseId,
          title: sectionTitle,
          order_index: nextOrderIndex
        }])
        .select()
        .single()

      if (sectionError) {
        throw new Error(`セクション作成エラー: ${sectionError.message}`)
      }
      section = newSection
    }

    // レッスンの order_index を取得
    const { data: lessonsCount } = await supabase
      .from('lessons')
      .select('order_index')
      .eq('section_id', section.id)
      .order('order_index', { ascending: false })
      .limit(1)

    const nextLessonOrderIndex = lessonsCount && lessonsCount.length > 0
      ? lessonsCount[0].order_index + 1
      : 1

    // レッスンを作成
    const { error: lessonError } = await supabase
      .from('lessons')
      .insert([{
        section_id: section.id,
        title: videoTitle,
        description: videoDescription || null,
        youtube_url: youtubeUrl,
        duration: duration * 60, // 分を秒に変換
        order_index: nextLessonOrderIndex,
        is_free: isFree
      }])

    if (lessonError) {
      throw new Error(`レッスン作成エラー: ${lessonError.message}`)
    }

    revalidatePath(`/admin/courses/${courseId}/videos`)
    redirect(`/admin/courses/${courseId}/videos`)

  } catch (error) {
    console.error('動画追加エラー:', error)
    throw new Error(error instanceof Error ? error.message : '動画の追加に失敗しました')
  }
}

export async function updateLesson(formData: FormData) {
  await requireAdmin()

  const lessonId = formData.get('lessonId') as string
  const courseId = formData.get('courseId') as string
  const videoTitle = formData.get('videoTitle') as string
  const videoDescription = formData.get('videoDescription') as string
  const youtubeUrl = formData.get('youtubeUrl') as string
  const duration = parseInt(formData.get('duration') as string) || 0
  const isFree = formData.get('isFree') === 'on'

  if (!lessonId || !courseId || !videoTitle || !youtubeUrl) {
    throw new Error('必須項目が入力されていません')
  }

  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('lessons')
      .update({
        title: videoTitle,
        description: videoDescription || null,
        youtube_url: youtubeUrl,
        duration: duration * 60, // 分を秒に変換
        is_free: isFree
      })
      .eq('id', lessonId)

    if (error) {
      throw new Error(`レッスン更新エラー: ${error.message}`)
    }

    revalidatePath(`/admin/courses/${courseId}/videos`)
    return { success: true, message: '動画が正常に更新されました' }

  } catch (error) {
    console.error('動画更新エラー:', error)
    throw new Error(error instanceof Error ? error.message : '動画の更新に失敗しました')
  }
}

export async function deleteLesson(formData: FormData) {
  await requireAdmin()

  const lessonId = formData.get('lessonId') as string
  const courseId = formData.get('courseId') as string

  if (!lessonId || !courseId) {
    throw new Error('必須項目が入力されていません')
  }

  const supabase = await createClient()

  try {
    // まず進捗データを削除
    await supabase
      .from('user_lesson_progress')
      .delete()
      .eq('lesson_id', lessonId)

    // レッスンを削除
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId)

    if (error) {
      throw new Error(`レッスン削除エラー: ${error.message}`)
    }

    revalidatePath(`/admin/courses/${courseId}/videos`)
    return { success: true, message: '動画が正常に削除されました' }

  } catch (error) {
    console.error('動画削除エラー:', error)
    throw new Error(error instanceof Error ? error.message : '動画の削除に失敗しました')
  }
}