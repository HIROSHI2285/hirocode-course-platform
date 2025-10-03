import { createClient } from '@/lib/supabase/server'
import type {
  SearchFilters,
  SearchResult,
  CourseSearchResult,
  LessonSearchResult
} from '@/types/search'

// Re-export types for backward compatibility
export type {
  SearchFilters,
  SearchResult,
  CourseSearchResult,
  LessonSearchResult
}

export async function searchContent(
  query: string,
  filters: SearchFilters = {},
  limit: number = 20
): Promise<SearchResult> {
  const supabase = await createClient()

  // 講座の検索（シンプルなilike検索から開始）
  let coursesQuery = supabase
    .from('courses')
    .select(`
      id,
      title,
      description,
      thumbnail_url,
      created_at,
      sections (
        lessons (
          id,
          duration
        )
      )
    `)

  // テキスト検索
  if (query.trim()) {
    coursesQuery = coursesQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
  }

  const { data: coursesRaw } = await coursesQuery.limit(limit)

  // 講座データの整形
  const courses: CourseSearchResult[] = (coursesRaw || []).map(course => {
    const lessons = course.sections.flatMap(s => s.lessons)
    const totalDuration = lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0)

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail_url: course.thumbnail_url,
      lesson_count: lessons.length,
      total_duration: totalDuration,
      created_at: course.created_at,
    }
  })

  // レッスンの検索
  let lessonsQuery = supabase
    .from('lessons')
    .select(`
      id,
      title,
      description,
      duration,
      is_free,
      sections!inner (
        title,
        courses!inner (
          id,
          title
        )
      )
    `)

  if (query.trim()) {
    lessonsQuery = lessonsQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
  }

  // 無料フィルター
  if (filters.isFree !== undefined) {
    lessonsQuery = lessonsQuery.eq('is_free', filters.isFree)
  }

  const { data: lessonsRaw } = await lessonsQuery.limit(limit)

  // レッスンデータの整形
  const lessons: LessonSearchResult[] = (lessonsRaw || []).map(lesson => {
    const section = lesson.sections as any
    const course = section.courses
    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      course_title: course.title,
      course_id: course.id,
      section_title: section.title,
      duration: lesson.duration,
      is_free: lesson.is_free,
    }
  })

  return {
    courses,
    lessons,
    totalResults: courses.length + lessons.length
  }
}

export async function getSearchSuggestions(query: string): Promise<string[]> {
  if (query.length < 2) return []

  const supabase = await createClient()

  const { data: courses } = await supabase
    .from('courses')
    .select('title')
    .ilike('title', `%${query}%`)
    .limit(5)

  const { data: lessons } = await supabase
    .from('lessons')
    .select('title')
    .ilike('title', `%${query}%`)
    .limit(3)

  const suggestions = [
    ...(courses || []).map(c => c.title),
    ...(lessons || []).map(l => l.title),
  ]

  return [...new Set(suggestions)].slice(0, 8)
}

export async function getCategories() {
  const supabase = await createClient()

  // カテゴリテーブルが存在しない場合のフォールバック
  try {
    const { data } = await supabase
      .from('course_categories')
      .select('*')
      .order('name')

    return data || []
  } catch (error) {
    // カテゴリテーブルが存在しない場合は空配列を返す
    console.log('カテゴリテーブルが存在しません。後でデータベーススキーマを実行してください。')
    return []
  }
}