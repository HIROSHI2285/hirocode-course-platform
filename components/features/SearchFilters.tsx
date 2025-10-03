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
        {categories.length > 0 && (
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
        )}

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