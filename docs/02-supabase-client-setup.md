# 02. Supabaseクライアント設定

## 概要
Next.js App RouterでSupabase認証を使用するため、Server ComponentとClient Component用の適切なクライアント設定を行う。

## 優先度
**高（Phase 1 - MVP Core）**

## 関連技術
- @supabase/ssr
- Next.js App Router
- TypeScript

## 前提条件
- [01-environment-setup.md](./01-environment-setup.md) が完了していること

## 作業内容

### libディレクトリ構造の作成
- [x] `lib/supabase` ディレクトリの作成
- [x] Server Component用クライアント作成
- [x] Client Component用クライアント作成
- [x] ミドルウェア用クライアント作成

## 実装ファイル

### Server Component用クライアント
```typescript
// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server Componentでのcookie設定エラーを処理
            console.error('Cookie設定エラー:', error)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server Componentでのcookie削除エラーを処理
            console.error('Cookie削除エラー:', error)
          }
        },
      },
    }
  )
}
```

### Client Component用クライアント
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### ミドルウェア用クライアント
```typescript
// lib/supabase/middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // 認証状態を確認してトークンをリフレッシュ
  const { data: { user }, error } = await supabase.auth.getUser()

  return response
}
```

### ミドルウェア設定
```typescript
// middleware.ts（プロジェクトルート）
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * 以下を除くすべてのパスにマッチ:
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化ファイル)
     * - favicon.ico (ファビコン)
     * - 画像ファイル (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## TypeScript型定義

### データベース型定義
```typescript
// types/database.ts
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          google_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          google_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string | null
          full_name?: string | null
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
          title?: string
          description?: string | null
          thumbnail_url?: string | null
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
          course_id?: string
          title?: string
          order_index?: number
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
          section_id?: string
          title?: string
          description?: string | null
          youtube_url?: string
          duration?: number | null
          order_index?: number
          is_free?: boolean
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
          progress_percentage?: number
          completed?: boolean
          last_watched_at?: string
        }
      }
    }
  }
}
```

## タスクリスト

### ファイル作成
- [x] `lib/supabase/server.ts` を作成
- [x] `lib/supabase/client.ts` を作成
- [x] `lib/supabase/middleware.ts` を作成
- [x] `middleware.ts`（ルート）を作成
- [x] `types/database.ts` を作成

### 動作確認
- [x] Server Componentでクライアントが正常に動作
- [x] Client Componentでクライアントが正常に動作
- [x] ミドルウェアが適切にトークンをリフレッシュ
- [x] TypeScript型チェックが通る

## 完了条件
- [x] すべてのSupabaseクライアントファイルが作成済み
- [x] ミドルウェアが正常に動作
- [x] TypeScript型定義が適切に設定済み
- [x] 認証トークンの自動リフレッシュが動作

## 注意事項
- `@supabase/auth-helpers` は使用せず、`@supabase/ssr` を使用する
- ミドルウェアは必ず設定し、トークンの自動リフレッシュを有効にする
- Server ComponentとClient Componentで異なるクライアントを使用する
- Cookie操作時のエラーハンドリングを適切に行う