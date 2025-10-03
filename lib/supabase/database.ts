import { createClient as createServerClient } from './server'
import { createClient as createBrowserClient } from './client'
import { Database } from '@/types/database'

// データベース操作関数
export class DatabaseService {
  private static instance: DatabaseService

  static getInstance() {
    if (!this.instance) {
      this.instance = new DatabaseService()
    }
    return this.instance
  }

  // Server Component用のクライアント取得
  async getServerClient() {
    return await createServerClient()
  }

  // Client Component用のクライアント取得
  getBrowserClient() {
    return createBrowserClient()
  }

  // 講座一覧を取得
  async getCourses() {
    const supabase = await this.getServerClient()
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching courses:', error)
      return []
    }
    return data
  }

  // 特定の講座を取得（セクション・レッスン含む）
  async getCourseWithSections(courseId: string) {
    const supabase = await this.getServerClient()
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        sections(
          *,
          lessons(*)
        )
      `)
      .eq('id', courseId)
      .single()

    if (error) {
      console.error('Error fetching course with sections:', error)
      return null
    }
    return data
  }

  // ユーザーの進捗を取得
  async getUserProgress(userId: string, lessonId: string) {
    const supabase = await this.getServerClient()
    const { data, error } = await supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching user progress:', error)
      return null
    }
    return data
  }

  // 進捗を更新または作成
  async upsertProgress(userId: string, lessonId: string, progress: number, completed: boolean) {
    const supabase = await this.getServerClient()
    const { data, error } = await supabase
      .from('user_lesson_progress')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        progress_percentage: progress,
        completed: completed,
        last_watched_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error upserting progress:', error)
      return null
    }
    return data
  }
}

// シングルトンインスタンス
export const db = DatabaseService.getInstance()