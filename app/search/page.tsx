import { Suspense } from 'react'
import { searchContent, getCategories } from '@/lib/search'
import type { SearchFilters as SearchFiltersType } from '@/types/search'
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

// 検索ページのキャッシュ設定
