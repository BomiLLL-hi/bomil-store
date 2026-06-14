import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase-service'
import { replyToManager } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  try {
    const update = await req.json()
    const message = update.message

    if (!message?.text || !message.reply_to_message) {
      return NextResponse.json({ ok: true })
    }

    const replyToMsgId: number = message.reply_to_message.message_id
    const managerChatId: number = message.chat.id
    const text: string = message.text.trim()

    if (!text) return NextResponse.json({ ok: true })

    const supabase = createServiceSupabase()

    const { data: original } = await supabase
      .from('chat_messages')
      .select('session_id')
      .eq('telegram_message_id', replyToMsgId)
      .maybeSingle()

    if (!original) {
      await replyToManager(managerChatId, '❌ Чат клиента не найден')
      return NextResponse.json({ ok: true })
    }

    await supabase
      .from('chat_messages')
      .insert({ session_id: original.session_id, sender_type: 'operator', content: text })

    await replyToManager(managerChatId, '✅ Ответ отправлен клиенту')
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
