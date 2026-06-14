'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { Language, Currency, CartItem, Product } from '@/lib/types'
import { getTranslation, type TranslationKey } from '@/lib/i18n'
import { formatPrice, detectDefaultCurrency } from '@/lib/currency'

const CART_KEY = 'mm2_cart'

interface AppContextValue {
  lang: Language
  currency: Currency
  usdRate: number
  setLang: (l: Language) => void
  setCurrency: (c: Currency) => void
  t: (key: TranslationKey) => string
  price: (rub: number) => string
  priceOld: (rub: number) => string
  cartItems: CartItem[]
  cartCount: number
  cartTotal: number
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  changeQuantity: (productId: string, delta: number) => void
  clearCart: () => void
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

export function AppProvider({
  children,
  usdRate,
}: {
  children: React.ReactNode
  usdRate: number
}) {
  const [lang, setLangState] = useState<Language>('ru')
  const [currency, setCurrencyState] = useState<Currency>('rub')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as Language | null
    const savedCurrency = localStorage.getItem('currency') as Currency | null
    if (savedLang === 'ru' || savedLang === 'en') setLangState(savedLang)
    setCurrencyState(savedCurrency === 'usd' ? 'usd' : detectDefaultCurrency())

    try {
      const raw = localStorage.getItem(CART_KEY)
      if (raw) setCartItems(JSON.parse(raw))
    } catch {}
  }, [])

  function setLang(l: Language) {
    setLangState(l)
    localStorage.setItem('lang', l)
  }

  function setCurrency(c: Currency) {
    setCurrencyState(c)
    localStorage.setItem('currency', c)
  }

  function t(key: TranslationKey) {
    return getTranslation(lang, key)
  }

  function price(rub: number) {
    return formatPrice(rub, currency, usdRate)
  }

  function priceOld(rub: number) {
    return formatPrice(rub, currency, usdRate)
  }

  function addToCart(product: Product) {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      const updated = existing
        ? prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...prev, { product, quantity: 1 }]
      localStorage.setItem(CART_KEY, JSON.stringify(updated))
      return updated
    })
  }

  function removeFromCart(productId: string) {
    setCartItems(prev => {
      const updated = prev.filter(item => item.product.id !== productId)
      localStorage.setItem(CART_KEY, JSON.stringify(updated))
      return updated
    })
  }

  function changeQuantity(productId: string, delta: number) {
    setCartItems(prev => {
      const updated = prev
        .map(item => item.product.id === productId ? { ...item, quantity: item.quantity + delta } : item)
        .filter(item => item.quantity > 0)
      localStorage.setItem(CART_KEY, JSON.stringify(updated))
      return updated
    })
  }

  function clearCart() {
    setCartItems([])
    localStorage.removeItem(CART_KEY)
  }

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cartItems.reduce((sum, item) => sum + item.product.current_price * item.quantity, 0)

  return (
    <AppContext.Provider value={{
      lang, currency, usdRate, setLang, setCurrency, t, price, priceOld,
      cartItems, cartCount, cartTotal, addToCart, removeFromCart, changeQuantity, clearCart,
      cartOpen, setCartOpen,
    }}>
      {children}
    </AppContext.Provider>
  )
}
