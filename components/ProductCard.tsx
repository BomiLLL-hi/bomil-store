'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useApp } from './providers'
import type { Product } from '@/lib/types'

const CATEGORY_LABELS: Record<string, string> = {
  godly: 'Godly',
  chroma: 'Chroma',
  vintage: 'Vintage',
  set: 'Set',
  pet: 'Pet',
}

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { t, price, addToCart, removeFromCart, setCartOpen, cartItems } = useApp()
  const inStock = product.stock_status === 'in_stock'
  const image = product.images[0] ?? null
  const inCart = cartItems.some(item => item.product.id === product.id)

  function handleAddToCart() {
    if (inCart) { removeFromCart(product.id); return }
    addToCart(product)
    setTimeout(() => setCartOpen(true), 800)
  }

  return (
    <div
      className="animate-fade-in-up group flex flex-col bg-[#161616] border border-[#242424] rounded-3xl p-3 gap-3 hover:border-[#8b5cf6]/40 hover:shadow-xl hover:shadow-[#8b5cf6]/10 transition-all duration-300"
      style={{ animationDelay: `${Math.min(index * 35, 280)}ms` }}
    >

      {/* Image */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-square rounded-2xl overflow-hidden bg-[#0f0f0f]">
        {image ? (
          <Image
            src={image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-12 h-12 text-[#2a2a2a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {!inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl">
            <span className="text-[#ef4444] font-bold text-sm uppercase tracking-wider">
              {t('product.sold_out')}
            </span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-col items-center text-center gap-1 px-1">
        <Link href={`/product/${product.slug}`} className="w-full">
          <h3 className="text-sm font-bold text-white truncate group-hover:text-[#a78bfa] transition-colors duration-200">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-baseline justify-center gap-1.5">
          <span className="text-white font-bold text-sm">
            {price(product.current_price)}
          </span>
          {product.old_price && (
            <span className="text-[#555555] text-xs line-through">
              {price(product.old_price)}
            </span>
          )}
        </div>

        <span className="text-[#666666] text-xs">
          {CATEGORY_LABELS[product.category] ?? product.category}
        </span>
      </div>

      {/* Button */}
      <button
        onClick={handleAddToCart}
        disabled={!inStock}
        className={`w-full py-2.5 md:py-1.5 rounded-full text-xs font-semibold ${inCart ? 'active:scale-95' : ''} ${
          inCart
            ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30'
            : inStock
            ? 'bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white border border-transparent'
            : 'bg-[#1a1a1a] text-[#444444] cursor-not-allowed border border-[#222222]'
        }`}
      >
        <span className="flex items-center justify-center gap-1.5">
          {inCart ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              {t('product.added')}
            </>
          ) : (
            t('product.add_to_cart')
          )}
        </span>
      </button>

    </div>
  )
}
