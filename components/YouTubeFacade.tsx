'use client'

import { useState } from 'react'

export default function YouTubeFacade({ videoId, title }: { videoId: string; title: string }) {
  const [playing, setPlaying] = useState(false)

  if (playing) {
    return (
      <iframe
        className="absolute inset-0 w-full h-full"
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  }

  return (
    <button
      onClick={() => setPlaying(true)}
      aria-label={title}
      className="absolute inset-0 w-full h-full flex items-center justify-center bg-[#111111] group"
    >
      <span className="flex items-center justify-center w-16 h-16 rounded-full bg-[#8b5cf6] group-hover:bg-[#7c3aed] transition-colors">
        <svg className="w-6 h-6 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
  )
}
