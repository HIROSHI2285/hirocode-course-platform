'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
  onSubmit: (data: CourseFormData) => Promise<void>
}

export default function CourseForm({ course, onSubmit }: CourseFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CourseFormData>({
    title: course?.title || '',
    description: course?.description || '',
    thumbnail_url: course?.thumbnail_url || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'タイトルは必須です'
    }

    if (formData.thumbnail_url && !isValidUrl(formData.thumbnail_url)) {
      newErrors.thumbnail_url = '有効なURLを入力してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      await onSubmit(formData)
      router.push('/admin/courses')
    } catch (error) {
      console.error('保存エラー:', error)
      alert('保存に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof CourseFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))

    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* タイトル */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          講座タイトル *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={handleChange('title')}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.title ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="講座のタイトルを入力してください"
          disabled={isLoading}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* 説明 */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          講座説明
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={handleChange('description')}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="講座の説明を入力してください"
          disabled={isLoading}
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
          value={formData.thumbnail_url}
          onChange={handleChange('thumbnail_url')}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.thumbnail_url ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="https://example.com/image.jpg"
          disabled={isLoading}
        />
        {errors.thumbnail_url && (
          <p className="mt-1 text-sm text-red-600">{errors.thumbnail_url}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          YouTubeサムネイルの場合: https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
        </p>
      </div>

      {/* プレビュー */}
      {formData.thumbnail_url && isValidUrl(formData.thumbnail_url) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            プレビュー
          </label>
          <div className="max-w-sm">
            <img
              src={formData.thumbnail_url}
              alt="サムネイルプレビュー"
              className="w-full h-32 object-cover rounded-lg border"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          </div>
        </div>
      )}

      {/* 送信ボタン */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          disabled={isLoading}
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