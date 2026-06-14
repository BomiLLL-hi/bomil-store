import { Suspense } from 'react'
import { getAllProducts } from '@/lib/supabase'
import { createServiceSupabase } from '@/lib/supabase-service'
import CatalogClient from '@/components/CatalogClient'
import HeroSection from '@/components/HeroSection'
import TrustBlock from '@/components/TrustBlock'
import FaqBlock from '@/components/FaqBlock'
import type { FaqItem } from '@/lib/types'

export const revalidate = 0

async function getFaq(): Promise<FaqItem[]> {
  try {
    const db = createServiceSupabase()
    const { data } = await db.from('faq').select('*').order('sort_order', { ascending: true })
    return (data ?? []) as FaqItem[]
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [products, faqItems] = await Promise.all([getAllProducts(), getFaq()])

  return (
    <>
      <HeroSection />
      <Suspense>
        <CatalogClient products={products} />
      </Suspense>
      <TrustBlock />
      <FaqBlock items={faqItems} />
    </>
  )
}
