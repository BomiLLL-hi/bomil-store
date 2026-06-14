'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useApp } from './providers'

export default function CartDrawer() {
  const { t, price, cartItems, cartCount, cartTotal, removeFromCart, changeQuantity, clearCart, cartOpen, setCartOpen } = useApp()
  const [rendered, setRendered] = useState(false)
  const [show, setShow] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    if (cartOpen) {
      setRendered(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setShow(true)))
      document.body.style.overflow = 'hidden'
    } else {
      setShow(false)
      const timer = setTimeout(() => setRendered(false), 300)
      document.body.style.overflow = ''
      return () => clearTimeout(timer)
    }
    return () => { document.body.style.overflow = '' }
  }, [cartOpen])

  if (!rendered) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay — full screen, fade in sync with drawer */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${show ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer */}
      <div className={`absolute top-0 right-0 w-full max-w-sm bg-[#0f0f0f] border-l border-[#222222] flex flex-col h-[100dvh] transition-transform duration-300 ease-out ${show ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#222222]">
          <div className="flex items-center gap-2">
            <h2 className="text-white font-semibold text-lg">{t('cart.title')}</h2>
            {cartCount > 0 && (
              <span className="bg-[#8b5cf6] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-1.5 text-[#888888] hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <svg className="w-16 h-16 text-[#333333] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-[#888888] font-medium">{t('cart.empty')}</p>
              <p className="text-[#555555] text-sm mt-1">{t('cart.empty_desc')}</p>
              <button
                onClick={() => setCartOpen(false)}
                className="mt-6 text-[#8b5cf6] hover:text-[#7c3aed] text-sm font-medium transition-colors"
              >
                {t('cart.browse')}
              </button>
            </div>
          ) : (
            cartItems.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex items-center gap-3 bg-[#111111] border border-[#222222] rounded-xl p-3"
              >
                <div className="relative w-14 h-14 flex-shrink-0 bg-[#0d0d0d] rounded-lg overflow-hidden">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      sizes="56px"
                      className="object-contain p-1"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-7 h-7 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{product.title}</p>
                  <p className="text-[#8b5cf6] text-sm font-bold mt-0.5">{price(product.current_price * quantity)}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => changeQuantity(product.id, -1)}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-[#1a1a1a] text-[#888888] hover:text-white hover:bg-[#222222] transition-all duration-150 active:scale-90 text-lg leading-none"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-white text-sm font-semibold">{quantity}</span>
                  <button
                    onClick={() => changeQuantity(product.id, +1)}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-[#1a1a1a] text-[#888888] hover:text-white hover:bg-[#222222] transition-all duration-150 active:scale-90 text-lg leading-none"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="px-5 py-4 border-t border-[#222222] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#888888] text-sm">{t('cart.subtotal')}</span>
              <span className="text-white font-bold text-lg">{price(cartTotal)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={() => setCartOpen(false)}
              className="block w-full py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-sm font-semibold rounded-lg text-center transition-all duration-150 active:scale-[0.98] hover:shadow-lg hover:shadow-[#8b5cf6]/30"
            >
              {t('cart.checkout')}
            </Link>
            <button
              onClick={() => setConfirmClear(true)}
              className="w-full py-2 text-[#555555] hover:text-[#888888] text-sm transition-colors"
            >
              {t('cart.clear')}
            </button>
          </div>
        )}
      </div>

      {/* Confirm clear dialog */}
      {confirmClear && (
        <div className="absolute inset-0 z-10 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xs bg-[#111111] border border-[#222222] rounded-2xl p-5 space-y-4 animate-scale-in">
            <p className="text-white font-semibold text-center">Очистить корзину?</p>
            <p className="text-[#888888] text-sm text-center">Все товары будут удалены</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmClear(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#333333] text-[#888888] hover:text-white hover:border-[#444444] text-sm font-medium transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => { clearCart(); setConfirmClear(false) }}
                className="flex-1 py-2.5 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/20 text-sm font-medium transition-colors"
              >
                Очистить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
