'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useApp } from './providers'
import type { Product } from '@/lib/types'

const STORAGE_KEY = 'mm2_recently_viewed'
const MAX_ITEMS = 8

export function trackRecentlyViewed(product: Product) {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const prev: Product[] = raw ? JSON.parse(raw) : []
    const filtered = prev.filter((p) => p.slug !== product.slug)
    const updated = [product, ...filtered].slice(0, MAX_ITEMS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {}
}

export default function RecentlyViewed({ currentSlug }: { currentSlug: string }) {
  const { t, price } = useApp()
  const [items, setItems] = useState<Product[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const all: Product[] = raw ? JSON.parse(raw) : []
      setItems(all.filter((p) => p.slug !== currentSlug).slice(0, 6))
    } catch {}
  }, [currentSlug])

  if (items.length === 0) return null

  return (
    <section className="mt-12">
      <h2 className="text-lg font-semibold text-white mb-4">{t('product.recently_viewed')}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/product/${item.slug}`}
            className="group block bg-[#111111] border border-[#222222] rounded-xl overflow-hidden hover:border-[#8b5cf6]/40 transition-colors"
          >
            <div className="relative aspect-square bg-[#0d0d0d]">
              {item.images[0] ? (
                <Image
                  src={item.images[0]}
                  alt={item.title}
                  fill
                  sizes="120px"
                  className="object-contain p-2"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="p-2">
              <p className="text-xs text-white truncate group-hover:text-[#8b5cf6] transition-colors">{item.title}</p>
              <p className="text-xs text-[#8b5cf6] font-semibold mt-0.5">{price(item.current_price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
