import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { createServiceSupabase } from '@/lib/supabase-service'

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceSupabase()
  const { data: profile } = await db.from('user_profiles').select('role').eq('id', user.id).single()
  if (!profile || (profile.role !== 'admin' && profile.role !== 'operator')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const sessionId = new URL(req.url).searchParams.get('sessionId')
  if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })

  const { data: messages, error } = await db
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ messages })
}
