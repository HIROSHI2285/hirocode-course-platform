import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { sanitizeImageUrl } from '@/lib/image-utils'
import type { Course } from '@/types/database'

interface CourseCardProps {
  course: Course
  showProgress?: boolean
  userId?: string
  priority?: boolean
  index?: number
}

export default function CourseCard({
  course,
  showProgress = false,
  userId,
  priority = false,
  index = 0
}: CourseCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const cleanThumbnailUrl = sanitizeImageUrl(course.thumbnail_url)

  return (
    <Link
      href={`/courses/${course.id}`}
      className="group block transition-transform hover:scale-105"
    >
      <Card className="overflow-hidden h-full">
        <div className="aspect-video bg-gray-200 relative overflow-hidden">
          {cleanThumbnailUrl ? (
            <img
              src={cleanThumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <div className="text-white text-center p-4">
                <div className="mb-2">
                  <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  </svg>
                </div>
                <div className="text-sm font-semibold line-clamp-2">
                  {course.title.split(' ').slice(0, 3).join(' ')}
                </div>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-transparent group-hover:bg-black group-hover:bg-opacity-20 transition-opacity">
            <div className="absolute bottom-4 right-4 bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="text-xs">
              講座
            </Badge>
          </div>

          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
            {course.title}
          </h3>

          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {course.description}
          </p>

          <div className="flex items-center text-xs text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(course.created_at)}
          </div>
        </div>
      </Card>
    </Link>
  )
}