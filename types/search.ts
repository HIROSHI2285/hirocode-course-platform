export interface SearchFilters {
  category?: string
  duration?: 'short' | 'medium' | 'long' // 短時間、中時間、長時間
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  isFree?: boolean
}

export interface SearchResult {
  courses: CourseSearchResult[]
  lessons: LessonSearchResult[]
  totalResults: number
}

export interface CourseSearchResult {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  category?: string
  lesson_count: number
  total_duration: number
  created_at: string
}

export interface LessonSearchResult {
  id: string
  title: string
  description: string | null
  course_title: string
  course_id: string
  section_title: string
  duration: number | null
  is_free: boolean
}