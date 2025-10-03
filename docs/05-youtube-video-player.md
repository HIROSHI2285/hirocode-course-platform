# 05. YouTube動画プレーヤー

## 概要
講座動画を視聴するためのYouTube埋め込みプレーヤーを実装する。動画の再生、一時停止、進捗追跡機能を提供。

## 優先度
**高（Phase 1 - MVP Core）**

## 関連技術
- YouTube IFrame API
- Next.js Client Components
- React Hooks

## 前提条件
- [03-basic-pages-implementation.md](./03-basic-pages-implementation.md) が完了していること
- [04-google-oauth-authentication.md](./04-google-oauth-authentication.md) が完了していること

## 作業内容

### 動画プレーヤーコンポーネントの実装
- [×] YouTube埋め込みプレーヤーの作成
- [×] 動画再生状態の管理
- [×] 進捗追跡機能の実装
- [×] レスポンシブ対応

## 実装ファイル

### YouTubeプレーヤーコンポーネント
```tsx
// components/features/VideoPlayer.tsx
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
```

### 動画プレーヤーのレスポンシブ対応
```tsx
// components/features/ResponsiveVideoPlayer.tsx
'use client'

import { useState, useEffect } from 'react'
import VideoPlayer from './VideoPlayer'

interface ResponsiveVideoPlayerProps {
  youtubeUrl: string
  lessonId: string
  userId?: string
}

export default function ResponsiveVideoPlayer(props: ResponsiveVideoPlayerProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)

    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  return (
    <div className="relative w-full">
      <div className={`relative ${isMobile ? 'aspect-video' : 'aspect-video'}`}>
        <VideoPlayer {...props} />
      </div>
    </div>
  )
}
```

### 動画進捗表示コンポーネント
```tsx
// components/features/VideoProgress.tsx
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
```

### レッスンリストの更新（進捗表示付き）
```tsx
// components/features/LessonList.tsx（進捗表示機能付き）
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
                        <div className="flex items-start space-x-3">
                          {/* アクセス状態アイコン */}
                          <div className="flex-shrink-0 mt-1">
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
                                <div className="flex items-start justify-between">
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
```

## タスクリスト

### 動画プレーヤー実装
- [×] `components/features/VideoPlayer.tsx` を作成
- [×] `components/features/ResponsiveVideoPlayer.tsx` を作成
- [×] `components/features/VideoProgress.tsx` を作成

### レッスンリスト更新
- [×] `components/features/LessonList.tsx` を更新（進捗表示追加）

### 動画ページ更新
- [×] レッスン視聴ページでVideoPlayerコンポーネントを使用

### 機能テスト
- [×] YouTube動画の正常な再生
- [×] 進捗追跡機能の動作確認
- [×] レスポンシブ対応の確認
- [×] 進捗保存・復元機能の確認

## 完了条件
- [×] YouTube動画が正常に再生される
- [×] 動画の進捗が適切に追跡・保存される
- [×] レスポンシブデザインが実装されている
- [×] 進捗バーが正常に表示・更新される
- [×] 認証状態に応じて機能が制御される

## 注意事項
- YouTube IFrame APIを適切にロードする
- Client Componentとして実装する
- 進捗の保存は適度な間隔で行う
- メモリリークを防ぐためのクリーンアップを実装
- エラーハンドリングを適切に行う