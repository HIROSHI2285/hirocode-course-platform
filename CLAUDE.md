# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト概要

HiroCodeオンライン講座プラットフォームは、YouTubeの動画をベースとしたUdemyライクなオンライン学習プラットフォームのMVPです。プログラミングやAI開発に関する講座動画を提供し、hirocodeさんのUdemy講座の一環として学習目的で開発されています。

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router) + TypeScript
- **スタイリング**: Tailwind CSS v4
- **データベース**: Supabase
- **認証**: Supabase Auth（Google OAuth のみ）
- **デプロイ**: Vercel
- **動画**: YouTube埋め込み
- **開発ツール**: Turbopack, ESLint

## 開発コマンド

```bash
# Turbopackを使用した開発サーバー起動
npm run dev

# Turbopackを使用した本番ビルド
npm run build

# 本番サーバー起動
npm run start

# ESLint実行
npm run lint
```

## データベース設計（Supabase）

### テーブル構成

#### profiles（ユーザープロフィール）
```sql
profiles (
  id: uuid (primary key, foreign key -> auth.users.id)
  avatar_url: text (Googleプロフィール画像URL)
  google_id: text (Google OAuth ID)
  created_at: timestamp
  updated_at: timestamp
)

注：email, full_nameはセキュリティ上auth.usersテーブルで管理
```

#### courses（講座）
```sql
courses (
  id: uuid (primary key)
  title: text
  description: text
  thumbnail_url: text
  created_at: timestamp
  updated_at: timestamp
)
```

#### sections（セクション）
```sql
sections (
  id: uuid (primary key)
  course_id: uuid (foreign key -> courses.id)
  title: text
  order_index: integer
  created_at: timestamp
)
```

#### lessons（レッスン）
```sql
lessons (
  id: uuid (primary key)
  section_id: uuid (foreign key -> sections.id)
  title: text
  description: text
  youtube_url: text
  duration: integer (秒)
  order_index: integer
  is_free: boolean (最初のレッスンをfreeに設定)
  created_at: timestamp
)
```

#### user_lesson_progress（視聴進捗）
```sql
user_lesson_progress (
  id: uuid (primary key)
  user_id: uuid (foreign key -> profiles.id)
  lesson_id: uuid (foreign key -> lessons.id)
  progress_percentage: integer (0-100)
  completed: boolean
  last_watched_at: timestamp
)
```

## アプリケーション構成

### 講座構造（3階層）
```
講座（Course）
├── セクション（Section）
    ├── レッスン（Lesson/Video）
    ├── レッスン（Lesson/Video）
    └── ...
├── セクション（Section）
└── ...
```

### 主要機能
- **講座一覧・詳細表示**: コンテンツの基本表示
- **YouTube動画プレーヤー**: 講座動画の視聴
- **Google OAuth認証**: Supabase Authを使用
- **視聴進捗管理**: 動画完了時の「完了」マーク、進捗率表示
- **アクセス制御**: 最初の動画は誰でも視聴可能、それ以降は認証必須

### ディレクトリ構造
```
app/
├── layout.tsx          # ルートレイアウト（Geistフォント、グローバルスタイル）
├── page.tsx           # ホームページ
├── globals.css        # グローバルスタイル（CSS カスタムプロパティ）
├── (auth)/            # 認証関連ページ
├── courses/           # 講座関連ページ
│   ├── page.tsx       # 講座一覧
│   └── [id]/          # 講座詳細・視聴ページ
└── favicon.ico        # サイトアイコン

public/                # 静的ファイル（SVGアイコンなど）
```

## 重要な設定ファイル

- `next.config.ts`: Turbopackのルート設定（ワークスペース検出警告回避）
- `eslint.config.mjs`: Next.jsルールを拡張したFlat config
- `postcss.config.mjs`: Tailwind CSS PostCSS統合
- `tsconfig.json`: Next.jsプラグインとパスエイリアス設定

## スタイリングシステム

- **CSS カスタムプロパティ**: テーマ設定用
- **ライト/ダークモード**: `prefers-color-scheme` による自動切り替え
- **フォント**: Geist Sans と Geist Mono を `next/font/google` で読み込み
- **Tailwind CSS**: CSS 変数を使用したカスタムテーマ設定

