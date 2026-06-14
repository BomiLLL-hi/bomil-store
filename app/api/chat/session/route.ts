import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase-service'

export async function POST(req: NextRequest) {
  try {
    const { sessionId, userId } = await req.json()
    const supabase = createServiceSupabase()

    // Пробуем найти сессию по ID из localStorage
    if (sessionId) {
      const { data: session } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (session) {
        // Привязываем гостевую сессию к аккаунту если ещё не привязана
        if (userId && !session.user_id) {
          await supabase.from('chat_sessions').update({ user_id: userId }).eq('id', session.id)
          session.user_id = userId
        }
        const { data: messages } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at')
        return NextResponse.json({ session, messages: messages ?? [] })
      }
    }

    // Для авторизованных: ищем активную сессию
    if (userId) {
      const { data: session } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (session) {
        const { data: messages } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', session.id)
          .order('created_at')
        return NextResponse.json({ session, messages: messages ?? [] })
      }
    }

    // Создаём новую сессию
    const { data: session } = await supabase
      .from('chat_sessions')
      .insert({ user_id: userId ?? null })
      .select()
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Ошибка создания сессии' }, { status: 500 })
    }

    const { data: welcome } = await supabase
      .from('chat_messages')
      .insert({
        session_id: session.id,
        sender_type: 'bot',
        content: 'Привет! Чем могу помочь? Выберите вариант:',
      })
      .select()
      .single()

    return NextResponse.json({ session, messages: welcome ? [welcome] : [] })
  } catch {
    return NextResponse.json({ error: 'Внутренняя ошибка' }, { status: 500 })
  }
}
