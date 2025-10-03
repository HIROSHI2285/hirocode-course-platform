'use client'

import React from 'react'
import { CourseProgress as CourseProgressType } from '@/lib/progress'

interface CourseProgressProps {
  courseProgress: CourseProgressType
  showDetails?: boolean
}

export default function CourseProgress({
  courseProgress,
  showDetails = false
}: CourseProgressProps) {
  const { totalLessons, completedLessons, progressPercentage, sections } = courseProgress

  return (
    <div className="space-y-4">
      {/* 全体進捗 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">講座の進捗</h3>
          <span className="text-2xl font-bold text-blue-600">
            {progressPercentage}%
          </span>
        </div>

        {/* 進捗バー */}
        <div className="mb-4">
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            完了: {completedLessons}/{totalLessons} レッスン
          </span>
          {progressPercentage === 100 && (
            <span className="text-green-600 font-semibold flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              完了！
            </span>
          )}
        </div>
      </div>

      {/* セクション別進捗（詳細表示時） */}
      {showDetails && (
        <div className="space-y-3">
          <h4 className="text-md font-semibold">セクション別進捗</h4>
          {sections.map((section) => (
            <div key={section.sectionId} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium">{section.sectionTitle}</h5>
                <span className="text-sm font-semibold text-blue-600">
                  {section.progressPercentage}%
                </span>
              </div>

              <div className="mb-2">
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all duration-300"
                    style={{ width: `${section.progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>
                  {section.completedLessons}/{section.totalLessons} レッスン
                </span>
                {section.progressPercentage === 100 && (
                  <span className="text-green-600">✓ 完了</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}