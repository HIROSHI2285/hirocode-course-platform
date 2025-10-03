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