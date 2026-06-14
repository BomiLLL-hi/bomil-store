'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useApp } from './providers'
import { useAuth } from './AuthProvider'
import type { Review } from '@/lib/types'

function Stars({ rating, interactive = false, onRate }: {
  rating: number
  interactive?: boolean
  onRate?: (r: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type={interactive ? 'button' : undefined}
          disabled={!interactive}
          onClick={() => onRate?.(n)}
          onMouseEnter={() => interactive && setHovered(n)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
        >
          <svg
            className={`w-5 h-5 transition-colors ${
              n <= (interactive ? (hovered || rating) : rating)
                ? 'text-[#f59e0b]'
                : 'text-[#333333]'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

function ReviewForm({ productId, onSubmitted }: { productId: string; onSubmitted: () => void }) {
  const { t } = useApp()
  const { user } = useAuth()
  const [eligibleOrderId, setEligibleOrderId] = useState<string | null | undefined>(undefined)
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) { setEligibleOrderId(null); return }
    fetch(`/api/reviews/eligible?product_id=${productId}`)
      .then(r => r.json())
      .then(d => setEligibleOrderId(d.order_id ?? null))
      .catch(() => setEligibleOrderId(null))
  }, [user, productId])

  if (!user) {
    return (
      <div className="text-center py-6 border border-dashed border-[#222222] rounded-xl">
        <p className="text-[#555555] text-sm mb-3">{t('reviews.login_required')}</p>
        <Link href="/auth" className="text-[#8b5cf6] text-sm font-medium hover:underline">
          {t('auth.login')} →
        </Link>
      </div>
    )
  }

  if (eligibleOrderId === undefined) return null

  if (eligibleOrderId === null) {
    return (
      <div className="text-center py-6 border border-dashed border-[#222222] rounded-xl">
        <p className="text-[#555555] text-sm">{t('reviews.need_purchase')}</p>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center py-6 border border-[#22c55e]/30 bg-[#22c55e]/5 rounded-xl">
        <svg className="w-8 h-8 text-[#22c55e] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-[#22c55e] text-sm font-medium">{t('reviews.submitted')}</p>
      </div>
    )
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating || submitting) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: eligibleOrderId, product_id: productId, rating, text }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Ошибка')
        setSubmitting(false)
        return
      }
      setDone(true)
      onSubmitted()
    } catch {
      setError('Ошибка соединения')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="bg-[#111111] border border-[#222222] rounded-xl p-5 space-y-4">
      <h3 className="text-white font-semibold text-sm">{t('reviews.write')}</h3>
      <div>
        <p className="text-[#555555] text-xs mb-2">{t('reviews.your_rating')}</p>
        <Stars rating={rating} interactive onRate={setRating} />
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={t('reviews.your_review')}
        rows={3}
        maxLength={500}
        className="w-full bg-[#0f0f0f] border border-[#333333] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#8b5cf6] transition-colors resize-none"
      />
      {error && <p className="text-[#ef4444] text-xs">{error}</p>}
      <button
        type="submit"
        disabled={!rating || submitting}
        className="px-5 py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:bg-[#1a1a1a] disabled:text-[#555555] text-white text-sm font-semibold rounded-lg transition-colors"
      >
        {submitting ? '...' : t('reviews.submit')}
      </button>
    </form>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function ProductReviews({ productId }: { productId: string }) {
  const { t } = useApp()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const res = await fetch(`/api/reviews?product_id=${productId}`)
    const data = await res.json()
    setReviews(data.reviews ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [productId]) // eslint-disable-line react-hooks/exhaustive-deps

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  return (
    <div className="mt-12">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-lg font-bold text-white">{t('reviews.title')}</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <Stars rating={Math.round(avg)} />
            <span className="text-[#888888] text-sm">{avg.toFixed(1)} · {reviews.length}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="bg-[#111111] border border-[#222222] rounded-xl p-4 animate-pulse">
                  <div className="h-3 bg-[#222222] rounded w-1/3 mb-3" />
                  <div className="h-3 bg-[#222222] rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-[#222222] rounded-xl">
              <p className="text-[#555555] text-sm">{t('reviews.no_reviews')}</p>
              <p className="text-[#333333] text-xs mt-1">{t('reviews.be_first')}</p>
            </div>
          ) : (
            reviews.map(r => (
              <div key={r.id} className="bg-[#111111] border border-[#222222] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Stars rating={r.rating} />
                    <span className="text-white text-sm font-medium">{r.username ?? 'Покупатель'}</span>
                  </div>
                  <span className="text-[#555555] text-xs">{formatDate(r.created_at)}</span>
                </div>
                {r.text && <p className="text-[#888888] text-sm leading-relaxed">{r.text}</p>}
              </div>
            ))
          )}
        </div>

        <ReviewForm productId={productId} onSubmitted={load} />
      </div>
    </div>
  )
}
