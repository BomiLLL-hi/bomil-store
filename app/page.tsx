import { createServiceSupabase } from '@/lib/supabase-service'
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
  const faqItems = await getFaq()

  return (
    <>
      <HeroSection />
      <TrustBlock />
      <FaqBlock items={faqItems} />
    </>
  )
}
