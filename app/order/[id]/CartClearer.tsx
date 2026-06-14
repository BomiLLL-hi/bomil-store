'use client'

import { useEffect } from 'react'
import { useApp } from '@/components/providers'

export default function CartClearer() {
  const { clearCart } = useApp()
  useEffect(() => { clearCart() }, [])
  return null
}
