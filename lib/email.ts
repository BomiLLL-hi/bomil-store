import type { Order } from './types'

const FROM = process.env.EMAIL_FROM ?? 'MM2 Store <noreply@mm2store.ru>'
const API_KEY = () => process.env.RESEND_API_KEY

async function send(to: string, subject: string, html: string) {
  const key = API_KEY()
  if (!key) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  }).catch(() => {})
}

function itemsHtml(order: Order) {
  return order.items
    .map(i => `<tr><td>${i.title} × ${i.quantity}</td><td>${(i.price_rub * i.quantity).toLocaleString('ru-RU')} ₽</td></tr>`)
    .join('')
}

export async function sendOrderCreated(order: Order) {
  await send(
    order.email,
    `Заказ ${order.order_number} создан — MM2 Store`,
    `<h2>Заказ ${order.order_number} создан!</h2>
     <p>Пожалуйста, завершите оплату. Если оплата не поступит в течение 30 минут, заказ будет автоматически отменён.</p>
     <table>${itemsHtml(order)}</table>
     <p><strong>Итого: ${order.total_rub.toLocaleString('ru-RU')} ₽</strong></p>`,
  )
}

export async function sendOrderPaid(order: Order) {
  await send(
    order.email,
    `Заказ ${order.order_number} оплачен ✅ — MM2 Store`,
    `<h2>Заказ ${order.order_number} оплачен!</h2>
     <p>Для получения товара напишите номер заказа <strong>${order.order_number}</strong> в Live Chat на сайте.</p>
     <p>Roblox аккаунт: <strong>${order.roblox_username}</strong></p>
     <table>${itemsHtml(order)}</table>
     <p><strong>Итого: ${order.total_rub.toLocaleString('ru-RU')} ₽</strong></p>`,
  )
}

export async function sendOrderCancelled(order: Order) {
  await send(
    order.email,
    `Заказ ${order.order_number} отменён — MM2 Store`,
    `<h2>Заказ ${order.order_number} отменён</h2>
     <p>Оплата не поступила в течение 30 минут. Если хотите повторить покупку — вернитесь в каталог.</p>`,
  )
}
