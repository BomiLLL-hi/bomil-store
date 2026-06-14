import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import { AppProvider } from '@/components/providers'
import { AuthProvider } from '@/components/AuthProvider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CartDrawer from '@/components/CartDrawer'
import LiveChat from '@/components/LiveChat'
import { getUsdRate } from '@/lib/supabase'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'MM2Store — Buy MM2 Items',
    template: '%s | MM2Store',
  },
  description: 'Покупайте предметы Murder Mystery 2 — ножи, пушки, питомцы и наборы. Быстрая доставка, проверенный продавец.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mm2store.com'),
  openGraph: {
    siteName: 'MM2Store',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const usdRate = await getUsdRate()

  return (
    <html lang="ru" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <AppProvider usdRate={usdRate}>
          <AuthProvider>
            <Suspense fallback={<div className="h-16 bg-[#0f0f0f] border-b border-[#222222]" />}>
              <Header />
            </Suspense>
            <CartDrawer />
            <main className="flex-1">{children}</main>
            <Footer />
            <LiveChat />
          </AuthProvider>
        </AppProvider>
      </body>
    </html>
  )
}
