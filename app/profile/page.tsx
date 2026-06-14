'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserSupabase } from '@/lib/supabase-browser'
import { useApp } from '@/components/providers'
import { useAuth } from '@/components/AuthProvider'
import type { Order } from '@/lib/types'

export default function ProfilePage() {
  const { t } = useApp()
  const { user, profile, loading, signOut, refreshProfile } = useAuth()
  const router = useRouter()

  const [username, setUsername] = useState('')
  const [robloxUsername, setRobloxUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [signingOut, setSigningOut] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  useEffect(() => {
    if (profile) {
      setUsername(profile.username ?? '')
      setRobloxUsername(profile.roblox_username ?? '')
    }
  }, [profile])

  useEffect(() => {
    if (!user) return
    setOrdersLoading(true)
    const supabase = createBrowserSupabase()
    supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data ?? []) as Order[])
        setOrdersLoading(false)
      })
  }, [user])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setError('')
    setSaved(false)

    const supabase = createBrowserSupabase()
    const { error } = await supabase
      .from('profiles')
      .update({ username: username.trim(), roblox_username: robloxUsername.trim() || null })
      .eq('id', user.id)

    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    await refreshProfile()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    router.push('/')
  }

  useEffect(() => {
    if (!loading && !user && !signingOut) {
      router.push('/auth?next=/profile')
    }
  }, [loading, user, signingOut])

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
    : ''

  return (
    <div className="px-4 md:px-6 max-w-2xl mx-auto py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[#888888] hover:text-white text-sm mb-8 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        К каталогу
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">{t('profile.title')}</h1>
        <button
          onClick={handleSignOut}
          className="text-sm text-[#888888] hover:text-[#ef4444] transition-colors"
        >
          {t('profile.sign_out')}
        </button>
      </div>

      {/* Avatar + email */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 flex items-center justify-center text-[#8b5cf6] text-lg font-bold flex-shrink-0">
          {(user.email?.[0] ?? '?').toUpperCase()}
        </div>
        <div>
          <p className="text-white font-semibold">{profile?.username || user.email}</p>
          <p className="text-[#555555] text-xs mt-0.5">
            {t('profile.member_since')} {memberSince}
          </p>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSave} className="bg-[#111111] border border-[#222222] rounded-xl p-5 space-y-4 mb-6">
        <div>
          <label className="block text-[#888888] text-xs font-medium mb-1.5">
            {t('profile.email')}
          </label>
          <div className="bg-[#0f0f0f] border border-[#333333] rounded-lg px-3 py-2.5 text-sm text-[#555555]">
            {user.email}
          </div>
        </div>
        <div>
          <label className="block text-[#888888] text-xs font-medium mb-1.5">
            {t('profile.username')}
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ваш никнейм"
            className="w-full bg-[#0f0f0f] border border-[#333333] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#8b5cf6] transition-colors"
          />
        </div>
        <div>
          <label className="block text-[#888888] text-xs font-medium mb-1.5">
            {t('profile.roblox')}
          </label>
          <input
            type="text"
            value={robloxUsername}
            onChange={(e) => setRobloxUsername(e.target.value)}
            placeholder="Ваш Roblox никнейм"
            className="w-full bg-[#0f0f0f] border border-[#333333] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#8b5cf6] transition-colors"
          />
        </div>

        {error && <p className="text-[#ef4444] text-xs">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            saved
              ? 'bg-[#22c55e]/20 border border-[#22c55e]/40 text-[#22c55e]'
              : 'bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-50 text-white'
          }`}
        >
          {saving ? t('checkout.loading') : saved ? t('profile.saved') : t('profile.save')}
        </button>
      </form>

      {/* Order history */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[#888888] uppercase tracking-wider mb-4">
          {t('profile.orders_title')}
        </h2>

        {ordersLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <p className="text-[#555555] text-sm">У вас пока нет заказов</p>
        ) : (
          <div className="space-y-2">
            {orders.map(order => {
              const statusColors: Record<string, string> = {
                pending:   'text-[#f59e0b]',
                paid:      'text-[#22c55e]',
                delivered: 'text-[#22c55e]',
                cancelled: 'text-[#ef4444]',
                refunded:  'text-[#888888]',
              }
              const statusLabels: Record<string, string> = {
                pending:   'Ожидает оплаты',
                paid:      'Оплачен',
                delivered: 'Выдан',
                cancelled: 'Отменён',
                refunded:  'Возврат',
              }
              return (
                <Link
                  key={order.id}
                  href={`/order/${order.id}`}
                  className="flex items-center justify-between p-3 bg-[#0f0f0f] border border-[#222222] rounded-xl hover:border-[#8b5cf6]/40 transition-colors"
                >
                  <div>
                    <p className="text-white text-sm font-semibold">{order.order_number}</p>
                    <p className="text-[#555555] text-xs mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('ru-RU')}
                      {' · '}{order.items.length} поз.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-medium ${statusColors[order.status] ?? 'text-[#888888]'}`}>
                      {statusLabels[order.status] ?? order.status}
                    </p>
                    <p className="text-[#8b5cf6] text-sm font-bold mt-0.5">
                      {order.total_rub.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
