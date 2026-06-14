'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useApp } from './providers'

interface TrustReview {
  id: string
  rating: number
  text: string
  created_at: string
  username: string
  product_title: string
  product_image: string | null
}

interface TrustOrder {
  id: string
  order_number: string
  roblox_username: string
  items: { title: string; image: string | null; quantity: number }[]
  delivered_at: string | null
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <svg key={n} className={`w-3.5 h-3.5 ${n <= rating ? 'text-[#f59e0b]' : 'text-[#333333]'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function timeAgo(iso: string, lang: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (lang === 'ru') {
    if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`
    if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`
    return `${Math.floor(diff / 86400)} дн назад`
  }
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function ReviewCard({ review, lang }: { review: TrustReview; lang: string }) {
  return (
    <div className="flex-shrink-0 w-72 bg-[#111111] border border-[#222222] rounded-2xl p-4 snap-start">
      <div className="flex items-start gap-3 mb-3">
        {review.product_image ? (
          <div className="relative w-10 h-10 flex-shrink-0 rounded-xl overflow-hidden bg-[#0d0d0d]">
            <Image src={review.product_image} alt={review.product_title} fill sizes="40px" className="object-contain p-1" />
          </div>
        ) : (
          <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-[#1a1a1a]" />
        )}
        <div className="min-w-0">
          <p className="text-white text-xs font-semibold truncate">{review.product_title}</p>
          <StarRow rating={review.rating} />
        </div>
      </div>
      {review.text && (
        <p className="text-[#888888] text-xs leading-relaxed line-clamp-3 mb-3">{review.text}</p>
      )}
      <div className="flex items-center justify-between">
        <span className="text-[#555555] text-xs">{review.username}</span>
        <span className="text-[#333333] text-xs">{timeAgo(review.created_at, lang)}</span>
      </div>
    </div>
  )
}

function OrderCard({ order, lang }: { order: TrustOrder; lang: string }) {
  const firstItem = order.items[0]
  return (
    <div className="flex-shrink-0 w-72 bg-[#111111] border border-[#222222] rounded-2xl p-4 snap-start">
      <div className="flex items-start gap-3 mb-3">
        {firstItem?.image ? (
          <div className="relative w-10 h-10 flex-shrink-0 rounded-xl overflow-hidden bg-[#0d0d0d]">
            <Image src={firstItem.image} alt={firstItem.title} fill sizes="40px" className="object-contain p-1" />
          </div>
        ) : (
          <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-[#1a1a1a]" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-white text-xs font-semibold truncate">{firstItem?.title ?? '—'}</p>
          {order.items.length > 1 && (
            <p className="text-[#555555] text-xs">+{order.items.length - 1} товар{order.items.length - 1 > 1 ? 'а' : ''}</p>
          )}
          <div className="flex items-center gap-1 mt-1">
            <svg className="w-3 h-3 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-[#22c55e] text-xs font-medium">
              {lang === 'ru' ? 'Выдан' : 'Delivered'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[#555555] text-xs">👤 {order.roblox_username}</span>
        <span className="text-[#333333] text-xs">
          {order.delivered_at ? timeAgo(order.delivered_at, lang) : ''}
        </span>
      </div>
    </div>
  )
}

function Carousel({ children, autoScroll }: { children: React.ReactNode; autoScroll: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!autoScroll) return
    const el = ref.current
    if (!el) return

    intervalRef.current = setInterval(() => {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: 288 + 12, behavior: 'smooth' })
      }
    }, 3500)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [autoScroll])

  function pause() { if (intervalRef.current) clearInterval(intervalRef.current) }
  function resume() {
    if (!autoScroll) return
    const el = ref.current
    if (!el) return
    intervalRef.current = setInterval(() => {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: 288 + 12, behavior: 'smooth' })
      }
    }, 3500)
  }

  return (
    <div
      ref={ref}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={pause}
      className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2"
    >
      {children}
    </div>
  )
}

export default function TrustBlock() {
  const { t, lang } = useApp()
  const [tab, setTab] = useState<'reviews' | 'orders'>('reviews')
  const [reviews, setReviews] = useState<TrustReview[]>([])
  const [orders, setOrders] = useState<TrustOrder[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/trust')
      .then(r => r.json())
      .then(d => { setReviews(d.reviews ?? []); setOrders(d.orders ?? []); setLoaded(true) })
      .catch(() => setLoaded(true))
  }, [])

  const isEmpty = tab === 'reviews' ? reviews.length === 0 : orders.length === 0

  return (
    <section className="py-12 border-t border-[#161616]">
      <div className="px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="text-lg font-bold text-white">{t('trust.title')}</h2>
          <div className="flex bg-[#111111] border border-[#222222] rounded-xl p-1 gap-1">
            <button
              onClick={() => setTab('reviews')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === 'reviews' ? 'bg-[#8b5cf6] text-white' : 'text-[#888888] hover:text-white'
              }`}
            >
              {t('trust.reviews_tab')}
            </button>
            <button
              onClick={() => setTab('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === 'orders' ? 'bg-[#8b5cf6] text-white' : 'text-[#888888] hover:text-white'
              }`}
            >
              {t('trust.orders_tab')}
            </button>
          </div>
        </div>

        {!loaded ? (
          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex-shrink-0 w-72 h-32 bg-[#111111] border border-[#222222] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : isEmpty ? (
          <div className="text-center py-10 text-[#555555] text-sm">
            {tab === 'reviews' ? t('trust.no_reviews') : t('trust.no_orders')}
          </div>
        ) : (
          <Carousel autoScroll={true}>
            {tab === 'reviews'
              ? reviews.map(r => <ReviewCard key={r.id} review={r} lang={lang} />)
              : orders.map(o => <OrderCard key={o.id} order={o} lang={lang} />)
            }
          </Carousel>
        )}
      </div>
    </section>
  )
}
