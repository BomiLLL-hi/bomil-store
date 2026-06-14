import { NextRequest, NextResponse } from 'next/server'
import { paymentProviders } from '@/lib/payments/types'
import { getOrderById, updateOrderStatus } from '@/lib/orders'
import { sendOrderPaid, sendOrderCancelled } from '@/lib/email'
import { sendToManager } from '@/lib/telegram'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider: providerId } = await params
  const provider = paymentProviders.find(p => p.id === providerId)

  if (!provider) {
    return NextResponse.json({ error: 'Unknown provider' }, { status: 400 })
  }

  const body = await req.text()
  const headers = Object.fromEntries(req.headers.entries())
  const result = provider.verifyWebhook(body, headers)

  if (!result) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const { orderId, status } = result
  const order = await getOrderById(orderId)
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (status === 'paid' && order.status === 'pending') {
    await updateOrderStatus(orderId, 'paid', { paid_at: new Date().toISOString() })
    sendOrderPaid({ ...order, status: 'paid' }).catch(() => {})
    const itemLines = order.items.map(i => `• ${i.title} × ${i.quantity} — ${i.price_rub * i.quantity} ₽`).join('\n')
    sendToManager(
      `💰 <b>Новый оплаченный заказ!</b>\n\n` +
      `📦 <b>${order.order_number}</b>\n` +
      `👤 Roblox: <b>${order.roblox_username}</b>\n` +
      `🔗 <a href="https://www.roblox.com/users/${order.roblox_user_id}/profile">Открыть профиль</a>\n\n` +
      `${itemLines}\n\n` +
      `💵 Итого: <b>${order.total_rub} ₽</b>`
    ).catch(() => {})
  } else if (status === 'failed' && order.status === 'pending') {
    await updateOrderStatus(orderId, 'cancelled', { cancelled_at: new Date().toISOString() })
    sendOrderCancelled({ ...order, status: 'cancelled' }).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