## 開発における重要な注意点

### 認証
- **Google OAuth のみ**: メールアドレス/パスワード認証は実装しない
- **アクセス制御**: 最初のレッスンのみ未認証で視聴可能
- **Google Cloud Console**: 本番・開発環境でのリダイレクトURL設定が必要

### Supabase設定
- **RLS（Row Level Security）**: ユーザーは自分のデータのみアクセス可能
- **トリガー**: 新規ユーザー登録時に自動でプロフィール作成
- **Google OAuth**: Supabase Auth設定でGoogle認証を有効化

### フロントエンド
- **Turbopack**: 開発・本番ビルド両方で有効
- **Hydration**: レイアウトで `suppressHydrationWarning` を使用
- **パスエイリアス**: `@/*` はルートディレクトリにマッピング

## 開発フェーズ

### Phase 1（高優先度）- MVP Core
1. [×] 環境セットアップ（Supabase、Google OAuth、Vercel）
2. [×] 基本画面実装（講座一覧、詳細、視聴ページ）
3. [×] 認証機能（Google OAuth、認証状態管理、認証ガード）
4. [×] 動画プレーヤー（YouTube埋め込み）

### Phase 2（中優先度）- UX向上
5. [×] 視聴進捗機能（進捗データ管理、UI表示、完了状態管理）
6. [×] 検索機能（講座・レッスン検索、フィルタリング）

### Phase 3（追加機能）- 管理・運用
7. 管理画面（コンテンツ管理、編集機能）
8. UI/UX改善（レスポンシブ対応、パフォーマンス最適化）

## Next.js App Router ベストプラクティス

### プロジェクト構造の原則

#### 推奨ディレクトリ構造
```
src/
├── app/                    # App Router（ルーティング）
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx           # ホームページ
│   ├── loading.tsx        # ローディングUI
│   ├── error.tsx          # エラーUI
│   ├── not-found.tsx      # 404ページ
│   ├── (auth)/            # ルートグループ（認証関連）
│   │   ├── login/         # ログインページ
│   │   └── signup/        # サインアップページ
│   ├── courses/           # 講座関連ページ
│   │   ├── page.tsx       # 講座一覧
│   │   ├── [id]/          # 動的ルート
│   │   │   ├── page.tsx   # 講座詳細
│   │   │   └── [lessonId]/
│   │   │       └── page.tsx # レッスン視聴
│   │   └── _components/   # プライベートフォルダ
│   └── globals.css
├── components/            # 共有コンポーネント
│   ├── ui/               # 基本UIコンポーネント（Button、Input等）
│   ├── features/         # 機能固有コンポーネント
│   └── layout/           # レイアウト関連コンポーネント
├── lib/                  # ユーティリティ関数
│   ├── utils.ts         # 汎用ユーティリティ
│   ├── db.ts            # データベース接続
│   └── auth.ts          # 認証設定
├── hooks/               # カスタムReactフック
├── types/               # TypeScript型定義
└── context/             # Reactコンテキストプロバイダー
```

#### ファイル構造のルール

1. **srcディレクトリの使用**: 大規模プロジェクトではソースコードと設定ファイルを分離
2. **ルートグループ `()` の活用**: URLに含めない整理用フォルダ（例：`(auth)`、`(dashboard)`）
3. **プライベートフォルダ `_` の活用**: ルーティングから除外するフォルダ（例：`_components`、`_utils`）
4. **特別なファイル名の使用**:
   - `layout.tsx`: 共有レイアウト
   - `page.tsx`: ルートのメインコンテンツ
   - `loading.tsx`: 読み込み状態のUI
   - `error.tsx`: エラー状態のUI
   - `not-found.tsx`: 404エラーページ

### Server Components と Client Components

#### Server Components（デフォルト）
```tsx
// デフォルトでServer Component
async function CoursePage({ params }: { params: { id: string } }) {
  // サーバーサイドでのデータフェッチ
  const course = await getCourse(params.id);

  return (
    <div>
      <h1>{course.title}</h1>
      <p>{course.description}</p>
    </div>
  );
}
```

