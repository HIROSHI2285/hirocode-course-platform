'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
  requireAdmin?: boolean
}

export default function AuthGuard({
  children,
  redirectTo = '/login',
  requireAdmin = false
}: AuthGuardProps) {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  const redirected = useRef(false)

  useEffect(() => {
    // ローディング中は何もしない
    if (loading) return

    // 既にリダイレクト済みの場合は重複を防ぐ
    if (redirected.current) return

    // 未認証ユーザーの場合
    if (!user) {
      redirected.current = true
      const currentPath = window.location.pathname
      router.push(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`)
      return
    }

    // 管理者権限が必要だが管理者でない場合
    if (requireAdmin && !isAdmin) {
      redirected.current = true
      router.push('/')
      return
    }

    // 認証成功時はリダイレクトフラグをリセット
    redirected.current = false
  }, [user, loading, isAdmin, router, redirectTo, requireAdmin])

  // ローディング中の表示
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  // 未認証またはリダイレクト中
  if (!user || redirected.current) {
    return null
  }

  // 管理者権限が必要だが権限がない場合
  if (requireAdmin && !isAdmin) {
    return null
  }

  return <>{children}</>
}