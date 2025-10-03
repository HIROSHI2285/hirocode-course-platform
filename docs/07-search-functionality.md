# 07. 検索機能

## 概要
講座とレッスンの検索機能を実装する。ユーザーがコンテンツを効率的に発見できるよう、タイトル検索、フィルタリング、カテゴリ分類機能を提供。

## 優先度
**中（Phase 2 - UX向上）**

## 関連技術
- Next.js App Router
- Supabase Full-text Search
- React Hooks
- Debounce

## 前提条件
- [03-basic-pages-implementation.md](./03-basic-pages-implementation.md) が完了していること

## 作業内容

### 検索機能の実装
- [ ] 講座・レッスン検索コンポーネント
- [ ] 検索結果ページの実装
- [ ] フィルタリング機能
- [ ] 検索履歴機能

## データベース拡張

### 検索用インデックス追加
```sql
-- 講座検索用のGINインデックス
CREATE INDEX IF NOT EXISTS courses_search_idx ON courses
USING gin(to_tsvector('japanese', title || ' ' || COALESCE(description, '')));

-- レッスン検索用のGINインデックス
CREATE INDEX IF NOT EXISTS lessons_search_idx ON lessons
USING gin(to_tsvector('japanese', title || ' ' || COALESCE(description, '')));

-- カテゴリテーブル（将来の拡張用）
CREATE TABLE IF NOT EXISTS course_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 講座カテゴリの関連テーブル
CREATE TABLE IF NOT EXISTS course_category_relations (
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  category_id UUID REFERENCES course_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, category_id)
);

-- 初期カテゴリデータ
INSERT INTO course_categories (name, slug, description) VALUES
  ('プログラミング基礎', 'programming-basics', 'プログラミングの基礎を学ぶ講座'),
  ('Web開発', 'web-development', 'WebアプリケーションやWebサイト開発'),
  ('AI・機械学習', 'ai-ml', '人工知能と機械学習の技術'),
  ('データベース', 'database', 'データベース設計と管理'),
  ('フロントエンド', 'frontend', 'フロントエンド開発技術');
```

## 実装ファイル

### 検索ユーティリティ関数
```typescript
// lib/search.ts
import { createClient } from '@/lib/supabase/server'

export interface SearchFilters {
  category?: string
  duration?: 'short' | 'medium' | 'long' // 短時間、中時間、長時間
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  isFree?: boolean
}

export interface SearchResult {
  courses: CourseSearchResult[]
  lessons: LessonSearchResult[]
  totalResults: number
}

export interface CourseSearchResult {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  category?: string
  lesson_count: number
  total_duration: number
  created_at: string
}

export interface LessonSearchResult {
  id: string
  title: string
  description: string | null
  course_title: string
  course_id: string
  section_title: string
  duration: number | null
  is_free: boolean
}

export async function searchContent(
  query: string,
  filters: SearchFilters = {},
  limit: number = 20
): Promise<SearchResult> {
  const supabase = createClient()

  // 講座の検索
  let coursesQuery = supabase
    .from('courses')
    .select(`
      id,
      title,
      description,
      thumbnail_url,
      created_at,
      sections!inner (
        lessons (
          id,
          duration
        )
      ),
      course_category_relations (
        course_categories (
          name
        )
      )
    `)

  // テキスト検索
  if (query.trim()) {
    coursesQuery = coursesQuery.textSearch('title,description', query, {
      type: 'websearch',
      config: 'japanese'
    })
  }

  // カテゴリフィルター
  if (filters.category) {
    coursesQuery = coursesQuery.eq('course_category_relations.course_categories.slug', filters.category)
  }

  const { data: coursesRaw } = await coursesQuery.limit(limit)

  // 講座データの整形
  const courses: CourseSearchResult[] = (coursesRaw || []).map(course => {
    const lessons = course.sections.flatMap(s => s.lessons)
    const totalDuration = lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0)
    const category = course.course_category_relations?.[0]?.course_categories?.name

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail_url: course.thumbnail_url,
      category,
      lesson_count: lessons.length,
      total_duration: totalDuration,
      created_at: course.created_at,
    }
  })

  // レッスンの検索
  let lessonsQuery = supabase
    .from('lessons')
    .select(`
      id,
      title,
      description,
      duration,
      is_free,
      sections!inner (
        title,
        courses!inner (
          id,
          title
        )
      )
    `)

  if (query.trim()) {
    lessonsQuery = lessonsQuery.textSearch('title,description', query, {
      type: 'websearch',
      config: 'japanese'
    })
  }

  // 無料フィルター
  if (filters.isFree !== undefined) {
    lessonsQuery = lessonsQuery.eq('is_free', filters.isFree)
  }

  const { data: lessonsRaw } = await lessonsQuery.limit(limit)

  // レッスンデータの整形
  const lessons: LessonSearchResult[] = (lessonsRaw || []).map(lesson => ({
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    course_title: lesson.sections.courses.title,
    course_id: lesson.sections.courses.id,
    section_title: lesson.sections.title,
    duration: lesson.duration,
    is_free: lesson.is_free,
  }))

  return {
    courses,
    lessons,
    totalResults: courses.length + lessons.length
  }
}

export async function getSearchSuggestions(query: string): Promise<string[]> {
  if (query.length < 2) return []

  const supabase = createClient()

  const { data: courses } = await supabase
    .from('courses')
    .select('title')
    .ilike('title', `%${query}%`)
    .limit(5)

  const { data: lessons } = await supabase
    .from('lessons')
    .select('title')
    .ilike('title', `%${query}%`)
    .limit(3)

  const suggestions = [
    ...(courses || []).map(c => c.title),
    ...(lessons || []).map(l => l.title),
  ]

  return [...new Set(suggestions)].slice(0, 8)
}

export async function getCategories() {
  const supabase = createClient()

  const { data } = await supabase
    .from('course_categories')
    .select('*')
    .order('name')

  return data || []
}
```

