import { createClient } from '@/lib/supabase/server'
import { sanitizeImageUrl } from '@/lib/image-utils'

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
  const supabase = await createClient()

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
  const supabase = await createClient()

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
    const lesson = progress.lessons as any
    const section = lesson.sections
    const course = section.courses
    if (!courseMap.has(course.id)) {
      courseMap.set(course.id, {
        courseId: course.id,
        title: course.title,
        thumbnailUrl: sanitizeImageUrl(course.thumbnail_url) || undefined,
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