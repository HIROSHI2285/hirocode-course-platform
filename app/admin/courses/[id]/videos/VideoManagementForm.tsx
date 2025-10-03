'use client'

import { useState } from 'react'
import { updateLesson, deleteLesson } from './actions'

interface Lesson {
  id: string
  title: string
  description: string | null
  youtube_url: string
  duration: number
  is_free: boolean
}

interface VideoManagementFormProps {
  lesson: Lesson
  courseId: string
  lessonIndex: number
}

export default function VideoManagementForm({ lesson, courseId, lessonIndex }: VideoManagementFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState({
    title: lesson.title,
    description: lesson.description || '',
    youtube_url: lesson.youtube_url,
    duration: Math.floor(lesson.duration / 60), // 秒を分に変換
    is_free: lesson.is_free
  })

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      title: lesson.title,
      description: lesson.description || '',
      youtube_url: lesson.youtube_url,
      duration: Math.floor(lesson.duration / 60),
      is_free: lesson.is_free
    })
  }

  const handleDelete = () => {
    setIsDeleting(true)
  }

  const confirmDelete = async () => {
    const formDataToSubmit = new FormData()
    formDataToSubmit.append('lessonId', lesson.id)
    formDataToSubmit.append('courseId', courseId)

    try {
      await deleteLesson(formDataToSubmit)
      setIsDeleting(false)
    } catch (error) {
      console.error('削除エラー:', error)
      alert('削除に失敗しました')
      setIsDeleting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const formDataToSubmit = new FormData()
    formDataToSubmit.append('lessonId', lesson.id)
    formDataToSubmit.append('courseId', courseId)
    formDataToSubmit.append('videoTitle', formData.title)
    formDataToSubmit.append('videoDescription', formData.description)
    formDataToSubmit.append('youtubeUrl', formData.youtube_url)
    formDataToSubmit.append('duration', formData.duration.toString())
    if (formData.is_free) {
      formDataToSubmit.append('isFree', 'on')
    }

    try {
      await updateLesson(formDataToSubmit)
      setIsEditing(false)
    } catch (error) {
      console.error('更新エラー:', error)
      alert('更新に失敗しました')
    }
  }

  if (isEditing) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-12 gap-4 items-start">
            {/* 番号 */}
            <div className="col-span-1 text-center pt-3">
              <span className="text-lg font-semibold text-gray-900">
                {lessonIndex + 1}
              </span>
            </div>

            {/* 編集フォーム */}
            <div className="col-span-11 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    動画タイトル
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    value={formData.youtube_url}
                    onChange={(e) => setFormData({...formData, youtube_url: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  動画説明
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    動画時間（分）
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
                    min="1"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`is_free_${lesson.id}`}
                    checked={formData.is_free}
                    onChange={(e) => setFormData({...formData, is_free: e.target.checked})}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor={`is_free_${lesson.id}`} className="ml-2 text-sm font-medium text-gray-700">
                    無料で公開する
                  </label>
                </div>
              </div>

              <div className="flex justify-end items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors whitespace-nowrap flex-shrink-0"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors whitespace-nowrap flex-shrink-0"
                >
                  更新
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* 番号 */}
        <div className="col-span-1 text-center">
          <span className="text-lg font-semibold text-gray-900">
            {lessonIndex + 1}
          </span>
        </div>

        {/* 動画タイトル */}
        <div className="col-span-5">
          <h4 className="text-lg font-semibold text-gray-900 mb-1">
            {lesson.title}
            {lesson.is_free && (
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                無料
              </span>
            )}
          </h4>
          {lesson.description && (
            <p className="text-sm text-gray-600 line-clamp-1">
              {lesson.description}
            </p>
          )}
        </div>

        {/* YouTube URL */}
        <div className="col-span-2 text-center">
          <a
            href={lesson.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            {lesson.youtube_url ? 'リンク' : '-'}
          </a>
        </div>

        {/* 動画時間 */}
        <div className="col-span-2 text-center">
          <span className="text-sm text-gray-600">
            {lesson.duration ? `${Math.floor(lesson.duration / 60)}分` : '-'}
          </span>
        </div>

        {/* 無料フラグ */}
        <div className="col-span-1 text-center">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            lesson.is_free
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {lesson.is_free ? '無料' : '有料'}
          </span>
        </div>

        {/* 操作 */}
        <div className="col-span-1 text-center">
          <div className="flex justify-center items-center space-x-1 min-w-0">
            <button
              onClick={handleEdit}
              className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs font-medium hover:bg-purple-200 transition-colors whitespace-nowrap flex-shrink-0"
            >
              編集
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-medium hover:bg-red-200 transition-colors whitespace-nowrap flex-shrink-0"
            >
              削除
            </button>
          </div>
        </div>
      </div>

      {/* 削除確認モーダル */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              動画の削除確認
            </h3>
            <p className="text-gray-600 mb-6">
              「{lesson.title}」を削除してもよろしいですか？<br />
              この操作は取り消せません。
            </p>
            <div className="flex justify-end items-center space-x-3">
              <button
                onClick={() => setIsDeleting(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors whitespace-nowrap flex-shrink-0"
              >
                キャンセル
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors whitespace-nowrap flex-shrink-0"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}