### 検索バーコンポーネント
```tsx
// components/features/SearchBar.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebounce } from '@/hooks/useDebounce'
import { getSearchSuggestions } from '@/lib/search'

interface SearchBarProps {
  placeholder?: string
  showSuggestions?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function SearchBar({
  placeholder = '講座やレッスンを検索...',
  showSuggestions = true,
  size = 'md',
  className = ''
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestionsList, setShowSuggestionsList] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const debouncedQuery = useDebounce(query, 300)

  // URLからクエリパラメータを初期値に設定
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
    }
  }, [searchParams])

  // 検索候補を取得
  useEffect(() => {
    if (debouncedQuery.length >= 2 && showSuggestions) {
      getSearchSuggestions(debouncedQuery)
        .then(setSuggestions)
        .catch(() => setSuggestions([]))
    } else {
      setSuggestions([])
    }
  }, [debouncedQuery, showSuggestions])

  // 検索実行
  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowSuggestionsList(false)
      inputRef.current?.blur()
    }
  }

  // フォーム送信
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
      handleSearch(suggestions[selectedIndex])
    } else {
      handleSearch()
    }
  }

  // キーボード操作
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestionsList || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Escape':
        setShowSuggestionsList(false)
        setSelectedIndex(-1)
        break
    }
  }

  // サイズクラス
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg'
  }

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestionsList(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full ${sizeClasses[size]} pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
          />

          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setSuggestions([])
                setShowSuggestionsList(false)
                inputRef.current?.focus()
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* 検索候補 */}
      {showSuggestionsList && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSearch(suggestion)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                index === selectedIndex ? 'bg-blue-50 text-blue-700' : ''
              }`}
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {suggestion}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

### 検索結果ページ
```tsx
// app/search/page.tsx
import { Suspense } from 'react'
import { searchContent, getCategories } from '@/lib/search'
import SearchResults from '@/components/features/SearchResults'
import SearchFilters from '@/components/features/SearchFilters'

interface SearchPageProps {
  searchParams: {
    q?: string
    category?: string
    duration?: string
    difficulty?: string
    free?: string
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ''
  const filters = {
    category: searchParams.category,
    duration: searchParams.duration as any,
    difficulty: searchParams.difficulty as any,
    isFree: searchParams.free === 'true'
  }

  const [results, categories] = await Promise.all([
    searchContent(query, filters),
    getCategories()
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">検索結果</h1>
        {query && (
          <p className="text-gray-600">
            「{query}」の検索結果: {results.totalResults}件
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* フィルター */}
        <div className="lg:col-span-1">
          <Suspense fallback={<div>Loading filters...</div>}>
            <SearchFilters
              categories={categories}
              currentFilters={filters}
              currentQuery={query}
            />
          </Suspense>
        </div>

        {/* 検索結果 */}
        <div className="lg:col-span-3">
          <Suspense fallback={<div>Loading results...</div>}>
            <SearchResults results={results} query={query} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: '検索結果 | HiroCodeオンライン講座',
  description: '講座とレッスンを検索'
}
```

