# 08. 管理画面・コンテンツ管理

## 概要
講座、セクション、レッスンを管理するための管理画面を実装する。コンテンツの追加、編集、削除、並び替え機能を提供。

## 優先度
**低（Phase 3 - 管理・運用）**

## 関連技術
- Next.js App Router
- Server Actions
- React Hook Form
- Drag & Drop (react-beautiful-dnd)

## 前提条件
- [04-google-oauth-authentication.md](./04-google-oauth-authentication.md) が完了していること

## 作業内容

### 管理画面の実装
- [×] 管理者認証・認可システム
- [×] 講座管理機能
- [ ] セクション管理機能
- [ ] レッスン管理機能
- [ ] ファイルアップロード機能

## データベース拡張

### 管理者ロール追加
```sql
-- プロフィールテーブルに管理者フラグを追加
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- 管理者用RLSポリシー
CREATE POLICY "管理者は全てのプロフィールにアクセス可能" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 講座・セクション・レッスンの管理者用ポリシー
CREATE POLICY "管理者は講座を管理可能" ON courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "管理者はセクションを管理可能" ON sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "管理者はレッスンを管理可能" ON lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 初期管理者設定（適宜変更）
-- UPDATE profiles SET is_admin = true WHERE email = 'admin@example.com';
```

## 実装ファイル

### 管理者認証ミドルウェア
```typescript
// lib/admin.ts
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const supabase = createClient()

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

export async function checkAdminStatus(userId: string): Promise<boolean> {
  const supabase = createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single()

  return profile?.is_admin || false
}
```

### 管理画面メインページ
```tsx
// app/admin/page.tsx
import { requireAdmin } from '@/lib/admin'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default async function AdminPage() {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboard />
    </div>
  )
}

export const metadata = {
  title: '管理画面 | HiroCodeオンライン講座',
  description: 'コンテンツ管理画面'
}

// 管理者認証が必要なためキャッシュ無効化
export const revalidate = 0
```

### 管理画面ダッシュボード
```tsx
// components/admin/AdminDashboard.tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = createClient()

  // 統計データを取得
  const [
    { count: coursesCount },
    { count: lessonsCount },
    { count: usersCount }
  ] = await Promise.all([
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('lessons').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true })
  ])

  const stats = [
    {
      title: '講座数',
      value: coursesCount || 0,
      icon: '📚',
      color: 'bg-blue-500',
      href: '/admin/courses'
    },
    {
      title: 'レッスン数',
      value: lessonsCount || 0,
      icon: '📖',
      color: 'bg-green-500',
      href: '/admin/lessons'
    },
    {
      title: 'ユーザー数',
      value: usersCount || 0,
      icon: '👥',
      color: 'bg-purple-500',
      href: '/admin/users'
    }
  ]

  const quickActions = [
    {
      title: '新しい講座を作成',
      description: '新しい講座を追加します',
      href: '/admin/courses/new',
      icon: '➕',
      color: 'bg-blue-600'
    },
    {
      title: '講座を管理',
      description: '既存の講座を編集します',
      href: '/admin/courses',
      icon: '✏️',
      color: 'bg-green-600'
    },
    {
      title: 'ユーザー管理',
      description: 'ユーザー情報を管理します',
      href: '/admin/users',
      icon: '👤',
      color: 'bg-purple-600'
    }
  ]

  return (
    <div className="p-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">管理画面</h1>
        <p className="text-gray-600 mt-2">HiroCodeオンライン講座の管理画面です</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Link
            key={index}
            href={stat.href}
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3 mr-4`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* クイックアクション */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">クイックアクション</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start">
                <div className={`${action.color} rounded-lg p-2 mr-4`}>
                  <span className="text-white text-xl">{action.icon}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### 講座管理ページ
