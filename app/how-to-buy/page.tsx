import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Как купить — BOMIL SHOP',
}

export default function HowToBuyPage() {
  return (
    <div className="px-4 md:px-6 max-w-3xl mx-auto py-12">
      <Link href="/" className="inline-flex items-center gap-1.5 text-[#888888] hover:text-white text-sm mb-10 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        На главную
      </Link>
      <h1 className="text-3xl font-bold text-white mb-10">Как купить?</h1>

      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Туториал по покупке через Telegram</h2>
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-[#222222]">
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube-nocookie.com/embed/b9Uw13nCKZU"
            title="Как купить через Telegram"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white mb-4">Покупка через MAX</h2>
        <div className="flex items-center justify-center w-full aspect-video rounded-2xl border border-[#222222] bg-[#111111] text-[#555555] text-sm">
          Видео скоро появится
        </div>
      </section>
    </div>
  )
}
