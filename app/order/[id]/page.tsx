import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getOrderById, autoCancelIfExpired } from '@/lib/orders'
import { paymentProviders } from '@/lib/payments/types'
import CartClearer from './CartClearer'
import type { Order } from '@/lib/types'

const STATUS_LABELS: Record<string, { ru: string; color: string }> = {
  pending:   { ru: 'Ожидает оплаты',  color: 'text-[#f59e0b]' },
  paid:      { ru: 'Оплачен',         color: 'text-[#22c55e]' },
  delivered: { ru: 'Выдан',           color: 'text-[#22c55e]' },
  refunded:  { ru: 'Возврат средств', color: 'text-[#888888]' },
  cancelled: { ru: 'Отменён',         color: 'text-[#ef4444]' },
}

function OrderItems({ order }: { order: Order }) {
  return (
    <div className="bg-[#111111] border border-[#222222] rounded-xl p-5">
      <h2 className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-4">
        Состав заказа
      </h2>
      <div className="space-y-3">
        {order.items.map((item) => (
          <div key={item.slug ?? item.title} className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex-shrink-0 bg-[#0d0d0d] rounded-lg overflow-hidden">
              {item.image ? (
                <Image src={item.image} alt={item.title} fill sizes="40px" className="object-contain p-1" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{item.title}</p>
              {item.quantity > 1 && (
                <p className="text-[#555555] text-xs">× {item.quantity}</p>
              )}
            </div>
            <span className="text-[#8b5cf6] text-sm font-bold flex-shrink-0">
              {(item.price_rub * item.quantity).toLocaleString('ru-RU')} ₽
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-[#222222] mt-4 pt-4 flex justify-between">
        <span className="text-[#888888] text-sm">Итого</span>
        <span className="text-white font-bold">{order.total_rub.toLocaleString('ru-RU')} ₽</span>
      </div>
    </div>
  )
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let order = await getOrderById(id)
  if (!order) notFound()

  order = await autoCancelIfExpired(order)

  const statusInfo = STATUS_LABELS[order.status] ?? { ru: order.status, color: 'text-[#888888]' }
  const createdAt = new Date(order.created_at).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="px-4 md:px-6 max-w-2xl mx-auto py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[#888888] hover:text-white text-sm mb-8 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        В каталог
      </Link>

      {/* Заголовок */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[#888888] text-xs mb-1">Номер заказа</p>
            <h1 className="text-white font-bold text-xl">{order.order_number}</h1>
            <p className="text-[#555555] text-xs mt-1">{createdAt}</p>
          </div>
          <span className={`text-sm font-semibold ${statusInfo.color}`}>
            {statusInfo.ru}
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-[#222222] grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[#555555] text-xs">Email</p>
            <p className="text-white">{order.email}</p>
          </div>
          <div>
            <p className="text-[#555555] text-xs">Roblox</p>
            <p className="text-white">{order.roblox_username}</p>
          </div>
        </div>
      </div>

      {/* Статус-специфичный контент */}
      {order.status === 'pending' && (
        <>
          <CartClearer />
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 mb-6">
            <h2 className="text-white font-semibold mb-1">Выберите способ оплаты</h2>
            <p className="text-[#555555] text-xs mb-4">
              Заказ будет автоматически отменён через 30 минут, если оплата не поступит
            </p>

            {paymentProviders.length === 0 ? (
              <div className="border border-dashed border-[#333333] rounded-xl p-6 text-center">
                <p className="text-[#555555] text-sm">Платёжные системы подключаются</p>
                <p className="text-[#333333] text-xs mt-1">Скоро здесь появятся кнопки оплаты</p>
              </div>
            ) : (
              <div className="space-y-2">
                {paymentProviders.map(p => (
                  <button
                    key={p.id}
                    className="w-full py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-semibold rounded-lg transition-colors text-sm"
                  >
                    {p.label_ru}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {order.status === 'paid' && (
        <div className="bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#22c55e]/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-white font-bold">Заказ оплачен!</h2>
              <p className="text-[#22c55e] text-xs">Платёж получен</p>
            </div>
          </div>
          <p className="text-[#888888] text-sm leading-relaxed">
            Для получения товара напишите номер заказа{' '}
            <span className="text-white font-semibold">{order.order_number}</span>{' '}
            в Live Chat — он находится в правом нижнем углу сайта.
          </p>
        </div>
      )}

      {order.status === 'delivered' && (
        <div className="bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-xl p-5 mb-6 text-center">
          <p className="text-2xl mb-2">🎉</p>
          <h2 className="text-white font-bold mb-1">Заказ выдан!</h2>
          <p className="text-[#888888] text-sm">Спасибо за покупку. Удачи в игре!</p>
        </div>
      )}

      {order.status === 'cancelled' && (
        <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl p-5 mb-6">
          <h2 className="text-white font-bold mb-1">Заказ отменён</h2>
          <p className="text-[#888888] text-sm">
            Оплата не поступила в течение 30 минут. Вернитесь в каталог и оформите заказ заново.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-5 py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-sm font-semibold rounded-lg transition-colors"
          >
            В каталог
          </Link>
        </div>
      )}

      {order.status === 'refunded' && (
        <div className="bg-[#111111] border border-[#333333] rounded-xl p-5 mb-6">
          <h2 className="text-white font-bold mb-1">Средства возвращены</h2>
          <p className="text-[#888888] text-sm">Возврат обработан. Деньги придут в течение нескольких рабочих дней.</p>
        </div>
      )}

      <OrderItems order={order} />
    </div>
  )
}
