import { NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase-service'

export const revalidate = 60

export async function GET() {
  const db = createServiceSupabase()

  const [{ data: reviews }, { data: orders }] = await Promise.all([
    db
      .from('reviews')
      .select('id, rating, text, created_at, product_id, user_profiles(username), products(title, images)')
      .eq('status', 'approved')
      .gte('rating', 4)
      .order('created_at', { ascending: false })
      .limit(20),
    db
      .from('orders')
      .select('id, order_number, roblox_username, items, delivered_at')
      .eq('status', 'delivered')
      .order('delivered_at', { ascending: false })
      .limit(20),
  ])

  const formattedReviews = (reviews ?? []).map((r: Record<string, unknown>) => ({
    id: r.id,
    rating: r.rating,
    text: r.text,
    created_at: r.created_at,
    username: (r.user_profiles as { username?: string } | null)?.username ?? 'Покупатель',
    product_title: (r.products as { title?: string } | null)?.title ?? '',
    product_image: ((r.products as { images?: string[] } | null)?.images ?? [])[0] ?? null,
  }))

  return NextResponse.json({ reviews: formattedReviews, orders: orders ?? [] })
}
