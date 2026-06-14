'use client'

import Link from 'next/link'
import { useApp } from './providers'

export default function Footer() {
  const { t } = useApp()

  return (
    <footer className="mt-auto border-t border-[#222222] py-8 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[#555555] text-sm">
          © {new Date().getFullYear()} BOMIL SHOP. {t('footer.rights')}
        </p>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {[
            { label: t('footer.terms'), href: '/terms' },
            { label: t('footer.refund'), href: '/refund' },
            { label: t('footer.privacy'), href: '/privacy' },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-[#555555] hover:text-[#888888] text-sm transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
