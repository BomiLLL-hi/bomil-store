'use client'

import { useEffect, useState } from 'react'
import { useApp } from '@/components/providers'
import { trackRecentlyViewed } from '@/components/RecentlyViewed'
import type { Product } from '@/lib/types'

export default function ProductActions({
  product,
  inStock,
}: {
  product: Product
  inStock: boolean
}) {
  const { t, price, addToCart, cartItems } = useApp()
  const [justAdded, setJustAdded] = useState(false)

  const inCart = cartItems.some(item => item.product.id === product.id)

  useEffect(() => {
    trackRecentlyViewed(product)
  }, [product.slug])

  function handleAddToCart() {
    addToCart(product)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1500)
  }

  return (
    <div className="space-y-4">
      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-[#8b5cf6]">
          {price(product.current_price)}
        </span>
        {product.old_price && (
          <span className="text-lg text-[#555555] line-through">
            {price(product.old_price)}
          </span>
        )}
      </div>

      {/* Add to cart */}
      <button
        disabled={!inStock}
        onClick={handleAddToCart}
        className={`w-full py-3.5 rounded-lg font-semibold text-sm transition-all ${
          !inStock
            ? 'bg-[#1a1a1a] text-[#555555] cursor-not-allowed border border-[#333333]'
            : inCart || justAdded
            ? 'bg-[#22c55e]/20 border border-[#22c55e]/40 text-[#22c55e]'
            : 'bg-[#8b5cf6] hover:bg-[#7c3aed] text-white'
        }`}
      >
        {!inStock
          ? t('product.sold_out_btn')
          : justAdded
          ? '✓ Добавлено!'
          : inCart
          ? '✓ В корзине'
          : t('product.add_to_cart')}
      </button>
    </div>
  )
}
