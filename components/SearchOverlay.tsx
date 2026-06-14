'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Fuse from 'fuse.js'
import { createBrowserSupabase } from '@/lib/supabase-browser'
import { useApp } from './providers'
import type { Product } from '@/lib/types'

export default function SearchOverlay({ placeholder, className = '' }: { placeholder: string; className?: string }) {
  const { price } = useApp()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [fuse, setFuse] = useState<Fuse<Product> | null>(null)
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const loadedRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function loadProducts() {
    if (loadedRef.current) return
    loadedRef.current = true
    setLoading(true)
    const supabase = createBrowserSupabase()
    const { data } = await supabase.from('products').select('*').eq('hidden_status', false)
    if (data) {
      setFuse(new Fuse(data, { keys: ['title'], threshold: 0.2, minMatchCharLength: 2 }))
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    if (!fuse) return
    setResults(fuse.search(query).slice(0, 7).map(r => r.item))
  }, [query, fuse])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const showDropdown = open && query.trim().length > 0

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555] w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { setOpen(true); loadProducts() }}
          onKeyDown={e => { if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur() } }}
          placeholder={placeholder}
          className="w-full bg-[#111111] border border-[#222222] rounded-lg pl-10 pr-4 py-2.5 text-[16px] md:text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#8b5cf6] transition-colors"
        />
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-[#111111] border border-[#222222] rounded-xl overflow-hidden shadow-2xl z-50 animate-fade-in">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-8 text-center text-[#555555] text-sm">Ничего не найдено</div>
          ) : (
            <div>
              {results.map((product, i) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  onClick={() => { setOpen(false); setQuery('') }}
                  className={`flex items-center gap-3 px-3 py-2.5 hover:bg-[#1a1a1a] transition-colors ${i !== 0 ? 'border-t border-[#1a1a1a]' : ''}`}
                >
                  <div className="relative w-11 h-11 flex-shrink-0 bg-[#0d0d0d] rounded-lg overflow-hidden">
                    {product.images[0] ? (
                      <Image src={product.images[0]} alt={product.title} fill sizes="44px" className="object-contain p-1.5" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{product.title}</p>
                    <p className="text-[#8b5cf6] text-xs font-semibold mt-0.5">{price(product.current_price)}</p>
                  </div>
                  <svg className="w-4 h-4 text-[#444] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
