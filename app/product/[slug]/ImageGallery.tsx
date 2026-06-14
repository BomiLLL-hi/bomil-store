'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function ImageGallery({
  images,
  title,
}: {
  images: string[]
  title: string
}) {
  const [active, setActive] = useState(0)

  return (
    <div className="space-y-3">
      <div className="relative aspect-square bg-[#111111] rounded-xl overflow-hidden border border-[#222222]">
        {images[active] ? (
          <Image
            src={images[active]}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain p-8"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-24 h-24 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActive(idx)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                active === idx ? 'border-[#8b5cf6]' : 'border-[#222222] hover:border-[#444444]'
              }`}
            >
              <Image
                src={img}
                alt={`${title} ${idx + 1}`}
                fill
                sizes="64px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
