import Link from 'next/link'
import Image from 'next/image'
import { SearchResult } from '@/types/search'
import { isValidImageUrl, getPlaceholderImage, sanitizeImageUrl } from '@/lib/image-utils'

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

  // プレースホルダー画像を生成
  const getPlaceholderImage = (title: string) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-orange-500 to-orange-600',
      'bg-gradient-to-br from-pink-500 to-pink-600'
    ]
    const colorIndex = title.length % colors.length
    return colors[colorIndex]
  }

  // 有効な画像URLかチェック（example.comは除外）
  const isValidImageUrl = (url: string | null) => {
    return url && !url.includes('example.com') && (url.startsWith('https://') || url.startsWith('http://'))
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
                      {isValidImageUrl(course.thumbnail_url) ? (
                        <Image
                          src={sanitizeImageUrl(course.thumbnail_url) || ''}
                          alt={course.title}
                          width={120}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className={`w-[120px] h-[80px] ${getPlaceholderImage(course.title)} rounded-lg flex items-center justify-center`}>
                          <div className="text-center text-white">
                            <div className="mb-1">
                              <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                            <div className="text-xs font-semibold px-2">
                              {course.title.split(' ')[0]}
                            </div>
                          </div>
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