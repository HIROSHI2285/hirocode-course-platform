'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import VideoProgress from './VideoProgress'

interface Lesson {
  id: string
  title: string
  duration: number | null
  order_index: number
  is_free: boolean
}

interface Section {
  id: string
  title: string
  order_index: number
  lessons: Lesson[]
}

interface LessonListProps {
  sections: Section[]
  courseId: string
  currentLessonId?: string
  isAuthenticated: boolean
}

export default function LessonList({
  sections,
  courseId,
  currentLessonId,
  isAuthenticated
}: LessonListProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map(s => s.id))
  )
  const { user } = useAuth()

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return ''
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">レッスン一覧</h3>

      {sections
        .sort((a, b) => a.order_index - b.order_index)
        .map((section) => (
          <div key={section.id} className="border border-gray-200 rounded-lg">
            {/* セクションヘッダー */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-lg"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{section.title}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {section.lessons.length}レッスン
                  </span>
                  <svg
                    className={`w-4 h-4 transform transition-transform ${
                      expandedSections.has(section.id) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </button>

            {/* レッスンリスト */}
            {expandedSections.has(section.id) && (
              <div className="divide-y divide-gray-200">
                {section.lessons
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((lesson) => {
                    const isCurrentLesson = lesson.id === currentLessonId
                    const canAccess = lesson.is_free || isAuthenticated

                    return (
                      <div
                        key={lesson.id}
                        className={`px-4 py-3 ${
                          isCurrentLesson ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {/* アクセス状態アイコン */}
                          <div className="flex-shrink-0">
                            {lesson.is_free ? (
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            ) : canAccess ? (
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            ) : (
                              <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            {canAccess ? (
                              <Link
                                href={`/courses/${courseId}/lessons/${lesson.id}`}
                                className="block group"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <h5
                                      className={`text-sm font-medium group-hover:text-blue-600 transition-colors ${
                                        isCurrentLesson ? 'text-blue-600' : 'text-gray-900'
                                      }`}
                                    >
                                      {lesson.title}
                                      {lesson.is_free && (
                                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                          無料
                                        </span>
                                      )}
                                    </h5>
                                    {lesson.duration && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        {formatDuration(lesson.duration)}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* 進捗表示 */}
                                {user && (
                                  <div className="mt-2">
                                    <VideoProgress
                                      lessonId={lesson.id}
                                      userId={user.id}
                                      showPercentage={false}
                                    />
                                  </div>
                                )}
                              </Link>
                            ) : (
                              <div>
                                <h5 className="text-sm font-medium text-gray-500">
                                  {lesson.title}
                                  <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                    要ログイン
                                  </span>
                                </h5>
                                {lesson.duration && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    {formatDuration(lesson.duration)}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        ))}
    </div>
  )
}