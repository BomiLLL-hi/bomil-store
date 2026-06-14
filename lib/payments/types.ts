export interface PaymentSession {
  paymentId: string
  redirectUrl: string
}

// Интерфейс для любого платёжного провайдера.
// Чтобы добавить нового провайдера — реализовать этот интерфейс.
export interface PaymentProvider {
  id: string
  label_ru: string
  label_en: string
  createSession(params: {
    orderId: string
    orderNumber: string
    amountRub: number
    email: string
    returnUrl: string
    webhookUrl: string
  }): Promise<PaymentSession>
  // Возвращает orderId и статус, или null если подпись не прошла
  verifyWebhook(
    body: string,
    headers: Record<string, string>,
  ): { orderId: string; status: 'paid' | 'failed' } | null
}

// Реестр подключённых провайдеров
export const paymentProviders: PaymentProvider[] = [
  // Добавляй провайдеры сюда:
  // new YookassaProvider(),
  // new CryptoCloudProvider(),
  // new PaypalychProvider(),
]
