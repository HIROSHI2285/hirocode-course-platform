export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          avatar_url: string | null
          google_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          avatar_url?: string | null
          google_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          google_id?: string | null
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          thumbnail_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          thumbnail_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          thumbnail_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sections: {
        Row: {
          id: string
          course_id: string
          title: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          order_index?: number
          created_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          section_id: string
          title: string
          description: string | null
          youtube_url: string
          duration: number | null
          order_index: number
          is_free: boolean
          created_at: string
        }
        Insert: {
          id?: string
          section_id: string
          title: string
          description?: string | null
          youtube_url: string
          duration?: number | null
          order_index: number
          is_free?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          section_id?: string
          title?: string
          description?: string | null
          youtube_url?: string
          duration?: number | null
          order_index?: number
          is_free?: boolean
          created_at?: string
        }
      }
      user_lesson_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          progress_percentage: number
          completed: boolean
          last_watched_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          progress_percentage?: number
          completed?: boolean
          last_watched_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          progress_percentage?: number
          completed?: boolean
          last_watched_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// アプリケーション用の型定義
export type Course = Database['public']['Tables']['courses']['Row']
export type Section = Database['public']['Tables']['sections']['Row']
export type Lesson = Database['public']['Tables']['lessons']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type UserLessonProgress = Database['public']['Tables']['user_lesson_progress']['Row']

// 結合データ用の型定義
export type CourseWithSections = Course & {
  sections: (Section & {
    lessons: Lesson[]
  })[]
}

export type LessonWithProgress = Lesson & {
  progress?: UserLessonProgress
}