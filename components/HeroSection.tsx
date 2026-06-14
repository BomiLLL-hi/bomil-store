'use client'

import { useApp } from './providers'

export default function HeroSection() {
  const { t } = useApp()

  function scrollToCatalog() {
    const el = document.getElementById('catalog')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative overflow-hidden bg-[#0a0a0a] border-b border-[#1a1a1a]">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-40%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#8b5cf6]/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[300px] h-[200px] bg-[#6d28d9]/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-20%] right-[20%] w-[300px] h-[200px] bg-[#8b5cf6]/10 rounded-full blur-[80px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#8b5cf6 1px, transparent 1px), linear-gradient(to right, #8b5cf6 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="animate-fade-in inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 text-[#a78bfa] text-xs font-semibold uppercase tracking-widest mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
          Murder Mystery 2
        </div>

        {/* Title */}
        <h1 className="animate-fade-in-up text-5xl md:text-7xl font-black tracking-tight mb-4" style={{ animationDelay: '60ms' }}>
          <span className="text-white">BOMIL</span>
          <span className="bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] bg-clip-text text-transparent"> SHOP</span>
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-in-up text-[#888888] text-base md:text-lg max-w-md mb-8 leading-relaxed" style={{ animationDelay: '120ms' }}>
          Ножи, пушки, питомцы и наборы MM2 — быстрая доставка, проверенный продавец
        </p>

        {/* CTA */}
        <button
          onClick={scrollToCatalog}
          className="animate-fade-in-up group relative inline-flex items-center gap-2 px-6 py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#8b5cf6]/30 hover:scale-105 active:scale-100"
          style={{ animationDelay: '180ms' }}
        >
          Смотреть товары
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Stats */}
        <div className="animate-fade-in-up flex items-center gap-8 mt-12 text-center" style={{ animationDelay: '240ms' }}>
          <div>
            <p className="text-white font-bold text-xl">500+</p>
            <p className="text-[#555555] text-xs mt-0.5">товаров</p>
          </div>
          <div className="w-px h-8 bg-[#222222]" />
          <div>
            <p className="text-white font-bold text-xl">1000+</p>
            <p className="text-[#555555] text-xs mt-0.5">заказов</p>
          </div>
          <div className="w-px h-8 bg-[#222222]" />
          <div>
            <p className="text-white font-bold text-xl">24/7</p>
            <p className="text-[#555555] text-xs mt-0.5">поддержка</p>
          </div>
        </div>
      </div>
    </section>
  )
}