```tsx
// app/admin/courses/page.tsx
import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import CourseList from '@/components/admin/CourseList'
import Link from 'next/link'

export default async function AdminCoursesPage() {
  await requireAdmin()

  const supabase = createClient()

  const { data: courses } = await supabase
    .from('courses')
    .select(`
      *,
      sections (
        id,
        lessons (id)
      )
    `)
    .order('created_at', { ascending: false })

  // 講座にレッスン数を追加
  const coursesWithStats = courses?.map(course => ({
    ...course,
    lesson_count: course.sections.reduce(
      (total, section) => total + section.lessons.length, 0
    ),
    section_count: course.sections.length
  })) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">講座管理</h1>
            <p className="text-gray-600 mt-2">講座の作成・編集・削除を行います</p>
          </div>
          <Link
            href="/admin/courses/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            新しい講座を作成
          </Link>
        </div>

        <CourseList courses={coursesWithStats} />
      </div>
    </div>
  )
}

export const revalidate = 0
```

### 講座リストコンポーネント
```tsx
// components/admin/CourseList.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { deleteCourse } from '@/app/admin/courses/actions'

interface Course {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  created_at: string
  lesson_count: number
  section_count: number
}

interface CourseListProps {
  courses: Course[]
}

export default function CourseList({ courses }: CourseListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (courseId: string, title: string) => {
    if (!confirm(`講座「${title}」を削除しますか？この操作は取り消せません。`)) {
      return
    }

    setDeletingId(courseId)
    try {
      await deleteCourse(courseId)
      // ページリロードで最新データを取得
      window.location.reload()
    } catch (error) {
      console.error('削除エラー:', error)
      alert('削除に失敗しました')
    } finally {
      setDeletingId(null)
    }
  }

  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">講座がありません</h3>
        <p className="text-gray-600 mb-4">新しい講座を作成してみましょう</p>
        <Link
          href="/admin/courses/new"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          講座を作成
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="divide-y divide-gray-200">
        {courses.map((course) => (
          <div key={course.id} className="p-6">
            <div className="flex items-start space-x-4">
              {/* サムネイル */}
              <div className="flex-shrink-0">
                {course.thumbnail_url ? (
                  <Image
                    src={course.thumbnail_url}
                    alt={course.title}
                    width={120}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-[120px] h-[80px] bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-2xl">📚</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {course.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{course.section_count} セクション</span>
                      <span>{course.lesson_count} レッスン</span>
                      <span>
                        作成日: {new Date(course.created_at).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/courses/${course.id}`}
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                      title="プレビュー"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>

                    <Link
                      href={`/admin/courses/${course.id}/edit`}
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                      title="編集"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>

                    <button
                      onClick={() => handleDelete(course.id, course.title)}
                      disabled={deletingId === course.id}
                      className="text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="削除"
                    >
                      {deletingId === course.id ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 講座作成・編集フォーム
```tsx
// components/admin/CourseForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createCourse, updateCourse } from '@/app/admin/courses/actions'

interface CourseFormData {
  title: string
  description: string
  thumbnail_url?: string
}

interface CourseFormProps {
  course?: {
    id: string
    title: string
    description: string | null
    thumbnail_url: string | null
  }
}

export default function CourseForm({ course }: CourseFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CourseFormData>({
    defaultValues: {
      title: course?.title || '',
      description: course?.description || '',
      thumbnail_url: course?.thumbnail_url || '',
    }
  })

  const onSubmit = async (data: CourseFormData) => {
    setIsLoading(true)
    try {
      if (course) {
        await updateCourse(course.id, data)
      } else {
        await createCourse(data)
      }
      router.push('/admin/courses')
    } catch (error) {
      console.error('保存エラー:', error)
      alert('保存に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* タイトル */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          講座タイトル *
        </label>
        <input
          type="text"
          id="title"
          {...register('title', { required: 'タイトルは必須です' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="講座のタイトルを入力してください"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* 説明 */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          講座説明
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="講座の説明を入力してください"
        />
      </div>

      {/* サムネイルURL */}
      <div>
        <label htmlFor="thumbnail_url" className="block text-sm font-medium text-gray-700 mb-2">
          サムネイルURL
        </label>
        <input
          type="url"
          id="thumbnail_url"
          {...register('thumbnail_url')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* 送信ボタン */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          キャンセル
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '保存中...' : course ? '更新' : '作成'}
        </button>
      </div>
    </form>
  )
}
```

### 講座管理用Server Actions
```typescript
// app/admin/courses/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { revalidatePath } from 'next/cache'

interface CourseData {
  title: string
  description: string
  thumbnail_url?: string
}

export async function createCourse(data: CourseData) {
  await requireAdmin()

  const supabase = createClient()

  const { error } = await supabase
    .from('courses')
    .insert({
      title: data.title,
      description: data.description || null,
      thumbnail_url: data.thumbnail_url || null,
    })

  if (error) {
    throw new Error(`講座の作成に失敗しました: ${error.message}`)
  }

  revalidatePath('/admin/courses')
}

export async function updateCourse(courseId: string, data: CourseData) {
  await requireAdmin()

  const supabase = createClient()

  const { error } = await supabase
    .from('courses')
    .update({
      title: data.title,
      description: data.description || null,
      thumbnail_url: data.thumbnail_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', courseId)

  if (error) {
    throw new Error(`講座の更新に失敗しました: ${error.message}`)
  }

  revalidatePath('/admin/courses')
  revalidatePath(`/courses/${courseId}`)
}

export async function deleteCourse(courseId: string) {
  await requireAdmin()

  const supabase = createClient()

  // 関連するセクションとレッスンも CASCADE で削除される
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId)

  if (error) {
    throw new Error(`講座の削除に失敗しました: ${error.message}`)
  }

  revalidatePath('/admin/courses')
}
```

### 講座作成ページ
```tsx
// app/admin/courses/new/page.tsx
import { requireAdmin } from '@/lib/admin'
import CourseForm from '@/components/admin/CourseForm'

export default async function NewCoursePage() {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">新しい講座を作成</h1>
            <p className="text-gray-600 mt-2">講座の基本情報を入力してください</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <CourseForm />
          </div>
        </div>
      </div>
    </div>
  )
}

export const revalidate = 0
```

### 講座編集ページ
```tsx
// app/admin/courses/[id]/edit/page.tsx
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import CourseForm from '@/components/admin/CourseForm'

interface EditCoursePageProps {
  params: { id: string }
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  await requireAdmin()

  const supabase = createClient()

  const { data: course, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !course) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">講座を編集</h1>
            <p className="text-gray-600 mt-2">{course.title}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <CourseForm course={course} />
          </div>
        </div>
      </div>
    </div>
  )
}

export const revalidate = 0
```

## タスクリスト

### データベース拡張
- [×] 管理者ロールをプロフィールテーブルに追加
- [×] 管理者用RLSポリシーを作成

### 認証・認可
- [×] `lib/admin.ts` を作成

### 管理画面コンポーネント作成
- [×] `components/admin/AdminDashboard.tsx` を作成
- [×] `components/admin/CourseList.tsx` を作成
- [×] `components/admin/CourseForm.tsx` を作成

### 管理画面ページ作成
- [×] `app/admin/page.tsx` を作成
- [×] `app/admin/courses/page.tsx` を作成
- [×] `app/admin/courses/new/page.tsx` を作成
- [×] `app/admin/courses/[id]/edit/page.tsx` を作成

### Server Actions
- [×] `app/admin/courses/actions.ts` を作成

### 追加機能（オプション）
- [ ] セクション管理機能
- [ ] レッスン管理機能
- [ ] ファイルアップロード機能
- [ ] ユーザー管理機能

## 完了条件
- [×] 管理者認証・認可が正常に動作
- [×] 講座の作成・編集・削除が正常に動作
- [×] 管理画面のUIが使いやすい
- [×] 権限のないユーザーはアクセスできない
- [×] データの整合性が保たれる

## 注意事項
- 管理者権限の管理は慎重に行う
- データの削除時は確認ダイアログを表示
- Server Actionsでの適切なエラーハンドリング
- RLSポリシーによるセキュリティの確保
- 管理画面のレスポンシブ対応