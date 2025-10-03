// データベースクエリ最適化ユーティリティ

import { createClient } from '@/lib/supabase/server'
import type { Course } from '@/types/database'

/**
 * 講座データとサムネイル情報を一括取得（N+1クエリ問題の解決）
 */
export async function getAllCoursesWithThumbnails(): Promise<{
  courses: Course[]
  thumbnails: Record<string, string>
  error?: string
}> {
  const supabase = await createClient()

  try {
    // 1. 全講座を取得
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    if (coursesError) {
      console.error('講座取得エラー:', coursesError)
      return { courses: [], thumbnails: {}, error: coursesError.message }
    }

    if (!courses || courses.length === 0) {
      return { courses: [], thumbnails: {} }
    }

    // 2. 全講座の最初のレッスンを一括取得
    const courseIds = courses.map(course => course.id)

    const { data: sectionsWithLessons, error: lessonsError } = await supabase
      .from('sections')
      .select(`
        course_id,
        order_index,
        lessons!inner (
          youtube_url,
          order_index
        )
      `)
      .in('course_id', courseIds)
      .order('order_index', { ascending: true })

    if (lessonsError) {
      console.error('レッスン取得エラー:', lessonsError)
      return { courses, thumbnails: {}, error: lessonsError.message }
    }

    // 3. 各講座の最初のYouTube URLを特定
    const thumbnails: Record<string, string> = {}

    if (sectionsWithLessons) {
      // 講座ごとにグループ化
      const courseGrouped = sectionsWithLessons.reduce((acc, section) => {
        const courseId = section.course_id
        if (!acc[courseId]) {
          acc[courseId] = []
        }
        acc[courseId].push(section)
        return acc
      }, {} as Record<string, any[]>)

      // 各講座の最初のYouTube URLを取得
      Object.entries(courseGrouped).forEach(([courseId, sections]) => {
        // セクションを order_index でソート
        const sortedSections = sections.sort((a, b) => a.order_index - b.order_index)

        for (const section of sortedSections) {
          if (section.lessons && section.lessons.length > 0) {
            // レッスンを order_index でソート
            const sortedLessons = section.lessons.sort((a: any, b: any) => a.order_index - b.order_index)
            const firstLesson = sortedLessons[0]

            if (firstLesson.youtube_url) {
              // YouTube URLからビデオIDを抽出
              const videoId = extractYouTubeVideoId(firstLesson.youtube_url)
              if (videoId) {
                thumbnails[courseId] = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                break // 最初のYouTube URLが見つかったら次の講座へ
              }
            }
          }
        }
      })
    }

    return { courses, thumbnails }

  } catch (error) {
    console.error('バッチクエリエラー:', error)
    return {
      courses: [],
      thumbnails: {},
      error: error instanceof Error ? error.message : '不明なエラー'
    }
  }
}

/**
 * ユーザーの全講座進捗を一括取得
 */
export async function getAllUserProgress(userId: string): Promise<{
  progressData: Record<string, {
    completed: number
    total: number
    percentage: number
  }>
  error?: string
}> {
  const supabase = await createClient()

  try {
    const { data: progressList, error } = await supabase
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

    if (error) {
      console.error('進捗取得エラー:', error)
      return { progressData: {}, error: error.message }
    }

    if (!progressList || progressList.length === 0) {
      return { progressData: {} }
    }

    // 講座ごとに進捗を集計
    const progressData: Record<string, {
      completed: number
      total: number
      percentage: number
    }> = {}

    progressList.forEach((progress: any) => {
      const courseId = progress.lessons.sections.course_id

      if (!progressData[courseId]) {
        progressData[courseId] = {
          completed: 0,
          total: 0,
          percentage: 0
        }
      }

      progressData[courseId].total++
      if (progress.completed) {
        progressData[courseId].completed++
      }
    })

    // パーセンテージを計算
    Object.keys(progressData).forEach(courseId => {
      const data = progressData[courseId]
      data.percentage = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
    })

    return { progressData }

  } catch (error) {
    console.error('進捗バッチクエリエラー:', error)
    return {
      progressData: {},
      error: error instanceof Error ? error.message : '不明なエラー'
    }
  }
}

/**
 * YouTube URLからビデオIDを抽出する関数
 */
function extractYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

/**
 * 講座詳細とセクション/レッスン情報を一括取得
 */
export async function getCourseWithContent(courseId: string): Promise<{
  course: Course | null
  sections: any[]
  error?: string
}> {
  const supabase = await createClient()

  try {
    // 講座情報とセクション/レッスンを一括取得
    const { data: course, error: courseError } = await supabase
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
            description,
            youtube_url,
            duration,
            order_index,
            is_free
          )
        )
      `)
      .eq('id', courseId)
      .single()

    if (courseError) {
      console.error('講座詳細取得エラー:', courseError)
      return { course: null, sections: [], error: courseError.message }
    }

    if (!course) {
      return { course: null, sections: [], error: '講座が見つかりません' }
    }

    // セクションとレッスンをソート
    const sortedSections = (course.sections || [])
      .map((section: any) => ({
        ...section,
        lessons: (section.lessons || []).sort((a: any, b: any) => a.order_index - b.order_index)
      }))
      .sort((a: any, b: any) => a.order_index - b.order_index)

    return {
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnail_url: course.thumbnail_url,
        created_at: course.created_at,
        updated_at: course.updated_at
      },
      sections: sortedSections
    }

  } catch (error) {
    console.error('講座詳細バッチクエリエラー:', error)
    return {
      course: null,
      sections: [],
      error: error instanceof Error ? error.message : '不明なエラー'
    }
  }
}