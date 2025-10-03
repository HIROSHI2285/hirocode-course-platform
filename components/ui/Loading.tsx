interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
  className?: string
}

export default function Loading({
  size = 'md',
  text = '読み込み中...',
  fullScreen = false,
  className = ''
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50'
    : 'flex items-center justify-center p-8'

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-b-2 border-blue-600 mx-auto`} />
        {text && (
          <p className="mt-4 text-gray-600 text-sm">{text}</p>
        )}
      </div>
    </div>
  )
}

// スケルトンローディング
export function CourseSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-200" />
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    </div>
  )
}

export function LessonSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center space-x-3 p-4">
        <div className="w-6 h-6 bg-gray-200 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded mb-1" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    </div>
  )
}

export function HeaderSkeleton() {
  return (
    <div className="animate-pulse flex items-center space-x-3">
      <div className="w-8 h-8 bg-gray-200 rounded-full" />
      <div className="hidden sm:flex flex-col space-y-1">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-3 bg-gray-200 rounded w-32" />
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* タイトル */}
      <div className="h-8 bg-gray-200 rounded w-64" />

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border">
            <div className="h-6 bg-gray-200 rounded mb-4" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* チャート */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="h-6 bg-gray-200 rounded mb-4 w-48" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    </div>
  )
}