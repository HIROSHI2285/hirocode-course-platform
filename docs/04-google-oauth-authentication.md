# 04. Google OAuth認証機能

## 概要
Google OAuth認証を実装し、ユーザーのサインイン・サインアップ機能を提供する。メールアドレス/パスワード認証は実装せず、Google認証のみとする。

## 優先度
**高（Phase 1 - MVP Core）**

## 関連技術
- Supabase Auth
- Google OAuth 2.0
- Next.js Server Actions
- React Context

## 前提条件
- [01-environment-setup.md](./01-environment-setup.md) が完了していること
- [02-supabase-client-setup.md](./02-supabase-client-setup.md) が完了していること

## 作業内容

### 認証ページの実装
- [x] ログインページの作成
- [x] 認証コールバック処理の実装
- [x] 認証状態管理の実装
- [x] 認証ガードの実装

## ディレクトリ構造

```
app/
├── (auth)/                    # 認証関連のルートグループ
│   ├── login/
│   │   └── page.tsx          # ログインページ
│   └── auth/
│       └── callback/
│           └── route.ts      # 認証コールバック
├── api/
│   └── auth/
│       └── signout/
│           └── route.ts      # サインアウト処理
components/
├── auth/
│   ├── AuthProvider.tsx      # 認証状態管理
│   ├── LoginButton.tsx       # ログインボタン
│   ├── LogoutButton.tsx      # ログアウトボタン
│   └── AuthGuard.tsx         # 認証ガード
└── layout/
    └── Header.tsx            # ヘッダー（認証状態表示）
```

## 実装ファイル

### ログインページ
```tsx
// app/(auth)/login/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginWithGoogle } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string }
}) {
  const supabase = createClient()

  // 既にログイン済みの場合はリダイレクト
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    redirect(searchParams.redirect || '/courses')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            HiroCodeオンライン講座
          </h2>
          <p className="mt-2 text-gray-600">
            Googleアカウントでログインしてください
          </p>
        </div>

        <form action={loginWithGoogle} className="space-y-4">
          <input
            type="hidden"
            name="redirect"
            value={searchParams.redirect || '/courses'}
          />
          <button
            type="submit"
            className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Googleでログイン
          </button>
        </form>

        <p className="text-xs text-center text-gray-500">
          ログインすることで、利用規約とプライバシーポリシーに同意したものとみなします
        </p>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'ログイン | HiroCodeオンライン講座',
  description: 'Googleアカウントでログインしてください'
}
```

### ログイン処理（Server Actions）
```typescript
// app/(auth)/login/actions.ts
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getURL } from '@/lib/utils'

export async function loginWithGoogle(formData: FormData) {
  const supabase = createClient()
  const redirectTo = formData.get('redirect') as string || '/courses'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getURL()}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    console.error('Google OAuth エラー:', error)
    redirect('/login?error=oauth_error')
  }

  if (data.url) {
    redirect(data.url)
  }
}
```

### 認証コールバック処理
```typescript
// app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/courses'

  if (code) {
    const supabase = createClient()

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // 認証成功、指定されたページにリダイレクト
      return NextResponse.redirect(`${origin}${redirect}`)
    } else {
      console.error('認証エラー:', error)
    }
  }

  // エラーの場合はログインページにリダイレクト
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
```

### サインアウト処理
```typescript
// app/api/auth/signout/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('サインアウトエラー:', error)
    return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

### 認証状態管理（Context）
```tsx
// components/auth/AuthProvider.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useState } from 'react'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)

        if (event === 'SIGNED_OUT') {
          router.push('/')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router, supabase])

  const signOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

### 認証ガード
```tsx
// components/auth/AuthGuard.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function AuthGuard({ children, redirectTo = '/login' }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      const currentPath = window.location.pathname
      router.push(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`)
    }
  }, [user, loading, router, redirectTo])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // リダイレクト中
  }

  return <>{children}</>
}
```

### ヘッダーコンポーネント（認証状態表示）
```tsx
// components/layout/Header.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/components/auth/AuthProvider'

export default function Header() {
  const { user, loading, signOut } = useAuth()

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-blue-600">
              HiroCode
            </span>
          </Link>

          {/* ナビゲーション */}
          <nav className="hidden md:flex space-x-6">
            <Link
              href="/courses"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              講座一覧
            </Link>
          </nav>

          {/* 認証状態 */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              </div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                {user.user_metadata.avatar_url && (
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt={user.user_metadata.full_name || 'User'}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <span className="text-sm text-gray-700">
                  {user.user_metadata.full_name}
                </span>
                <button
                  onClick={signOut}
                  className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ログイン
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
```

### ルートレイアウトの更新
```tsx
// app/layout.tsx（認証プロバイダーを追加）
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth/AuthProvider";
import Header from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HiroCodeオンライン講座",
  description: "プログラミングとAI開発を学ぼう",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### ユーティリティ関数
```typescript
// lib/utils.ts
export function getURL() {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000/'

  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`
  // Make sure to include a trailing `/`.
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`

  return url
}
```

## タスクリスト

### 認証ページ作成
- [x] `app/(auth)/login/page.tsx` を作成
- [x] `app/(auth)/login/actions.ts` を作成
- [x] `app/auth/callback/route.ts` を作成
- [x] `app/api/auth/signout/route.ts` を作成

### 認証コンポーネント作成
- [x] `components/auth/AuthProvider.tsx` を作成
- [x] `components/auth/AuthGuard.tsx` を作成
- [x] `components/layout/Header.tsx` を作成

### レイアウト更新
- [x] `app/layout.tsx` を更新（AuthProvider追加）

### ユーティリティ
- [x] `lib/utils.ts` を作成

### 環境変数設定
- [x] `NEXT_PUBLIC_SITE_URL` を設定
- [x] Supabase DashboardでGoogle OAuth設定
- [x] Google Cloud ConsoleでOAuth設定

## 完了条件
- [x] Google OAuth認証が正常に動作
- [x] 認証状態の管理が適切に機能
- [x] 認証ガードが正常に動作
- [x] サインアウト機能が正常に動作
- [x] ユーザー情報の表示が正常に機能

## 注意事項
- メールアドレス/パスワード認証は実装しない
- 認証状態はContextで管理する
- リダイレクト処理を適切に実装する
- エラーハンドリングを忘れずに実装
- セキュリティを考慮した実装を行う