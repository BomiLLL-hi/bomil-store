import type { Currency } from './types'

export function formatPrice(priceRub: number, currency: Currency, usdRate: number): string {
  if (currency === 'usd') {
    const usd = priceRub / usdRate
    return `$${usd.toFixed(2)}`
  }
  return `${priceRub.toLocaleString('ru-RU')} ₽`
}

export function detectDefaultCurrency(): Currency {
  if (typeof navigator === 'undefined') return 'rub'
  const lang = navigator.language || ''
  const ruLocales = ['ru', 'be', 'kk', 'ky', 'uz', 'tg', 'uk', 'az']
  return ruLocales.some((l) => lang.startsWith(l)) ? 'rub' : 'usd'
}
