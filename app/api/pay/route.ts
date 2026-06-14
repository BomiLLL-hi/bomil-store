import { NextRequest, NextResponse } from 'next/server'
import { paymentProviders } from '@/lib/payments/types'
import { getOrderById, updateOrderPayment } from '@/lib/orders'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bomil-store.vercel.app'

export async function POST(req: NextRequest) {
  const { orderId, providerId } = await req.json()

  const order = await getOrderById(orderId)
  if (!order || order.status !== 'pending') {
    return NextResponse.json({ error: 'Заказ не найден или уже оплачен' }, { status: 400 })
  }

  const provider = paymentProviders.find(p => p.id === providerId)
  if (!provider) {
    return NextResponse.json({ error: 'Неизвестный провайдер' }, { status: 400 })
  }

  try {
    const session = await provider.createSession({
      orderId: order.id,
      orderNumber: order.order_number,
      amountRub: order.total_rub,
      email: order.email,
      returnUrl: `${SITE_URL}/order/${order.id}`,
      webhookUrl: `${SITE_URL}/api/webhooks/${provider.id}`,
    })

    await updateOrderPayment(order.id, provider.id, session.paymentId, session.redirectUrl)

    return NextResponse.json({ url: session.redirectUrl })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Ошибка создания платежа'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
