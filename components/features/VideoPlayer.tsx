'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface VideoPlayerProps {
  youtubeUrl: string
  lessonId: string
  userId?: string
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void
    YT: any
  }
}

export default function VideoPlayer({ youtubeUrl, lessonId, userId }: VideoPlayerProps) {
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const supabase = createClient()

  // YouTube動画IDを抽出
  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const videoId = extractVideoId(youtubeUrl)

  // 進捗を保存
  const saveProgress = async (progressPercentage: number, isCompleted: boolean = false) => {
    if (!userId) return

    try {
      await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          progress_percentage: Math.round(progressPercentage),
          completed: isCompleted,
          last_watched_at: new Date().toISOString(),
        })
    } catch (error) {
      console.error('進捗保存エラー:', error)
    }
  }

  // YouTube APIの初期化
  useEffect(() => {
    if (!videoId) return

    // YouTube IFrame APIが読み込まれているかチェック
    if (window.YT && window.YT.Player) {
      initializePlayer()
    } else {
      // YouTube IFrame APIをロード
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        const firstScriptTag = document.getElementsByTagName('script')[0]
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
      }

      // APIの準備が完了したらプレーヤーを初期化
      window.onYouTubeIframeAPIReady = initializePlayer
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
    }
  }, [videoId])

  const initializePlayer = () => {
    if (!containerRef.current || !videoId) return

    playerRef.current = new window.YT.Player(containerRef.current, {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        disablekb: 0,
        enablejsapi: 1,
        fs: 1,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    })
  }

  const onPlayerReady = (event: any) => {
    setIsReady(true)
    // 保存された進捗を取得して設定
    loadSavedProgress()
  }

  const onPlayerStateChange = (event: any) => {
    const playerState = event.data

    if (playerState === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true)
      startProgressTracking()
    } else if (playerState === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false)
      stopProgressTracking()
    } else if (playerState === window.YT.PlayerState.ENDED) {
      setIsPlaying(false)
      stopProgressTracking()
      // 動画終了時に完了マーク
      saveProgress(100, true)
    }
  }

  // 保存された進捗を読み込み
  const loadSavedProgress = async () => {
    if (!userId || !playerRef.current) return

    try {
      const { data } = await supabase
        .from('user_lesson_progress')
        .select('progress_percentage')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single()

      if (data && data.progress_percentage > 0) {
        const duration = playerRef.current.getDuration()
        const seekTime = (duration * data.progress_percentage) / 100
        playerRef.current.seekTo(seekTime)
        setProgress(data.progress_percentage)
      }
    } catch (error) {
      // 進捗がない場合は無視
    }
  }

  // 進捗追跡を開始
  const startProgressTracking = () => {
    const interval = setInterval(() => {
      if (playerRef.current && userId) {
        const currentTime = playerRef.current.getCurrentTime()
        const duration = playerRef.current.getDuration()

        if (duration > 0) {
          const progressPercentage = (currentTime / duration) * 100
          setProgress(progressPercentage)

          // 5秒ごとに進捗を保存
          if (Math.floor(currentTime) % 5 === 0) {
            saveProgress(progressPercentage)
          }
        }
      }
    }, 1000)

    // インターバルを保存して後でクリアできるように
    ;(playerRef.current as any).progressInterval = interval
  }

  // 進捗追跡を停止
  const stopProgressTracking = () => {
    if (playerRef.current && (playerRef.current as any).progressInterval) {
      clearInterval((playerRef.current as any).progressInterval)
    }
  }

  if (!videoId) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">無効な動画URLです</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full min-h-[400px] bg-black">
      {/* YouTube プレーヤー */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
        style={{ aspectRatio: '16/9' }}
      />

      {/* 進捗バー */}
      {userId && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
          <div className="bg-gray-700 rounded-full h-1 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-white text-sm mt-1 text-right">
            進捗: {Math.round(progress)}%
          </div>
        </div>
      )}

      {/* ローディング */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  )
}