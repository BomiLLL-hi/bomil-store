'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useApp } from './providers'
import ProductCard from './ProductCard'
import type { Product, CatalogCategory, SortOption, TypeFilter } from '@/lib/types'

const CATEGORIES: { key: CatalogCategory; labelKey: string }[] = [
  { key: 'all', labelKey: 'nav.all' },
  { key: 'godly', labelKey: 'nav.godly' },
  { key: 'chroma', labelKey: 'nav.chromas' },
  { key: 'vintage', labelKey: 'nav.vintage' },
  { key: 'set', labelKey: 'nav.sets' },
  { key: 'pet', labelKey: 'nav.pets' },
  { key: 'best', labelKey: 'nav.best' },
]

const SORT_OPTIONS: { key: SortOption; labelKey: string }[] = [
  { key: 'price_asc', labelKey: 'filter.cheap_to_exp' },
  { key: 'price_desc', labelKey: 'filter.exp_to_cheap' },
]

const TYPE_OPTIONS: { key: TypeFilter; labelKey: string }[] = [
  { key: 'knife', labelKey: 'filter.knives' },
  { key: 'gun', labelKey: 'filter.guns' },
]

function CategoryBar({ active, onChange }: { active: CatalogCategory; onChange: (c: CatalogCategory) => void }) {
  const { t } = useApp()
  return (
    <div className="border-b border-[#222222] bg-[#0f0f0f]">
      <div className="flex justify-center overflow-x-auto scrollbar-none px-4 md:px-6 max-w-7xl mx-auto">
        {CATEGORIES.map(({ key, labelKey }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              active === key
                ? 'border-[#8b5cf6] text-[#8b5cf6]'
                : 'border-transparent text-[#888888] hover:text-white'
            }`}
          >
            {t(labelKey as Parameters<typeof t>[0])}
          </button>
        ))}
      </div>
    </div>
  )
}

function FilterButton({
  sort, typeFilter, onSort, onType, onReset,
}: {
  sort: SortOption; typeFilter: TypeFilter
  onSort: (s: SortOption) => void; onType: (t: TypeFilter) => void; onReset: () => void
}) {
  const { t } = useApp()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const activeCount = (sort ? 1 : 0) + (typeFilter ? 1 : 0)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
          open || activeCount > 0
            ? 'bg-[#8b5cf6]/10 border-[#8b5cf6] text-[#8b5cf6]'
            : 'border-[#333333] text-[#888888] hover:border-[#8b5cf6] hover:text-[#8b5cf6]'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h2" />
        </svg>
        {t('filter.title')}
        {activeCount > 0 && (
          <span className="w-4 h-4 bg-[#8b5cf6] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full mt-2 right-0 bg-[#111111] border border-[#222222] rounded-xl p-4 shadow-2xl z-30 min-w-[200px] animate-fade-in">
          <p className="text-[#555555] text-xs font-semibold uppercase tracking-wider mb-2">{t('filter.sort')}</p>
          <div className="flex flex-col gap-1 mb-4">
            {SORT_OPTIONS.map(({ key, labelKey }) => (
              <button
                key={key}
                onClick={() => onSort(sort === key ? '' : key)}
                className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                  sort === key ? 'bg-[#8b5cf6]/15 text-[#8b5cf6]' : 'text-[#888888] hover:text-white hover:bg-[#1a1a1a]'
                }`}
              >
                {t(labelKey as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>
          <p className="text-[#555555] text-xs font-semibold uppercase tracking-wider mb-2">{t('filter.type')}</p>
          <div className="flex flex-col gap-1">
            {TYPE_OPTIONS.map(({ key, labelKey }) => (
              <button
                key={key}
                onClick={() => onType(typeFilter === key ? '' : key)}
                className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                  typeFilter === key ? 'bg-[#8b5cf6]/15 text-[#8b5cf6]' : 'text-[#888888] hover:text-white hover:bg-[#1a1a1a]'
                }`}
              >
                {t(labelKey as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>
          {activeCount > 0 && (
            <button
              onClick={() => { onReset(); setOpen(false) }}
              className="mt-3 w-full py-2 rounded-lg border border-[#333333] text-[#888888] hover:text-white hover:border-[#444444] text-sm transition-colors"
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function CatalogClient({ products }: { products: Product[] }) {
  const { t } = useApp()
  const searchParams = useSearchParams()

  const category = (searchParams.get('category') as CatalogCategory) || 'all'
  const sort = (searchParams.get('sort') as SortOption) || ''
  const typeFilter = (searchParams.get('type') as TypeFilter) || ''

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    window.history.replaceState(null, '', `/?${params.toString()}`)
  }

  const filtered = useMemo(() => {
    let result = products

    if (category === 'best') {
      result = result.filter((p) => p.is_best_of_all_time)
    } else if (category !== 'all') {
      result = result.filter((p) =>
        p.category === category || (p.extra_categories ?? []).includes(category)
      )
    }

    if (typeFilter) {
      result = result.filter((p) => p.type === typeFilter)
    }

    if (sort === 'price_asc') {
      result = [...result].sort((a, b) => a.current_price - b.current_price)
    } else if (sort === 'price_desc') {
      result = [...result].sort((a, b) => b.current_price - a.current_price)
    }

    return result
  }, [products, category, sort, typeFilter])

  return (
    <div id="catalog">
      <CategoryBar
        active={category}
        onChange={(c) => updateParam('category', c === 'all' ? '' : c)}
      />

      <div className="px-4 md:px-6 max-w-7xl mx-auto py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link
            href="/delivery"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#333333] text-[#888888] hover:border-[#8b5cf6] hover:text-[#8b5cf6] text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Как купить
          </Link>
          <Link
            href="/contacts"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#333333] text-[#888888] hover:border-[#8b5cf6] hover:text-[#8b5cf6] text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Техподдержка
          </Link>
        </div>
        <FilterButton
          sort={sort}
          typeFilter={typeFilter}
          onSort={(s) => updateParam('sort', s)}
          onType={(tp) => updateParam('type', tp)}
          onReset={() => {
            const params = new URLSearchParams(searchParams.toString())
            params.delete('sort')
            params.delete('type')
            const qs = params.toString()
            window.history.replaceState(null, '', qs ? `/?${qs}` : '/')
          }}
        />
      </div>

      <div className="px-4 md:px-6 max-w-7xl mx-auto pb-12">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <svg className="w-16 h-16 text-[#333333] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[#555555] text-lg">{t('catalog.empty')}</p>
          </div>
        ) : (
          <div key={`${category}-${sort}-${typeFilter}`} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
