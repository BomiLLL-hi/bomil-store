'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createBrowserSupabase } from '@/lib/supabase-browser'
import { useApp } from '@/components/providers'

function AuthForm() {
  const { t } = useApp()
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') ?? '/'

  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const supabase = createBrowserSupabase()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Неверный логин или пароль'
        : error.message)
      return
    }
    if (!data.session) {
      setError('Не удалось войти. Попробуйте ещё раз.')
      return
    }
    router.push(nextPath)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (username.trim().length < 2) {
      setError('Имя пользователя должно быть минимум 2 символа')
      return
    }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: username.trim() } },
    })
    setLoading(false)
    if (error) {
      setError(error.message === 'User already registered'
        ? 'Этот email уже зарегистрирован'
        : error.message)
      return
    }
    if (data.session) {
      router.push(nextPath)
    } else {
      setSuccess('Аккаунт создан! Проверьте email для подтверждения.')
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://bomil-store.vercel.app/auth/reset-password',
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setSuccess('Письмо отправлено! Проверьте почту.')
  }

  function switchTab(t: 'login' | 'register' | 'forgot') {
    setTab(t); setError(''); setSuccess('')
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
          {tab !== 'forgot' && (
            <div className="flex mb-6 bg-[#0f0f0f] rounded-lg p-1">
              <button
                onClick={() => switchTab('login')}
                className={`flex-1 py-2 text-sm font-medium rounded-md ${tab === 'login' ? 'bg-[#8b5cf6] text-white' : 'text-[#888888] hover:text-white'}`}
              >
                {t('auth.login')}
              </button>
              <button
                onClick={() => switchTab('register')}
                className={`flex-1 py-2 text-sm font-medium rounded-md ${tab === 'register' ? 'bg-[#8b5cf6] text-white' : 'text-[#888888] hover:text-white'}`}
              >
                {t('auth.register')}
              </button>
            </div>
          )}

          {success ? (
            <div className="text-center py-4">
              <div className="text-[#22c55e] text-4xl mb-3">✓</div>
              <p className="text-white font-medium mb-1">Готово!</p>
              <p className="text-[#888888] text-sm">{success}</p>
              <button
                onClick={() => switchTab('login')}
                className="mt-4 text-[#8b5cf6] hover:text-[#7c3aed] text-sm font-medium transition-colors"
              >
                Войти в аккаунт
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleLogin} className={`space-y-4 ${tab !== 'login' ? 'hidden' : ''}`}>
                <div>
                  <label className="block text-[#888888] text-xs font-medium mb-1.5">{t('auth.email')}</label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    required placeholder="you@example.com"
                    className="w-full bg-[#0f0f0f] border border-[#333333] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#8b5cf6] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#888888] text-xs font-medium mb-1.5">{t('auth.password')}</label>
                  <input
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    required placeholder="••••••••"
                    className="w-full bg-[#0f0f0f] border border-[#333333] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#8b5cf6] transition-colors"
                  />
                </div>
                {error && tab === 'login' && <p className="text-[#ef4444] text-xs">{error}</p>}
                <button type="submit" disabled={loading} className="w-full py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-colors">
                  {loading ? t('checkout.loading') : t('auth.login_btn')}
                </button>
                <button type="button" onClick={() => switchTab('forgot')} className="w-full text-center text-[#555555] hover:text-[#888888] text-xs transition-colors">
                  Забыл пароль?
                </button>
              </form>

              <form onSubmit={handleRegister} className={`space-y-4 ${tab !== 'register' ? 'hidden' : ''}`}>
                <div>
                  <label className="block text-[#888888] text-xs font-medium mb-1.5">{t('auth.username')}</label>
                  <input
                    type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                    required placeholder="Ваш никнейм"
                    className="w-full bg-[#0f0f0f] border border-[#333333] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#8b5cf6] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#888888] text-xs font-medium mb-1.5">{t('auth.email')}</label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    required placeholder="you@example.com"
                    className="w-full bg-[#0f0f0f] border border-[#333333] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#8b5cf6] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#888888] text-xs font-medium mb-1.5">{t('auth.password')}</label>
                  <input
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    required minLength={6} placeholder="Минимум 6 символов"
                    className="w-full bg-[#0f0f0f] border border-[#333333] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#8b5cf6] transition-colors"
                  />
                </div>
                {error && tab === 'register' && <p className="text-[#ef4444] text-xs">{error}</p>}
                <button type="submit" disabled={loading} className="w-full py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-colors">
                  {loading ? t('checkout.loading') : t('auth.register_btn')}
                </button>
              </form>

              {tab === 'forgot' && (
                <div className="space-y-4">
                  <div>
                    <button onClick={() => switchTab('login')} className="flex items-center gap-1.5 text-[#555555] hover:text-white text-xs mb-4 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Назад
                    </button>
                    <p className="text-white font-medium text-sm mb-1">Восстановление пароля</p>
                    <p className="text-[#888888] text-xs mb-4">Введи email — пришлём ссылку для сброса пароля</p>
                  </div>
                  <form onSubmit={handleForgot} className="space-y-4">
                    <div>
                      <label className="block text-[#888888] text-xs font-medium mb-1.5">{t('auth.email')}</label>
                      <input
                        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        required placeholder="you@example.com"
                        className="w-full bg-[#0f0f0f] border border-[#333333] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#8b5cf6] transition-colors"
                      />
                    </div>
                    {error && <p className="text-[#ef4444] text-xs">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-colors">
                      {loading ? t('checkout.loading') : 'Отправить письмо'}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  )
}
