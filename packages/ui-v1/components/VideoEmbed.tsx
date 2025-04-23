'use client'

import {PlayCircle} from 'lucide-react'
import React from 'react'
import {cn} from '@openint/shadcn/lib/utils'

interface VideoEmbedProps {
  videoId: string
  title?: string
  className?: string
}

export function VideoEmbed({
  videoId,
  title = 'YouTube video player',
  className,
}: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = React.useState(false)

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

  const handlePlayClick = () => {
    setIsPlaying(true)
  }

  return (
    <div
      className={cn(
        'relative aspect-video w-full overflow-hidden rounded-lg shadow-lg',
        className,
      )}>
      {isPlaying ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <div className="absolute inset-0">
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
          <button
            onClick={handlePlayClick}
            className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 text-white transition-colors hover:bg-black/60 focus:outline-none"
            aria-label="Play video">
            <PlayCircle className="h-16 w-16 opacity-80" />
          </button>
        </div>
      )}
    </div>
  )
}
