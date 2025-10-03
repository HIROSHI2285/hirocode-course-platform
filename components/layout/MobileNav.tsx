'use client'

import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { user, signOut } = useAuth()

  const navItems = [
    {
      href: '/',
      label: 'ホーム',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      href: '/courses',
      label: '講座一覧',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      href: '/search',
      label: '検索',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      href: '/dashboard',
      label: 'ダッシュボード',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      authRequired: true
    },
  ]

  return (
    <div
      className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" onClick={onClose} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <h2 className="text-xl font-bold text-blue-600">HiroCode</h2>
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="メニューを閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ナビゲーション */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            if (item.authRequired && !user) return null

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
{item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* ユーザー情報 */}
        {user ? (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              {user.user_metadata.avatar_url && (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata.full_name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="font-medium">{user.user_metadata.full_name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => {
                signOut()
                onClose()
              }}
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              ログアウト
            </button>
          </div>
        ) : (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <Link
              href="/auth/login"
              onClick={onClose}
              className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ログイン
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}