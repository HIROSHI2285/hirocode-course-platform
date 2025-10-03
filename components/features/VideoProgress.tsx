'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface VideoProgressProps {
  lessonId: string
  userId?: string
  showPercentage?: boolean
}

export default function VideoProgress({
  lessonId,
  userId,
  showPercentage = true
}: VideoProgressProps) {
  const [progress, setProgress] = useState<{
    progress_percentage: number
    completed: boolean
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchProgress = async () => {
      try {
        const { data } = await supabase
          .from('user_lesson_progress')
          .select('progress_percentage, completed')
          .eq('user_id', userId)
          .eq('lesson_id', lessonId)
          .single()

        setProgress(data)
      } catch (error) {
        // 進捗がない場合は null のまま
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()

    // リアルタイム更新の監視
    const subscription = supabase
      .channel('progress_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_lesson_progress',
          filter: `lesson_id=eq.${lessonId}`,
        },
        (payload) => {
          if (payload.new && (payload.new as any).user_id === userId) {
            setProgress({
              progress_percentage: (payload.new as any).progress_percentage,
              completed: (payload.new as any).completed,
            })
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [lessonId, userId, supabase])

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="bg-gray-200 rounded-full h-2 w-full"></div>
      </div>
    )
  }

  if (!userId || !progress) {
    return null
  }

  return (
    <div className="space-y-1">
      <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            progress.completed ? 'bg-green-500' : 'bg-blue-500'
          }`}
          style={{ width: `${progress.progress_percentage}%` }}
        />
      </div>
      {showPercentage && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {progress.progress_percentage}%
            {progress.completed && ' 完了'}
          </span>
          {progress.completed && (
            <span className="text-green-600 font-semibold">✓</span>
          )}
        </div>
      )}
    </div>
  )
}