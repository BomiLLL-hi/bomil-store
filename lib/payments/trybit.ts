import crypto from 'crypto'
import type { PaymentProvider, PaymentSession } from './types'

const API_KEY = process.env.TRYBIT_API_KEY!
const SHOP_ID = process.env.TRYBIT_SHOP_ID!
const SECRET  = process.env.TRYBIT_SECRET!

export class TrybitProvider implements PaymentProvider {
  id = 'trybit'
  label_ru = 'Оплата криптовалютой (Trybit)'
  label_en = 'Pay with Crypto (Trybit)'

  async createSession({
    orderId, amountRub, email,
  }: {
    orderId: string
    orderNumber: string
    amountRub: number
    email: string
    returnUrl: string
    webhookUrl: string
  }): Promise<PaymentSession> {
    const res = await fetch('https://api.cryptocloud.plus/v2/invoice/create', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shop_id: SHOP_ID,
        amount: amountRub,
        currency: 'RUB',
        order_id: orderId,
        email,
      }),
    })

    const data = await res.json()
    if (data.status !== 'success') {
      throw new Error(data.message ?? 'Trybit invoice creation failed')
    }

    return {
      paymentId: data.result.uuid,
      redirectUrl: data.result.link,
    }
  }

  verifyWebhook(
    body: string,
    _headers: Record<string, string>,
  ): { orderId: string; status: 'paid' | 'failed' } | null {
    try {
      const data = JSON.parse(body)
      const { invoice_id, order_id, status, token } = data

      if (!invoice_id || !order_id || !status || !token) return null

      const expected = crypto
        .createHmac('sha256', SECRET)
        .update(invoice_id + order_id)
        .digest('hex')

      if (token !== expected) return null

      return {
        orderId: order_id,
        status: status === 'success' ? 'paid' : 'failed',
      }
    } catch {
      return null
    }
  }
}
