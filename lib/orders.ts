import { createServiceSupabase } from './supabase-service'
import type { Order, OrderStatus } from './types'

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = createServiceSupabase()
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()
  return data as Order | null
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const supabase = createServiceSupabase()
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return (data ?? []) as Order[]
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  extra?: Record<string, unknown>,
) {
  const supabase = createServiceSupabase()
  const { error } = await supabase
    .from('orders')
    .update({ status, ...extra })
    .eq('id', id)
  return !error
}

export async function updateOrderPayment(
  id: string,
  provider: string,
  paymentId: string,
  paymentUrl: string,
) {
  const supabase = createServiceSupabase()
  const { error } = await supabase
    .from('orders')
    .update({ payment_provider: provider, payment_id: paymentId, payment_url: paymentUrl })
    .eq('id', id)
  return !error
}

// Отменяет заказ если он pending > 30 минут. Возвращает обновлённый заказ.
export async function autoCancelIfExpired(order: Order): Promise<Order> {
  if (order.status !== 'pending') return order
  const createdAt = new Date(order.created_at).getTime()
  const thirtyMin = 30 * 60 * 1000
  if (Date.now() - createdAt < thirtyMin) return order

  await updateOrderStatus(order.id, 'cancelled', { cancelled_at: new Date().toISOString() })
  return { ...order, status: 'cancelled' }
}
