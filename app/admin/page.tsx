import { createServiceSupabase } from '@/lib/supabase-service'
import AdminDashboard from '@/components/admin/AdminDashboard'
import type { Order, ChatSession, ChatMessage } from '@/lib/types'

export const revalidate = 0

async function getData() {
  const supabase = createServiceSupabase()

  // Оплачен: заказы paid, у которых нет chat_session с order_id
  const { data: paidOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'paid')
    .order('paid_at', { ascending: false })

  // chat_sessions с order_id (Готов к получению)
  const { data: readySessions } = await supabase
    .from('chat_sessions')
    .select('*')
    .not('order_id', 'is', null)
    .order('updated_at', { ascending: false })

  const readyOrderIds = new Set((readySessions ?? []).map(s => s.order_id))

  // Оплачен = paid orders у которых нет сессии
  const waitingOrders = (paidOrders ?? []).filter(o => !readyOrderIds.has(o.id))

  // Для "Готов к получению" — только оплаченные заказы
  const { data: readyOrders } = readySessions?.length
    ? await supabase.from('orders').select('*').in('id', [...readyOrderIds]).eq('status', 'paid')
    : { data: [] }

  // Фильтруем сессии — только те у которых заказ ещё paid
  const paidReadyIds = new Set((readyOrders ?? []).map((o: Order) => o.id))
  const filteredReadySessions = (readySessions ?? []).filter(s => paidReadyIds.has(s.order_id!))

  // Тех поддержка: question sessions
  const { data: questionSessions } = await supabase
    .from('chat_sessions')
    .select('*')
    .or('type.eq.question,ticket_number.not.is.null')
    .order('updated_at', { ascending: false })

  // Сообщения для всех сессий
  const allSessionIds = [
    ...filteredReadySessions.map(s => s.id),
    ...(questionSessions ?? []).map(s => s.id),
  ]

  const { data: allMessages } = allSessionIds.length
    ? await supabase
        .from('chat_messages')
        .select('*')
        .in('session_id', allSessionIds)
        .order('created_at', { ascending: true })
    : { data: [] }

  return {
    waitingOrders: waitingOrders as Order[],
    readySessions: filteredReadySessions as ChatSession[],
    readyOrders: (readyOrders ?? []) as Order[],
    questionSessions: (questionSessions ?? []) as ChatSession[],
    messages: (allMessages ?? []) as ChatMessage[],
  }
}

export default async function AdminPage() {
  const data = await getData()
  return <AdminDashboard {...data} />
}