**使用すべき場面**:
- データフェッチが必要
- 静的コンテンツの表示
- SEOが重要なページ
- JavaScriptバンドルサイズを削減したい

#### Client Components
```tsx
'use client'; // ファイル先頭に必須

import { useState } from 'react';

function VideoPlayer({ videoUrl }: { videoUrl: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div onClick={() => setIsPlaying(!isPlaying)}>
      {/* 動画プレーヤーコンポーネント */}
    </div>
  );
}
```

**使用すべき場面**:
- インタラクティブな要素（onClick、onChange等）
- React Hooks（useState、useEffect等）の使用
- ブラウザ専用API（localStorage、window等）の使用
- サードパーティライブラリでクライアント機能が必要

### コンポーネント設計原則

#### アトミックデザインの適用
```
components/
├── ui/                    # Atoms（基本要素）
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Card.tsx
├── features/              # Molecules/Organisms（機能単位）
│   ├── CourseCard.tsx
│   ├── VideoPlayer.tsx
│   └── AuthForm.tsx
└── layout/               # Templates（レイアウト）
    ├── Header.tsx
    ├── Sidebar.tsx
    └── Footer.tsx
```

#### コンポーネント命名規則
- **PascalCase**: すべてのコンポーネント名
- **機能説明的**: `VideoPlayer.tsx`、`CourseCard.tsx`
- **Indexファイルの回避**: 明確なファイル名を使用

### データフェッチのベストプラクティス

#### Server ComponentsでのSQL直接実行
```tsx
// app/courses/page.tsx（Server Component）
import { createClient } from '@/lib/supabase/server';

async function CoursesPage() {
  const supabase = createClient();
  const { data: courses } = await supabase
    .from('courses')
    .select('*');

  return (
    <div>
      {courses?.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
```

#### Client ComponentsでのAPI Route使用
```tsx
// app/api/courses/route.ts
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const { data } = await supabase.from('courses').select('*');
  return Response.json(data);
}

// components/CourseList.tsx（Client Component）
'use client';
import useSWR from 'swr';

function CourseList() {
  const { data, error } = useSWR('/api/courses', fetcher);
  // ...
}
```

### パフォーマンス最適化

#### 画像最適化
```tsx
import Image from 'next/image';

function CourseCard({ course }) {
  return (
    <Image
      src={course.thumbnail_url}
      alt={course.title}
      width={300}
      height={200}
      priority={false} // above-the-foldの場合はtrue
      placeholder="blur" // ブラーエフェクト
    />
  );
}
```

#### 動的インポート
```tsx
import dynamic from 'next/dynamic';

// 重いコンポーネントの遅延読み込み
const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), {
  loading: () => <div>Loading player...</div>,
  ssr: false // クライアントサイドでのみ実行
});
```

### エラーハンドリング

#### エラーバウンダリ
```tsx
// app/courses/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### 重要な禁止事項

1. **App Routerで避けるべきこと**:
   - appディレクトリ内にルーティングに関係ないファイルの配置
   - Client ComponentからServer Componentの直接インポート
   - Server Component内でのブラウザ専用APIの使用

2. **パフォーマンスを損なう実装**:
   - 不必要なClient Componentの使用
   - 大きなJavaScriptバンドルの作成
   - 適切でないメモ化の実装

## Supabase認証 ベストプラクティス

### パッケージ構成（2024年版）

#### 必要なパッケージ
```bash
npm install @supabase/supabase-js @supabase/ssr
```

**重要**: `@supabase/auth-helpers` は非推奨。`@supabase/ssr` パッケージを使用すること。

#### 環境変数設定
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabaseクライアントの作成

#### Server Component用クライアント
```tsx
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
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server Componentでのcookie削除エラーを処理
          }
        },
      },
    }
  )
}
```

#### Client Component用クライアント
```tsx
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### ミドルウェア実装

