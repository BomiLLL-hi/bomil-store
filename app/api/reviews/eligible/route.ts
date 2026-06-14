import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { createServiceSupabase } from '@/lib/supabase-service'

// GET /api/reviews/eligible?product_id=...
// Returns order_id if the current user has a delivered order containing this product
// and hasn't reviewed it yet. Returns null otherwise.
export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get('product_id')
  if (!productId) return NextResponse.json({ order_id: null })

  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ order_id: null })

  const db = createServiceSupabase()

  // Find delivered orders by this user containing this product
  const { data: orders } = await db
    .from('orders')
    .select('id, items')
    .eq('user_id', user.id)
    .eq('status', 'delivered')

  const eligible = (orders ?? []).find(o =>
    Array.isArray(o.items) && o.items.some((item: { product_id: string }) => item.product_id === productId)
  )

  if (!eligible) return NextResponse.json({ order_id: null })

  // Check not already reviewed
  const { data: existing } = await db
    .from('reviews')
    .select('id')
    .eq('order_id', eligible.id)
    .single()

  if (existing) return NextResponse.json({ order_id: null })

  return NextResponse.json({ order_id: eligible.id })
}
