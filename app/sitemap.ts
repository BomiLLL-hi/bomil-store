import type { MetadataRoute } from 'next'
import { getAllProducts } from '@/lib/supabase'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mm2store.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts()

  const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/product/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    ...productUrls,
  ]
}
