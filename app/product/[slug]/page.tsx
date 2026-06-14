import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductsByIds } from '@/lib/supabase'
import { createServiceSupabase } from '@/lib/supabase-service'
import RecentlyViewed from '@/components/RecentlyViewed'
import SetItems from '@/components/SetItems'
import ProductReviews from '@/components/ProductReviews'
import ImageGallery from './ImageGallery'
import ProductActions from './ProductActions'

export const revalidate = 0

async function getProductBySlug(slug: string) {
  const db = createServiceSupabase()
  const { data } = await db
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('hidden_status', false)
    .single()
  return data ?? null
}

const CATEGORY_LABELS: Record<string, string> = {
  godly: 'Godly',
  chroma: 'Chroma',
  vintage: 'Vintage',
  set: 'Set',
  pet: 'Pet',
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Product Not Found' }

  return {
    title: product.title,
    description: product.description || `Buy ${product.title} in MM2Store. Fast delivery.`,
    openGraph: {
      title: product.title,
      description: product.description || `Buy ${product.title} in MM2Store.`,
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  }
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ from?: string }>
}) {
  const { slug } = await params
  const { from } = await searchParams
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const setItems =
    product.is_set && product.included_items.length > 0
      ? await getProductsByIds(product.included_items)
      : []

  const inStock = product.stock_status === 'in_stock'

  const fromSet = from ? await getProductBySlug(from) : null

  return (
    <div className="px-4 md:px-6 max-w-7xl mx-auto py-8">
      {/* Back link */}
      <Link
        href={fromSet ? `/product/${fromSet.slug}` : '/'}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-[#a78bfa] hover:bg-[#8b5cf6]/20 hover:border-[#8b5cf6]/60 hover:text-white text-sm font-medium mb-8 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {fromSet ? `Вернуться к ${fromSet.title}` : 'К каталогу'}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image gallery (client for thumbnail interaction) */}
        <ImageGallery images={product.images} title={product.title} />

        {/* Info */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs px-2.5 py-1 rounded-md bg-[#111111] border border-[#222222] text-[#888888]">
              {CATEGORY_LABELS[product.category] ?? product.category}
            </span>
            <span className={`text-sm font-medium ${inStock ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
              {inStock ? 'В наличии' : 'Нет в наличии'}
            </span>
            {product.is_best_of_all_time && (
              <span className="text-xs px-2.5 py-1 rounded-md bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 text-[#8b5cf6]">
                ⭐ Лучшее
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white">{product.title}</h1>

          {/* Price (client for currency conversion) */}
          <ProductActions
            product={product}
            inStock={inStock}
          />

          {product.description && (
            <div>
              <h2 className="text-sm font-semibold text-[#888888] uppercase tracking-wider mb-2">
                Описание
              </h2>
              <p className="text-[#888888] text-sm leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Set items */}
      {product.is_set && setItems.length > 0 && (
        <SetItems items={setItems} label="Товары в сете" setSlug={slug} />
      )}

      {/* Reviews */}
      <ProductReviews productId={product.id} />

      {/* Recently viewed (client, localStorage) */}
      <RecentlyViewed currentSlug={slug} />
    </div>
  )
}
