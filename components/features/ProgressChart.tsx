'use client'

import { useMemo } from 'react'

interface CourseProgressData {
  courseId: string
  title: string
  progressPercentage: number
}

interface ProgressChartProps {
  data: CourseProgressData[]
}

export default function ProgressChart({ data }: ProgressChartProps) {
  const chartData = useMemo(() => {
    return data.map(course => ({
      ...course,
      title: course.title.length > 20
        ? `${course.title.substring(0, 20)}...`
        : course.title
    }))
  }, [data])

  return (
    <div className="space-y-4">
      {chartData.map((course, index) => (
        <div key={course.courseId} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {course.title}
            </span>
            <span className="text-sm font-semibold text-blue-600">
              {course.progressPercentage}%
            </span>
          </div>

          <div className="relative">
            <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  course.progressPercentage === 100
                    ? 'bg-green-500'
                    : 'bg-gradient-to-r from-blue-400 to-blue-600'
                }`}
                style={{
                  width: `${course.progressPercentage}%`,
                  animationDelay: `${index * 100}ms`
                }}
              />
            </div>

            {course.progressPercentage === 100 && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      ))}

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          進捗データがありません
        </div>
      )}
    </div>
  )
}