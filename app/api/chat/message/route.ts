import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase-service'
import { sendToManager } from '@/lib/telegram'
import type { ChatSession } from '@/lib/types'

const SKIP_FORWARD = new Set(['__reset', 'Получить заказ', 'Задать вопрос', 'Связаться с тех поддержкой'])

async function buildTelegramText(supabase: ReturnType<typeof createServiceSupabase>, session: ChatSession, content: string): Promise<string> {
  const lines: string[] = []

  if (session.ticket_number) {
    lines.push(`📩 <b>Обращение ${session.ticket_number}</b>`)
  } else if (session.type === 'order' && session.order_id) {
    const { data: order } = await supabase
      .from('orders')
      .select('order_number, roblox_username')
      .eq('id', session.order_id)
      .single()
    if (order) {
      lines.push(`📦 <b>Заказ ${order.order_number}</b> (${order.roblox_username})`)
    } else {
      lines.push(`📦 <b>Вопрос по заказу</b>`)
    }
  } else {
    lines.push(`💬 <b>Сообщение от клиента</b>`)
  }

  lines.push(content)
  lines.push(`\n↩️ <i>Ответьте на это сообщение чтобы ответить клиенту</i>`)
  return lines.join('\n')
}

async function getBotResponse(session: ChatSession, content: string): Promise<string | null> {
  const supabase = createServiceSupabase()

  // Сброс потока — всегда первым, до любых flow-обработчиков
  if (content === '__reset') {
    await supabase
      .from('chat_sessions')
      .update({ type: null, order_id: null })
      .eq('id', session.id)
    return 'Привет! Чем могу помочь? Выберите вариант:'
  }

  // Выбор потока — работает в любом состоянии сессии
  if (content === 'Получить заказ') {
    await supabase.from('chat_sessions').update({ type: 'order', order_id: null }).eq('id', session.id)
    return 'Введите номер вашего заказа (например: MM2-001000):'
  }
  if (content === 'Задать вопрос' || content === 'Связаться с тех поддержкой') {
    // ticket_number не сбрасываем — постоянный маркер чата поддержки
    // operator_id сбрасываем — чтобы при следующем открытии пришло новое уведомление о модераторе
    await supabase.from('chat_sessions').update({ type: 'question', order_id: null, operator_id: null }).eq('id', session.id)
    return 'Напишите пожалуйста ваш вопрос'
  }

  if (!session.type) return null

  // Поток "Получить заказ" — ожидаем номер
  if (session.type === 'order' && !session.order_id) {
    const normalized = content.trim().toUpperCase().replace(/^#/, '')
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', normalized)
      .maybeSingle()

    if (!order) {
      return `Заказ "${normalized}" не найден. Проверьте номер и попробуйте снова.`
    }

    const statusLabels: Record<string, string> = {
      pending: 'ожидает оплаты',
      cancelled: 'отменён',
      delivered: 'уже выдан',
      refunded: 'возврат средств',
    }

    if (order.status !== 'paid') {
      return `Заказ ${order.order_number} найден, но его статус — ${statusLabels[order.status] ?? order.status}. Выдача возможна только для оплаченных заказов.`
    }

    // Позиция в очереди
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'paid')
      .lte('paid_at', order.paid_at)
      .neq('id', order.id)

    const position = (count ?? 0) + 1
    const waitMins = position * 2

    await supabase.from('chat_sessions').update({ order_id: order.id }).eq('id', session.id)

    return `✅ Заказ ${order.order_number} найден!\n\nПозиция в очереди: ${position}\nПримерное время ожидания: ~${waitMins} мин.\n\nОператор добавит вас в друзья в Roblox на аккаунт: ${order.roblox_username}\n\nЕсли есть вопросы — напишите здесь.`
  }

  // Поток "Задать вопрос" — первое сообщение создаёт тикет
  if (session.type === 'question' && !session.ticket_number) {
    const { data: ticketSeq } = await supabase.rpc('next_ticket_number')
    const ticketNumber = `TKT-${String(ticketSeq ?? 1000).padStart(6, '0')}`
    await supabase.from('chat_sessions').update({ ticket_number: ticketNumber }).eq('id', session.id)
    return `Спасибо за ваше обращение. В ближайшее время вам ответит модератор.`
  }

  // Последующие сообщения — бот молчит, ждём оператора
  return null
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, content } = await req.json() as { sessionId: string; content: string }

    if (!sessionId || !content?.trim()) {
      return NextResponse.json({ error: 'Неверный запрос' }, { status: 400 })
    }

    const supabase = createServiceSupabase()

    const { data: session } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Сессия не найдена' }, { status: 404 })
    }

    // Сохраняем сообщение пользователя
    const { data: userMessage } = await supabase
      .from('chat_messages')
      .insert({ session_id: sessionId, sender_type: 'user', content: content.trim() })
      .select()
      .single()

    // Получаем ответ бота
    const botText = await getBotResponse(session as ChatSession, content.trim())

    let botMessage = null
    if (botText) {
      const { data } = await supabase
        .from('chat_messages')
        .insert({ session_id: sessionId, sender_type: 'bot', content: botText })
        .select()
        .single()
      botMessage = data
    }

    // Пересылаем реальные сообщения клиента менеджеру в Telegram
    if (!SKIP_FORWARD.has(content.trim()) && userMessage) {
      const { data: freshSession } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (freshSession) {
        const tgText = await buildTelegramText(supabase, freshSession as ChatSession, content.trim())
        const tgMsgId = await sendToManager(tgText)
        if (tgMsgId) {
          await supabase
            .from('chat_messages')
            .update({ telegram_message_id: tgMsgId })
            .eq('id', userMessage.id)
        }
      }
    }

    return NextResponse.json({ userMessage, botMessage })
  } catch {
    return NextResponse.json({ error: 'Внутренняя ошибка' }, { status: 500 })
  }
}
