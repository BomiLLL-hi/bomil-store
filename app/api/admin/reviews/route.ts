import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { createServiceSupabase } from '@/lib/supabase-service'

async function requireAdmin(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const db = createServiceSupabase()
  const { data: profile } = await db.from('user_profiles').select('role').eq('id', user.id).single()
  if (!profile || (profile.role !== 'admin' && profile.role !== 'operator')) return null
  return user
}

// GET — all reviews for moderation
export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const db = createServiceSupabase()
  const status = req.nextUrl.searchParams.get('status') ?? 'pending'
  const { data } = await db
    .from('reviews')
    .select('*, user_profiles(username), products(title, images)')
    .eq('status', status)
    .order('created_at', { ascending: false })
  return NextResponse.json({ reviews: data ?? [] })
}

// PATCH — approve or reject
export async function PATCH(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id, status } = await req.json()
  if (!id || !['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid' }, { status: 400 })
  }
  const db = createServiceSupabase()
  const { error } = await db.from('reviews').update({ status }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
