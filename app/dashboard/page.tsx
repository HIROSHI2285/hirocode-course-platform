import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserOverallProgress } from '@/lib/progress'
import ProgressDashboard from '@/components/features/ProgressDashboard'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login?redirect=/dashboard')
  }

  const overallProgress = await getUserOverallProgress(user.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">学習ダッシュボード</h1>

      <ProgressDashboard
        userId={user.id}
        overallProgress={overallProgress}
      />
    </div>
  )
}

export const metadata = {
  title: '学習ダッシュボード | HiroCodeオンライン講座',
  description: 'あなたの学習進捗を確認できます'
}