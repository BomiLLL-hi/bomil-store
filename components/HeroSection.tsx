'use client'

import Image from 'next/image'
import Link from 'next/link'

const TELEGRAM_SHOP_URL = 'https://telegram.me/BomilShop_bot'
const MAX_SHOP_URL = 'https://max.ru/id392301788835_bot'

export default function HeroSection() {
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
          Нажмите на кнопочку ниже, чтобы перейти в магазин ☺️
        </p>

        {/* CTA — links to the shops */}
        <div className="animate-fade-in-up flex flex-col sm:flex-row items-stretch gap-4 w-full max-w-md" style={{ animationDelay: '180ms' }}>
          <a
            href={TELEGRAM_SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#6d28d9] text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#8b5cf6]/30 hover:scale-105 active:scale-100"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.48 14.013l-2.95-.924c-.64-.204-.657-.64.136-.954l11.526-4.446c.537-.194 1.006.131.37.559z" />
            </svg>
            BOMIL SHOP в Telegram
          </a>

          <a
            href={MAX_SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-[#111111] hover:bg-[#1a1a1a] border border-[#8b5cf6]/40 hover:border-[#8b5cf6] text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#8b5cf6]/20 hover:scale-105 active:scale-100"
          >
            <Image src="/max-icon.png" alt="" width={20} height={20} unoptimized className="flex-shrink-0 rounded-md" />
            BOMIL SHOP в MAX
          </a>
        </div>

        <Link
          href="/how-to-buy"
          className="animate-fade-in-up mt-6 text-xl md:text-2xl font-bold text-white hover:text-[#a78bfa] underline underline-offset-4 decoration-[#8b5cf6]/50 hover:decoration-[#a78bfa] transition-colors"
          style={{ animationDelay: '220ms' }}
        >
          Туториал по покупке
        </Link>
      </div>
    </section>
  )
}
