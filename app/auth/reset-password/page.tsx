'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserSupabase } from '@/lib/supabase-browser'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  const supabase = createBrowserSupabase()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Пароли не совпадают'); return }
    if (password.length < 6) { setError('Минимум 6 символов'); return }
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message); return }
    router.push('/?reset=success')
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-bold text-2xl tracking-tight">
            <span className="text-white">BOMIL</span>
            <span className="text-[#8b5cf6]"> SHOP</span>
          </Link>
        </div>

        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6">
          {!ready ? (
            <div className="text-center py-4">
              <p className="text-[#888888] text-sm">Загрузка...</p>
            </div>
          ) : (
            <>
              <p className="text-white font-medium text-sm mb-1">Новый пароль</p>
              <p className="text-[#888888] text-xs mb-5">Введи новый пароль для своего аккаунта</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[#888888] text-xs font-medium mb-1.5">Новый пароль</label>
                  <input
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    required minLength={6} placeholder="Минимум 6 символов"
                    className="w-full bg-[#0f0f0f] border border-[#333333] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#8b5cf6] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#888888] text-xs font-medium mb-1.5">Повторите пароль</label>
                  <input
                    type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    required placeholder="••••••••"
                    className="w-full bg-[#0f0f0f] border border-[#333333] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#8b5cf6] transition-colors"
                  />
                </div>
                {error && <p className="text-[#ef4444] text-xs">{error}</p>}
                <button type="submit" disabled={loading} className="w-full py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-colors">
                  {loading ? 'Сохранение...' : 'Сохранить пароль'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
