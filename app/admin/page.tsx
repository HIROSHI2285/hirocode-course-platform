import { requireAdmin } from '@/lib/admin'
import AdminDashboard from '@/components/admin/AdminDashboard'
import AdminLayout from '@/components/layout/AdminLayout'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  await requireAdmin()

  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  )
}

export const metadata = {
  title: '管理画面 | HiroCodeオンライン講座',
  description: 'コンテンツ管理画面'
}