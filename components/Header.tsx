'use client'

import Link from 'next/link'
import { useApp } from './providers'
import { useAuth } from './AuthProvider'
import SearchOverlay from './SearchOverlay'

const NAV_LINKS = [
  { href: '/how-to-buy', label: 'Как купить?' },
  { href: '/support', label: 'Техподдержка' },
]

export function HeaderInner() {
  const { lang, currency, setLang, setCurrency, t, cartCount, setCartOpen } = useApp()
  const { user, loading } = useAuth()

  return (
    <>
      {/* Main header row */}
      <div className="h-16 flex items-center justify-between gap-4 px-4 md:px-6 max-w-7xl mx-auto w-full">
        {/* Logo + nav links */}
        <div className="flex items-center gap-10 flex-shrink-0">
          <Link href="/" className="font-bold text-xl tracking-tight">
            <span className="text-white">BOMIL</span>
            <span className="text-[#8b5cf6]"> SHOP</span>
          </Link>
          <div className="hidden md:flex items-center gap-4">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-semibold text-[#a78bfa] hover:text-[#c4b5fd] transition-colors whitespace-nowrap"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop search */}
        <div className="hidden md:flex flex-1 max-w-lg">
          <SearchOverlay placeholder={t('search.placeholder')} className="w-full" />
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Lang switcher — desktop */}
          <div className="hidden md:flex items-center gap-1 text-sm">
            <button onClick={() => setLang('ru')} className={`px-2 py-1 rounded transition-colors ${lang === 'ru' ? 'text-[#8b5cf6] font-semibold' : 'text-[#888888] hover:text-white'}`}>RU</button>
            <span className="text-[#333333]">|</span>
            <button onClick={() => setLang('en')} className={`px-2 py-1 rounded transition-colors ${lang === 'en' ? 'text-[#8b5cf6] font-semibold' : 'text-[#888888] hover:text-white'}`}>EN</button>
          </div>

          {/* Currency switcher — desktop */}
          <div className="hidden md:flex items-center gap-1 text-sm">
            <button onClick={() => setCurrency('rub')} className={`px-2 py-1 rounded transition-colors ${currency === 'rub' ? 'text-[#8b5cf6] font-semibold' : 'text-[#888888] hover:text-white'}`}>₽</button>
            <span className="text-[#333333]">|</span>
            <button onClick={() => setCurrency('usd')} className={`px-2 py-1 rounded transition-colors ${currency === 'usd' ? 'text-[#8b5cf6] font-semibold' : 'text-[#888888] hover:text-white'}`}>$</button>
          </div>

          {/* Cart */}
          <button onClick={() => setCartOpen(true)} aria-label={t('header.cart')} className="relative p-2 text-[#888888] hover:text-white transition-all duration-150 active:scale-90">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-[#8b5cf6] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

          {/* Lang + Currency — mobile */}
          <button onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')} className="md:hidden px-2 py-1 text-sm font-semibold text-[#8b5cf6] border border-[#8b5cf6]/40 rounded-lg hover:bg-[#8b5cf6]/10 transition-colors">
            {lang.toUpperCase()}
          </button>
          <button onClick={() => setCurrency(currency === 'rub' ? 'usd' : 'rub')} className="md:hidden px-2 py-1 text-sm font-semibold text-[#8b5cf6] border border-[#8b5cf6]/40 rounded-lg hover:bg-[#8b5cf6]/10 transition-colors">
            {currency === 'rub' ? 'РУБ' : 'USD'}
          </button>

          {/* Profile — desktop */}
          {loading ? (
            <div className="hidden md:block w-8 h-8 rounded-full bg-[#1a1a1a] animate-pulse" />
          ) : user ? (
            <Link href="/profile" aria-label={t('header.profile')} className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 text-[#8b5cf6] text-xs font-bold hover:bg-[#8b5cf6]/30 transition-colors">
              {(user.email?.[0] ?? '?').toUpperCase()}
            </Link>
          ) : (
            <Link href="/auth" aria-label={t('header.profile')} className="hidden md:block p-2 text-[#888888] hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          )}

          {/* Profile — mobile */}
          {!loading && (user ? (
            <Link href="/profile" aria-label={t('header.profile')} className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 text-[#8b5cf6] text-xs font-bold hover:bg-[#8b5cf6]/30 transition-colors">
              {(user.email?.[0] ?? '?').toUpperCase()}
            </Link>
          ) : (
            <Link href="/auth" aria-label={t('header.profile')} className="md:hidden p-2 text-[#888888] hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile search + nav links */}
      <div className="md:hidden px-4 pb-3 max-w-7xl mx-auto w-full space-y-2">
        <SearchOverlay placeholder={t('search.placeholder')} className="w-full" />
        <div className="flex gap-3">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs text-[#888888] hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#0f0f0f]/95 backdrop-blur-sm border-b border-[#222222]">
      <HeaderInner />
    </header>
  )
}