### 検索結果コンポーネント
```tsx
// components/features/SearchResults.tsx
import Link from 'next/link'
import Image from 'next/image'
import { SearchResult } from '@/lib/search'

interface SearchResultsProps {
  results: SearchResult
  query: string
}

export default function SearchResults({ results, query }: SearchResultsProps) {
  const { courses, lessons, totalResults } = results

  if (totalResults === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          検索結果が見つかりませんでした
        </h3>
        <p className="text-gray-600 mb-4">
          {query ? `「${query}」` : '指定された条件'}に一致する講座やレッスンがありません
        </p>
        <Link
          href="/courses"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          すべての講座を見る
        </Link>
      </div>
    )
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  return (
    <div className="space-y-8">
      {/* 講座結果 */}
      {courses.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            講座 ({courses.length}件)
          </h2>
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <Link href={`/courses/${course.id}`} className="block">
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
                      <h3 className="text-lg font-semibold mb-2 hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>

                      {course.description && (
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {course.description}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{course.lesson_count} レッスン</span>
                        {course.total_duration > 0 && (
                          <span>{formatDuration(course.total_duration)}</span>
                        )}
                        {course.category && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {course.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* レッスン結果 */}
      {lessons.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            レッスン ({lessons.length}件)
          </h2>
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <Link href={`/courses/${lesson.course_id}/lessons/${lesson.id}`} className="block">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium mb-1 hover:text-blue-600 transition-colors">
                        {lesson.title}
                        {lesson.is_free && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            無料
                          </span>
                        )}
                      </h3>

                      <p className="text-sm text-gray-600 mb-2">
                        {lesson.course_title} › {lesson.section_title}
                      </p>

                      {lesson.description && (
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {lesson.description}
                        </p>
                      )}
                    </div>

                    <div className="flex-shrink-0 ml-4 text-right">
                      {lesson.duration && (
                        <span className="text-sm text-gray-500">
                          {formatDuration(lesson.duration)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

### 検索フィルターコンポーネント
```tsx
// components/features/SearchFilters.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface Category {
  id: string
  name: string
  slug: string
}

interface SearchFiltersProps {
  categories: Category[]
  currentFilters: {
    category?: string
    duration?: string
    difficulty?: string
    isFree?: boolean
  }
  currentQuery: string
}

export default function SearchFilters({
  categories,
  currentFilters,
  currentQuery
}: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (key: string, value: string | boolean) => {
    const params = new URLSearchParams(searchParams)

    if (currentQuery) {
      params.set('q', currentQuery)
    }

    if (value === '' || value === false) {
      params.delete(key)
    } else {
      params.set(key, value.toString())
    }

    router.push(`/search?${params.toString()}`)
  }

  const clearFilters = () => {
    const params = new URLSearchParams()
    if (currentQuery) {
      params.set('q', currentQuery)
    }
    router.push(`/search?${params.toString()}`)
  }

  const hasActiveFilters = Object.values(currentFilters).some(value =>
    value !== undefined && value !== '' && value !== false
  )

  return (
    <div className="space-y-6">
      {/* モバイル用トグルボタン */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-left flex items-center justify-between"
        >
          <span className="font-medium">フィルター</span>
          <svg
            className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className={`space-y-6 ${isOpen ? 'block' : 'hidden lg:block'}`}>
        {/* フィルタークリア */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between">
            <h3 className="font-medium">フィルター</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              すべてクリア
            </button>
          </div>
        )}

        {/* カテゴリフィルター */}
        <div>
          <h4 className="font-medium mb-3">カテゴリ</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="category"
                value=""
                checked={!currentFilters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">すべて</span>
            </label>
            {categories.map((category) => (
              <label key={category.id} className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  value={category.slug}
                  checked={currentFilters.category === category.slug}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm">{category.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 再生時間フィルター */}
        <div>
          <h4 className="font-medium mb-3">再生時間</h4>
          <div className="space-y-2">
            {[
              { value: '', label: 'すべて' },
              { value: 'short', label: '短時間（30分以下）' },
              { value: 'medium', label: '中時間（30分～2時間）' },
              { value: 'long', label: '長時間（2時間以上）' },
            ].map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name="duration"
                  value={option.value}
                  checked={currentFilters.duration === option.value || (!currentFilters.duration && option.value === '')}
                  onChange={(e) => updateFilter('duration', e.target.value)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 無料フィルター */}
        <div>
          <h4 className="font-medium mb-3">料金</h4>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={currentFilters.isFree === true}
              onChange={(e) => updateFilter('free', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm">無料のみ表示</span>
          </label>
        </div>
      </div>
    </div>
  )
}
```

### debounceフック
```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

## タスクリスト

### データベース拡張
- [×] 検索用インデックスを作成
- [×] カテゴリテーブルを作成
- [×] 初期カテゴリデータを投入

### 検索機能実装
- [×] `lib/search.ts` を作成
- [×] `hooks/useDebounce.ts` を作成

### 検索コンポーネント作成
- [×] `components/features/SearchBar.tsx` を作成
- [×] `components/features/SearchResults.tsx` を作成
- [×] `components/features/SearchFilters.tsx` を作成

### 検索ページ作成
- [×] `app/search/page.tsx` を作成

### 既存ページ更新
- [×] ヘッダーに検索バーを追加
- [ ] 講座一覧ページに検索機能を統合

## 完了条件
- [×] 講座とレッスンの検索が正常に動作
- [×] 検索候補が適切に表示される
- [×] フィルタリング機能が正常に動作
- [×] レスポンシブデザインが実装されている
- [×] パフォーマンスが良好

## 注意事項
- 全文検索のパフォーマンスを考慮する
- 検索クエリのサニタイズを適切に行う
- debounceを使用して不要なAPI呼び出しを避ける
- SEOを考慮したURL設計を行う
- 検索結果のページング機能を将来的に検討