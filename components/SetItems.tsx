import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/types'

export default function SetItems({
  items,
  label,
  setSlug,
}: {
  items: Product[]
  label: string
  setSlug?: string
}) {
  if (!items.length) return null

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-white mb-4">{label}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/product/${item.slug}${setSlug ? `?from=${setSlug}` : ''}`}
            className="group flex items-center gap-3 bg-[#111111] border border-[#222222] rounded-xl p-3 hover:border-[#8b5cf6]/40 transition-colors"
          >
            <div className="relative w-24 h-24 flex-shrink-0 bg-[#0d0d0d] rounded-lg overflow-hidden">
              {item.images[0] ? (
                <Image
                  src={item.images[0]}
                  alt={item.title}
                  fill
                  sizes="96px"
                  className="object-contain p-2"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-12 h-12 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-base text-white truncate group-hover:text-[#8b5cf6] transition-colors">{item.title}</p>
              <p className="text-sm text-[#888888] capitalize mt-1">{item.category}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