#### middleware.ts（プロジェクトルート）
```tsx
// middleware.ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

#### ミドルウェアロジック
```tsx
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

  await supabase.auth.getUser()

  return response
}
```

### 認証の実装パターン

#### Server Actionでのサインアップ
```tsx
// app/(auth)/signup/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
  const supabase = createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/courses')
}
```

#### 認証状態の確認（Server Component）
```tsx
// app/courses/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CoursesPage() {
  const supabase = createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/login')
  }

  // 認証済みユーザーのみアクセス可能
  return <div>講座一覧</div>
}
```

#### 認証状態の管理（Client Component）
```tsx
// components/AuthProvider.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext<{ user: User | null }>({ user: null })

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        router.refresh()
      }
    )

    return () => subscription.unsubscribe()
  }, [router, supabase])

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
```

### セキュリティのベストプラクティス

#### 1. 認証チェックの原則
```tsx
// ❌ 推奨しない（セキュリティリスク）
const { data: { session } } = await supabase.auth.getSession()

// ✅ 推奨（サーバーで検証）
const { data: { user } } = await supabase.auth.getUser()
```

#### 2. RLS（Row Level Security）の必須設定
```sql
-- profiles テーブルの RLS ポリシー例
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ユーザーは自分のプロフィールのみアクセス可能" ON profiles
    FOR ALL USING (auth.uid() = id);

-- user_lesson_progress テーブルの RLS ポリシー例
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ユーザーは自分の進捗のみアクセス可能" ON user_lesson_progress
    FOR ALL USING (auth.uid() = user_id);
```

#### 3. キャッシュの無効化
```tsx
// 認証が必要なServer Componentでは必須
export const revalidate = 0
```

### Google OAuth設定

#### Supabase設定
1. Supabase Dashboard → Authentication → Settings → Auth Providers
2. Google プロバイダーを有効化
3. Google Cloud Console で取得した Client ID と Client Secret を設定

#### リダイレクト URL設定
```
開発環境: http://localhost:3000/auth/callback
本番環境: https://yourdomain.com/auth/callback
```

#### 認証コールバック処理
```tsx
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/courses'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
```

### 重要な注意事項

1. **パッケージ選択**: `@supabase/ssr` を使用し、`@supabase/auth-helpers` は避ける
2. **認証チェック**: `getUser()` を使用し、`getSession()` は避ける
3. **ミドルウェア**: 必ず実装してトークンリフレッシュを自動化
4. **RLS**: すべてのテーブルでRow Level Securityを有効化
5. **キャッシュ**: 認証が必要なページでは `revalidate = 0` を設定


**機能詳細**:
- 講座全体・セクション別・レッスン別の進捗計算
- 視覚的な進捗バー（0-100%）とパーセンテージ表示
- 完了時の特別表示（緑色バー、チェックマーク、「完了！」メッセージ）
- 学習統計（受講中講座数、完了講座数、総レッスン数、完了レッスン数）
- レスポンシブデザイン対応
- 認証済みユーザーのみアクセス可能（`/dashboard`ページ）
- 講座・レッスンのテキスト検索（title, description対応）
- リアルタイム検索候補表示（debounce最適化）
- カテゴリ、再生時間、料金フィルター
- 検索結果の詳細表示（サムネイル、時間、無料表示）
- レスポンシブデザイン対応
- SEOフレンドリーなURL設計
- 検索候補のキーボードナビゲーション対応
- 管理者認証・認可システム (`lib/admin.ts`)
- 管理画面ダッシュボード (`components/admin/AdminDashboard.tsx`)
- 講座管理コンポーネント (`components/admin/CourseList.tsx`, `CourseForm.tsx`)
- 管理画面ページ (`app/admin/page.tsx`, `app/admin/courses/`)
- 講座管理用Server Actions (`app/admin/courses/actions.ts`)
- データベース管理者スキーマ (`database_admin_schema.sql`)
- ヘッダーに管理者用リンク追加
- Row Level Security による厳密なアクセス制御
- 管理者のみアクセス可能な管理画面
- 講座の作成・編集・削除機能
- 統計ダッシュボード（講座数、レッスン数、ユーザー数）
- プレースホルダー画像対応
- パンくずナビゲーション
- 確認ダイアログ付き削除機能
- レスポンシブデザイン対応

## 今後の拡張予定
- 課金機能の実装
- 詳細な学習分析
- コミュニティ機能（コメント、Q&A）
- 修了証明書発行