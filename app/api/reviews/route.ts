import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { createServiceSupabase } from '@/lib/supabase-service'

// GET /api/reviews?product_id=...
export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get('product_id')
  if (!productId) return NextResponse.json({ reviews: [] })

  const db = createServiceSupabase()
  const { data } = await db
    .from('reviews')
    .select('*, user_profiles(username)')
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  const reviews = (data ?? []).map((r: Record<string, unknown>) => ({
    ...r,
    username: (r.user_profiles as { username?: string } | null)?.username ?? null,
    user_profiles: undefined,
  }))

  return NextResponse.json({ reviews })
}

// POST /api/reviews  { order_id, product_id, rating, text }
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { order_id, product_id, rating, text } = await req.json()
  if (!order_id || !product_id || !rating) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
  }

  const db = createServiceSupabase()

  // Verify order belongs to user and is delivered
  const { data: order } = await db
    .from('orders')
    .select('id, user_id, status')
    .eq('id', order_id)
    .single()

  if (!order || order.user_id !== user.id || order.status !== 'delivered') {
    return NextResponse.json({ error: 'Order not eligible' }, { status: 403 })
  }

  // Check no duplicate review for this order
  const { data: existing } = await db
    .from('reviews')
    .select('id')
    .eq('order_id', order_id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Already reviewed' }, { status: 409 })
  }

  const { data: review, error } = await db
    .from('reviews')
    .insert({ user_id: user.id, order_id, product_id, rating, text: text ?? '' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ review })
}
