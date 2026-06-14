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
    .select('*')
    .or('type.eq.question,ticket_number.not.is.null')
    .order('updated_at', { ascending: false })

  return NextResponse.json({ sessions: sessions ?? [] })
}
