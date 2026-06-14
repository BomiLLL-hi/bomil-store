import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Техподдержка — BOMIL SHOP',
}

export default function SupportPage() {
  return (
    <div className="px-4 md:px-6 max-w-3xl mx-auto py-12">
      <Link href="/" className="inline-flex items-center gap-1.5 text-[#888888] hover:text-white text-sm mb-10 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        На главную
      </Link>
      <h1 className="text-3xl font-bold text-white mb-3">Техподдержка</h1>
      <p className="text-[#555555] text-sm">Страница в разработке.</p>
    </div>
  )
}
