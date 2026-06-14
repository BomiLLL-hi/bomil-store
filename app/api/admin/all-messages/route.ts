import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { createServiceSupabase } from '@/lib/supabase-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceSupabase()
  const { data: profile } = await db.from('user_profiles').select('role').eq('id', user.id).single()
  if (!profile || (profile.role !== 'admin' && profile.role !== 'operator')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: sessions } = await db
    .from('chat_sessions')
    .select('id')
    .or('type.eq.question,ticket_number.not.is.null')

  const sessionIds = (sessions ?? []).map(s => s.id)
  if (sessionIds.length === 0) return NextResponse.json({ messages: [] })

  const { data: messages } = await db
    .from('chat_messages')
    .select('*')
    .in('session_id', sessionIds)
    .order('created_at', { ascending: true })

  return NextResponse.json({ messages: messages ?? [] })
}
