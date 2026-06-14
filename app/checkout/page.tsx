'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/components/providers'
import { useAuth } from '@/components/AuthProvider'
import RobloxWidget from './RobloxWidget'
import type { OrderItem } from '@/lib/types'

export default function CheckoutPage() {
  const { t, price, cartItems, cartTotal } = useApp()
  const { user, profile } = useAuth()
  const router = useRouter()

  const [roblox, setRoblox] = useState<{ username: string; userId: number } | null>(null)
  const [guestEmail, setGuestEmail] = useState(user?.email ?? '')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleSelectRoblox(username: string, userId: number) {
    setRoblox(username ? { username, userId } : null)
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <svg className="w-16 h-16 text-[#333333] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <p className="text-white font-semibold text-lg mb-2">{t('checkout.empty_cart')}</p>
        <Link href="/" className="mt-4 px-5 py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-sm font-semibold rounded-lg transition-colors">
          {t('checkout.back')}
        </Link>
      </div>
    )
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())
  const canPay = !!roblox?.username && termsAccepted && emailValid && !loading

  async function handlePay() {
    if (!canPay) return
    setLoading(true)
    setError('')

    const items: OrderItem[] = cartItems.map(({ product, quantity }) => ({
      product_id: product.id,
      title: product.title,
      slug: product.slug,
      image: product.images[0] ?? null,
      price_rub: product.current_price,
      quantity,
    }))

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: guestEmail.trim(),
          roblox_username: roblox!.username,
          roblox_user_id: roblox!.userId,
          items,
          total_rub: cartTotal,
          user_id: user?.id ?? null,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Ошибка при создании заказа')
        setLoading(false)
        return
      }

      router.push(`/order/${json.order.id}`)
    } catch {
      setError('Ошибка соединения. Попробуйте ещё раз.')
      setLoading(false)
    }
  }

  return (
    <div className="px-4 md:px-6 max-w-3xl mx-auto py-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-[#888888] hover:text-white text-sm mb-8 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('checkout.back')}
      </Link>

      <h1 className="text-2xl font-bold text-white mb-8">{t('checkout.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Email */}
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-[#888888] uppercase tracking-wider mb-4">
              {t('checkout.email')}
            </h2>
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-[#0f0f0f] border border-[#333333] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#8b5cf6] transition-colors"
            />
          </div>

          {/* Roblox */}
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-[#888888] uppercase tracking-wider mb-4">
              {t('checkout.roblox_label')}
            </h2>
            <RobloxWidget
              onSelect={handleSelectRoblox}
              selected={roblox}
              initialQuery={profile?.roblox_username ?? ''}
            />
          </div>

          {/* Terms */}
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="relative mt-0.5">
              <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="sr-only" />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${termsAccepted ? 'bg-[#8b5cf6] border-[#8b5cf6]' : 'border-[#444444] bg-[#111111]'}`}>
                {termsAccepted && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-[#888888] leading-relaxed">
              {t('checkout.terms')}{' '}
              <Link href="/terms" className="text-[#8b5cf6] hover:underline">Terms</Link>
              {' '}&{' '}
              <Link href="/delivery" className="text-[#8b5cf6] hover:underline">Refund Policy</Link>
            </span>
          </label>
        </div>

        {/* Right: summary */}
        <div className="lg:col-span-2">
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 sticky top-24">
            <h2 className="text-sm font-semibold text-[#888888] uppercase tracking-wider mb-4">
              {t('checkout.order_summary')}
            </h2>

            <div className="space-y-3 mb-4">
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-3">
                  <div className="relative w-10 h-10 flex-shrink-0 bg-[#0d0d0d] rounded-lg overflow-hidden">
                    {product.images[0] ? (
                      <Image src={product.images[0]} alt={product.title} fill sizes="40px" className="object-contain p-1" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{product.title}</p>
                    {quantity > 1 && <p className="text-[#555555] text-xs">× {quantity}</p>}
                  </div>
                  <span className="text-[#8b5cf6] text-xs font-bold flex-shrink-0">
                    {price(product.current_price * quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#222222] pt-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-[#888888] text-sm">{t('checkout.total')}</span>
                <span className="text-white font-bold text-xl">{price(cartTotal)}</span>
              </div>
            </div>

            {error && (
              <p className="text-[#ef4444] text-xs text-center mb-3">{error}</p>
            )}

            <button
              disabled={!canPay}
              onClick={handlePay}
              className={`w-full py-3.5 rounded-lg font-semibold text-sm transition-colors ${
                canPay
                  ? 'bg-[#8b5cf6] hover:bg-[#7c3aed] text-white'
                  : 'bg-[#1a1a1a] text-[#555555] cursor-not-allowed border border-[#333333]'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Создание заказа...
                </span>
              ) : (
                <>{t('checkout.pay')} {canPay && `— ${price(cartTotal)}`}</>
              )}
            </button>

            {!canPay && !loading && (
              <p className="text-[#555555] text-xs text-center mt-2">
                {!emailValid ? 'Введите корректный email' : !roblox ? 'Выберите Roblox аккаунт' : !termsAccepted ? 'Примите условия использования' : ''}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
