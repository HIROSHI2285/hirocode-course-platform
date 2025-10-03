'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import Button from '@/components/ui/Button'
import SearchBar from '@/components/features/SearchBar'
import { logout } from '@/app/(auth)/logout/actions'

interface HeaderProps {
  onMobileMenuToggle?: () => void
  isMobileMenuOpen?: boolean
  isMobile?: boolean
}

export default function Header({ onMobileMenuToggle, isMobileMenuOpen, isMobile }: HeaderProps) {
  const { user, loading, isAdmin, signOut } = useAuth()

  // デバッグ用ログ
  console.log('Header - user:', user?.id, 'user object:', !!user)
  console.log('Header - isAdmin:', isAdmin)
  console.log('Header - loading:', loading)
  console.log('Header - condition check: loading?', loading, 'user?', !!user)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {/* モバイルメニューボタン */}
            {isMobile && (
              <button
                onClick={onMobileMenuToggle}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
                aria-label="メニューを開く"
              >
                <svg
                  className={`w-6 h-6 transition-transform ${
                    isMobileMenuOpen ? 'rotate-90' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}

            {/* ロゴ - Udemy風シンプル */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                HiroCode
              </span>
            </Link>
          </div>

          {/* 検索バー */}
          <div className="flex-1 max-w-md mx-4 lg:mx-8">
            <Suspense fallback={<div className="h-10 bg-gray-100 rounded-lg animate-pulse" />}>
              <SearchBar size="sm" placeholder="講座やレッスンを検索..." />
            </Suspense>
          </div>

          {/* ナビゲーション */}
          <nav className="hidden md:flex space-x-1">
            <Link
              href="/courses"
              className="px-4 py-2 text-gray-700 hover:text-purple-600 font-medium"
            >
              講座一覧
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className="px-4 py-2 text-gray-700 hover:text-purple-600 font-medium"
              >
                ダッシュボード
              </Link>
            )}
            {user && !loading && isAdmin && (
              <Link
                href="/admin"
                className="px-4 py-2 text-gray-700 hover:text-purple-600 font-medium"
              >
                管理画面
              </Link>
            )}
          </nav>

          {/* 認証状態 */}
          <div className="flex items-center space-x-3">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="w-16 h-4 bg-gray-200 rounded hidden sm:block"></div>
              </div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                {console.log('Rendering logged in user section')}
                <Link
                  href="/settings"
                  className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
                  title="設定"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
                {user.user_metadata?.avatar_url && (
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt={user.user_metadata?.full_name || 'User'}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {user.user_metadata?.full_name || 'ユーザー'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {user.email}
                  </span>
                </div>
                <form action={logout}>
                  <Button
                    type="submit"
                    size="sm"
                    variant="ghost"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    ログアウト
                  </Button>
                </form>
              </div>
            ) : (
              <>
                {console.log('Rendering login button')}
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  asChild
                >
                  <Link href="/login">
                    ログイン
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}