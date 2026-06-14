import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { createServiceSupabase } from '@/lib/supabase-service'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceSupabase()
  const { data: profile } = await db
    .from('user_profiles')
    .select('role, username')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'operator')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { sessionId } = await req.json()
  if (!sessionId) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { data: session } = await db
    .from('chat_sessions')
    .select('id, operator_id, type')
    .eq('id', sessionId)
    .single()

  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  // Only for question sessions, only once
  if (session.type !== 'question' || session.operator_id) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const moderatorName = profile.username ?? 'Модератор'

  await db.from('chat_messages').insert({
    session_id: sessionId,
    sender_type: 'bot',
    content: `Вам назначен модератор ${moderatorName}. В течении нескольких минут придет ответ на ваше обращение.`,
  })

  await db.from('chat_sessions').update({ operator_id: user.id }).eq('id', sessionId)

  return NextResponse.json({ ok: true })
}
