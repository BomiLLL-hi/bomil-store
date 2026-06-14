'use client'

import { useState } from 'react'

export default function PayButton({
  orderId,
  providerId,
  label,
}: {
  orderId: string
  providerId: string
  label: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePay() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, providerId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Ошибка')
        setLoading(false)
        return
      }
      window.location.href = data.url
    } catch {
      setError('Ошибка соединения')
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:bg-[#333333] disabled:text-[#555555] text-white font-semibold rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Создание счёта...
          </>
        ) : label}
      </button>
      {error && <p className="text-[#ef4444] text-xs text-center mt-2">{error}</p>}
    </div>
  )
}
