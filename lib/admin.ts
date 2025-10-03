import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * 管理者権限が必要なページで呼び出す関数
 * 認証されていない、または管理者権限がない場合はリダイレクト
 */
export async function requireAdmin() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login?redirect=/admin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/')
  }

  return { user, profile }
}

/**
 * 指定されたユーザーIDの管理者ステータスをチェック
 */
export async function checkAdminStatus(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single()

  return profile?.is_admin || false
}

/**
 * 現在のユーザーが管理者かどうかをチェック（認証なしでも使用可能）
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    return await checkAdminStatus(user.id)
  } catch {
    return false
  }
}

/**
 * メールアドレスが管理者かどうかを簡易チェック
 * 実際の本番環境ではデータベースのis_adminフラグを使用すべき
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false

  // サンプル実装：特定のメールアドレスを管理者として設定
  const adminEmails = [
    'admin@hirocode.com',
    'support@hirocode.com',
    // 開発用
    'test@example.com'
  ]

  return adminEmails.includes(email.toLowerCase())
}

/**
 * 管理者用の統計データを取得
 */
export async function getAdminStats() {
  await requireAdmin()

  const supabase = await createClient()

  const [
    { count: coursesCount },
    { count: sectionsCount },
    { count: lessonsCount },
    { count: usersCount }
  ] = await Promise.all([
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('sections').select('*', { count: 'exact', head: true }),
    supabase.from('lessons').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true })
  ])

  return {
    totalCourses: coursesCount || 0,
    totalSections: sectionsCount || 0,
    totalLessons: lessonsCount || 0,
    totalUsers: usersCount || 0
  }
}