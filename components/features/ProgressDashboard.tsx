'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import ProgressChart from './ProgressChart'
import { sanitizeImageUrl } from '@/lib/image-utils'

interface CourseProgressSummary {
  courseId: string
  title: string
  thumbnailUrl?: string
  totalLessons: number
  completedLessons: number
  progressPercentage: number
}

interface ProgressDashboardProps {
  userId: string
  overallProgress: CourseProgressSummary[]
}

export default function ProgressDashboard({
  overallProgress
}: ProgressDashboardProps) {
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalLessons: 0,
    completedLessons: 0,
  })

  useEffect(() => {
    const totalCourses = overallProgress.length
    const completedCourses = overallProgress.filter(
      course => course.progressPercentage === 100
    ).length
    const totalLessons = overallProgress.reduce(
      (sum, course) => sum + course.totalLessons, 0
    )
    const completedLessons = overallProgress.reduce(
      (sum, course) => sum + course.completedLessons, 0
    )

    setStats({
      totalCourses,
      completedCourses,
      totalLessons,
      completedLessons,
    })
  }, [overallProgress])

  return (
    <div className="space-y-8">
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="受講中講座"
          value={stats.totalCourses}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          color="blue"
        />
        <StatCard
          title="完了講座"
          value={stats.completedCourses}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
        />
        <StatCard
          title="総レッスン数"
          value={stats.totalLessons}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          }
          color="purple"
        />
        <StatCard
          title="完了レッスン"
          value={stats.completedLessons}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          color="orange"
        />
      </div>

      {/* 進捗チャート */}
      {overallProgress.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">講座別進捗</h2>
          <ProgressChart data={overallProgress} />
        </div>
      )}

      {/* コース別進捗 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">受講中の講座</h2>
        </div>

        {overallProgress.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {overallProgress
              .sort((a, b) => b.progressPercentage - a.progressPercentage)
              .map((course) => (
                <div key={course.courseId} className="p-6">
                  <Link
                    href={`/courses/${course.courseId}`}
                    className="block group"
                  >
                    <div className="flex items-start space-x-4">
                      {/* サムネイル */}
                      {course.thumbnailUrl && (
                        <div className="flex-shrink-0">
                          <Image
                            src={sanitizeImageUrl(course.thumbnailUrl) || ''}
                            alt={course.title}
                            width={80}
                            height={60}
                            className="rounded-lg object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium group-hover:text-blue-600 transition-colors">
                          {course.title}
                        </h3>

                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">
                              進捗: {course.completedLessons}/{course.totalLessons} レッスン
                            </span>
                            <span className="text-sm font-semibold text-blue-600">
                              {course.progressPercentage}%
                            </span>
                          </div>

                          <div className="bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                course.progressPercentage === 100
                                  ? 'bg-green-500'
                                  : 'bg-blue-500'
                              }`}
                              style={{ width: `${course.progressPercentage}%` }}
                            />
                          </div>
                        </div>

                        {course.progressPercentage === 100 && (
                          <div className="mt-2 flex items-center text-green-600 text-sm font-semibold">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            講座完了！
                          </div>
                        )}
                      </div>

                      {/* 矢印 */}
                      <div className="flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <p>まだ受講を開始した講座がありません</p>
            <Link
              href="/courses"
              className="inline-block mt-4 text-blue-600 hover:underline"
            >
              講座一覧を見る →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

// 統計カードコンポーネント
function StatCard({
  title,
  value,
  icon,
  color
}: {
  title: string
  value: number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-semibold ${colorClasses[color].split(' ')[1]}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}