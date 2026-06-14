'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { createBrowserSupabase } from '@/lib/supabase-browser'
import type { Order, ChatSession, ChatMessage } from '@/lib/types'

type Tab = 'waiting' | 'ready' | 'support' | 'reviews' | 'faq'

interface Props {
  waitingOrders: Order[]
  readySessions: ChatSession[]
  readyOrders: Order[]
  questionSessions: ChatSession[]
  messages: ChatMessage[]
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}с`
  if (diff < 3600) return `${Math.floor(diff / 60)}м`
  if (diff < 86400) return `${Math.floor(diff / 3600)}ч`
  return `${Math.floor(diff / 86400)}д`
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

// ─── Карточка заказа (Оплачен) ────────────────────────────────────────────────
function WaitingOrderCard({ order, active, onClick }: { order: Order; active: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border cursor-pointer transition-colors ${
        active ? 'border-[#8b5cf6] bg-[#8b5cf6]/5' : 'border-[#222222] bg-[#111111] hover:border-[#333333]'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-white font-semibold text-sm">{order.order_number}</span>
        <span className="text-[#555555] text-xs">{timeAgo(order.paid_at ?? order.created_at)}</span>
      </div>
      <a
        href={`https://www.roblox.com/users/${order.roblox_user_id}/profile`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        className="text-[#8b5cf6] text-xs hover:underline mb-2 block"
      >
        👤 {order.roblox_username} →
      </a>
      <div className="flex gap-1 flex-wrap mb-2">
        {order.items.slice(0, 3).map((item, i) => (
          <div key={i} className="relative w-8 h-8 rounded-md overflow-hidden bg-[#1a1a1a] flex-shrink-0">
            {item.image ? (
              <Image src={item.image} alt={item.title} fill sizes="32px" className="object-contain p-0.5" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#333333]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                </svg>
              </div>
            )}
          </div>
        ))}
        {order.items.length > 3 && (
          <div className="w-8 h-8 rounded-md bg-[#1a1a1a] flex items-center justify-center text-[#555555] text-[10px]">
            +{order.items.length - 3}
          </div>
        )}
      </div>
      <span className="text-[#22c55e] text-xs font-bold">{order.total_rub} ₽</span>
    </div>
  )
}

// ─── Карточка чата (Готов / Тех поддержка) ────────────────────────────────────
function SessionCard({
  session, order, lastMessage, unread, active, onClick,
}: {
  session: ChatSession; order?: Order; lastMessage?: ChatMessage; unread: number; active: boolean; onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border cursor-pointer transition-colors ${
        active ? 'border-[#8b5cf6] bg-[#8b5cf6]/5' : 'border-[#222222] bg-[#111111] hover:border-[#333333]'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-white font-semibold text-sm">
          {order ? order.order_number : session.ticket_number ?? 'Вопрос'}
        </span>
        <div className="flex items-center gap-1.5">
          {unread > 0 && (
            <span className="w-4 h-4 bg-[#8b5cf6] rounded-full text-[10px] text-white flex items-center justify-center font-bold">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
          <span className="text-[#555555] text-xs">{timeAgo(session.updated_at)}</span>
        </div>
      </div>
      {order && (
        <a
          href={`https://www.roblox.com/users/${order.roblox_user_id}/profile`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="text-[#8b5cf6] text-xs hover:underline mb-1 block"
        >
          👤 {order.roblox_username} →
        </a>
      )}
      {lastMessage && (
        <p className="text-[#555555] text-xs truncate">{lastMessage.content}</p>
      )}
    </div>
  )
}

// ─── Панель чата ──────────────────────────────────────────────────────────────
function ChatPane({
  session, order, messages, onSent,
}: {
  session: ChatSession; order?: Order; messages: ChatMessage[]; onSent: (msg: ChatMessage) => void
}) {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [tempMessages, setTempMessages] = useState<ChatMessage[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const seenIds = useRef<Set<string>>(new Set())
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Сброс при смене сессии
  useEffect(() => {
    setTempMessages([])
    seenIds.current = new Set(messages.map(m => m.id))
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = '42px'
  }, [session.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [messages.length, tempMessages.length])

  const allMessages = [...messages, ...tempMessages]
  const FLOW_BUTTONS = new Set(['__reset', 'Получить заказ', 'Задать вопрос', 'Связаться с тех поддержкой'])
  const visibleMessages = allMessages.filter(msg =>
    msg.sender_type !== 'bot' &&
    !(msg.sender_type === 'user' && FLOW_BUTTONS.has(msg.content))
  )

  async function sendReply() {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = '42px'

    const tempId = `tmp_${Date.now()}`
    const tempMsg: ChatMessage = {
      id: tempId, session_id: session.id, sender_type: 'operator',
      content: text, created_at: new Date().toISOString(),
    }
    seenIds.current.add(tempId)
    setTempMessages(prev => [...prev, tempMsg])

    setSending(true)
    const res = await fetch('/api/admin/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session.id, content: text }),
    })
    const { message } = await res.json()
    if (message) {
      seenIds.current.add(message.id)
      setTempMessages(prev => prev.filter(m => m.id !== tempId))
      onSent(message)
    } else {
      setTempMessages(prev => prev.filter(m => m.id !== tempId))
    }
    setSending(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3 border-b border-[#222222] flex items-center gap-3">
        {order ? (
          <>
            <div>
              <p className="text-white font-semibold text-sm">{order.order_number}</p>
              <a
                href={`https://www.roblox.com/users/${order.roblox_user_id}/profile`}
                target="_blank" rel="noopener noreferrer"
                className="text-[#8b5cf6] text-xs hover:underline"
              >
                {order.roblox_username} →
              </a>
            </div>
            <div className="flex gap-1 ml-auto">
              {order.items.map((item, i) => (
                <div key={i} className="relative w-8 h-8 rounded bg-[#1a1a1a] overflow-hidden">
                  {item.image && <Image src={item.image} alt={item.title} fill sizes="32px" className="object-contain p-0.5" />}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-white font-semibold text-sm">{session.ticket_number ?? 'Обращение'}</p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {visibleMessages.map(msg => {
          const isOperator = msg.sender_type === 'operator'
          const isBot = msg.sender_type === 'bot'
          const isNew = !seenIds.current.has(msg.id)
          if (isNew) seenIds.current.add(msg.id)
          return (
            <div
              key={msg.id}
              className={`flex ${isOperator ? 'justify-end' : 'justify-start'} ${isNew ? 'animate-fade-in-up' : ''}`}
              style={isNew ? { animationDuration: '0.2s' } : undefined}
            >
              <div className={`max-w-[70%] px-3 pt-2 pb-1.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed relative ${
                isOperator ? 'bg-[#8b5cf6] text-white rounded-tr-sm'
                : isBot ? 'bg-[#1a1a1a] text-[#888888] rounded-tl-sm border border-[#2a2a2a]'
                : 'bg-[#1a1a1a] text-white rounded-tl-sm border border-[#2a2a2a]'
              }`}>
                <span className="pr-9">{msg.content}</span>
                <span className={`absolute bottom-1.5 right-2.5 text-[10px] leading-none select-none ${isOperator ? 'text-white/50' : 'text-[#555555]'}`}>
                  {formatTime(msg.created_at)}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-[#222222] flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => {
            setInput(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendReply()
            }
          }}
          placeholder="Написать ответ..."
          rows={1}
          className="flex-1 bg-[#111111] border border-[#333333] rounded-2xl px-4 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#8b5cf6] transition-colors resize-none leading-relaxed"
          style={{ minHeight: '42px', maxHeight: '120px' }}
        />
        <button
          onClick={sendReply}
          disabled={!input.trim() || sending}
          className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:bg-[#333333] disabled:text-[#555555] text-white rounded-full transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── Панель заказа (Оплачен) ──────────────────────────────────────────────────
function OrderPane({ order }: { order: Order }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-3 border-b border-[#222222]">
        <p className="text-white font-semibold">{order.order_number}</p>
        <p className="text-[#555555] text-xs mt-0.5">Ожидает контакта от клиента</p>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 space-y-3">
          <p className="text-[#555555] text-xs font-semibold uppercase tracking-wider">Клиент</p>
          <a
            href={`https://www.roblox.com/users/${order.roblox_user_id}/profile`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#8b5cf6] hover:text-[#7c3aed] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-semibold">{order.roblox_username}</span>
            <span className="text-xs text-[#555555]">→ Открыть профиль</span>
          </a>
          <p className="text-[#555555] text-xs">{order.email}</p>
        </div>

        <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 space-y-3">
          <p className="text-[#555555] text-xs font-semibold uppercase tracking-wider">Товары</p>
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="relative w-10 h-10 flex-shrink-0 bg-[#0d0d0d] rounded-lg overflow-hidden">
                {item.image
                  ? <Image src={item.image} alt={item.title} fill sizes="40px" className="object-contain p-1" />
                  : <div className="w-full h-full bg-[#1a1a1a] rounded-lg" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{item.title}</p>
                <p className="text-[#555555] text-xs">× {item.quantity}</p>
              </div>
              <span className="text-white text-sm font-semibold">{item.price_rub * item.quantity} ₽</span>
            </div>
          ))}
          <div className="pt-2 border-t border-[#222222] flex justify-between">
            <span className="text-[#555555] text-sm">Итого</span>
            <span className="text-[#22c55e] font-bold">{order.total_rub} ₽</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Reviews Panel ────────────────────────────────────────────────────────────
interface AdminReview {
  id: string
  rating: number
  text: string
  created_at: string
  status: string
  user_profiles: { username: string | null } | null
  products: { title: string; images: string[] } | null
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <svg key={n} className={`w-3.5 h-3.5 ${n <= rating ? 'text-[#f59e0b]' : 'text-[#333333]'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function ReviewsPanel({ onBack }: { onBack: () => void }) {
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [loading, setLoading] = useState(true)

  async function load(s = statusFilter) {
    setLoading(true)
    const res = await fetch(`/api/admin/reviews?status=${s}`)
    const data = await res.json()
    setReviews(data.reviews ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [statusFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  async function moderate(id: string, status: 'approved' | 'rejected') {
    await fetch('/api/admin/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setReviews(prev => prev.filter(r => r.id !== id))
  }

  const filters: { key: typeof statusFilter; label: string }[] = [
    { key: 'pending', label: 'На модерации' },
    { key: 'approved', label: 'Одобрены' },
    { key: 'rejected', label: 'Отклонены' },
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-49px)]">
      <div className="px-5 py-3 border-b border-[#222222] flex items-center gap-4">
        <button onClick={onBack} className="text-[#555555] hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-white font-semibold">Отзывы</h2>
        <div className="flex gap-1 ml-auto">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === f.key ? 'bg-[#8b5cf6] text-white' : 'text-[#555555] hover:text-white border border-[#333333]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-[#111111] border border-[#222222] rounded-xl animate-pulse" />)}
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-[#555555] text-sm text-center py-12">Нет отзывов</p>
        ) : (
          <div className="space-y-3 max-w-2xl">
            {reviews.map(r => (
              <div key={r.id} className="bg-[#111111] border border-[#222222] rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-white text-sm font-semibold">{r.products?.title ?? '—'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRow rating={r.rating} />
                      <span className="text-[#555555] text-xs">{r.user_profiles?.username ?? 'Покупатель'}</span>
                    </div>
                  </div>
                  {statusFilter === 'pending' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => moderate(r.id, 'approved')}
                        className="px-3 py-1.5 bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] text-xs font-medium rounded-lg hover:bg-[#22c55e]/20 transition-colors"
                      >
                        Одобрить
                      </button>
                      <button
                        onClick={() => moderate(r.id, 'rejected')}
                        className="px-3 py-1.5 bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] text-xs font-medium rounded-lg hover:bg-[#ef4444]/20 transition-colors"
                      >
                        Отклонить
                      </button>
                    </div>
                  )}
                </div>
                {r.text && <p className="text-[#888888] text-sm leading-relaxed">{r.text}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── FAQ Panel ────────────────────────────────────────────────────────────────
interface FaqItemAdmin {
  id: string
  question_ru: string
  question_en: string
  answer_ru: string
  answer_en: string
  sort_order: number
}

const emptyFaq: Omit<FaqItemAdmin, 'id'> = {
  question_ru: '', question_en: '', answer_ru: '', answer_en: '', sort_order: 0,
}

function FaqPanel({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<FaqItemAdmin[]>([])
  const [editing, setEditing] = useState<FaqItemAdmin | null>(null)
  const [form, setForm] = useState<Omit<FaqItemAdmin, 'id'>>(emptyFaq)
  const [saving, setSaving] = useState(false)

  async function load() {
    const res = await fetch('/api/admin/faq')
    const data = await res.json()
    setItems(data.items ?? [])
  }

  useEffect(() => { load() }, [])

  function startNew() { setEditing({ id: '', ...emptyFaq }); setForm(emptyFaq) }
  function startEdit(item: FaqItemAdmin) { setEditing(item); setForm({ ...item }) }
  function cancel() { setEditing(null) }

  async function save() {
    if (!form.question_ru || !form.answer_ru) return
    setSaving(true)
    if (editing?.id) {
      await fetch('/api/admin/faq', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id, ...form }),
      })
    } else {
      await fetch('/api/admin/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }
    setSaving(false)
    setEditing(null)
    load()
  }

  async function remove(id: string) {
    await fetch('/api/admin/faq', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  const inputCls = 'w-full bg-[#0f0f0f] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#8b5cf6] transition-colors'

  return (
    <div className="flex h-[calc(100vh-49px)]">
      {/* List */}
      <div className="w-80 flex-shrink-0 border-r border-[#222222] flex flex-col">
        <div className="px-4 py-3 border-b border-[#222222] flex items-center gap-3">
          <button onClick={onBack} className="text-[#555555] hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-white font-semibold">FAQ</span>
          <button
            onClick={startNew}
            className="ml-auto px-3 py-1.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-xs font-medium rounded-lg transition-colors"
          >
            + Добавить
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {items.map(item => (
            <div
              key={item.id}
              onClick={() => startEdit(item)}
              className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                editing?.id === item.id ? 'border-[#8b5cf6] bg-[#8b5cf6]/5' : 'border-[#222222] bg-[#111111] hover:border-[#333333]'
              }`}
            >
              <p className="text-white text-sm font-medium truncate">{item.question_ru}</p>
              <p className="text-[#555555] text-xs truncate mt-0.5">{item.question_en}</p>
            </div>
          ))}
          {items.length === 0 && <p className="text-[#555555] text-sm text-center py-8">Нет вопросов</p>}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto p-6">
        {!editing ? (
          <div className="flex items-center justify-center h-full text-[#333333] text-sm">
            Выберите вопрос или создайте новый
          </div>
        ) : (
          <div className="max-w-xl space-y-4">
            <h3 className="text-white font-semibold">{editing.id ? 'Редактировать' : 'Новый вопрос'}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[#555555] text-xs mb-1">Вопрос (RU)</p>
                <input className={inputCls} value={form.question_ru} onChange={e => setForm(f => ({ ...f, question_ru: e.target.value }))} />
              </div>
              <div>
                <p className="text-[#555555] text-xs mb-1">Вопрос (EN)</p>
                <input className={inputCls} value={form.question_en} onChange={e => setForm(f => ({ ...f, question_en: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[#555555] text-xs mb-1">Ответ (RU)</p>
                <textarea rows={4} className={inputCls + ' resize-none'} value={form.answer_ru} onChange={e => setForm(f => ({ ...f, answer_ru: e.target.value }))} />
              </div>
              <div>
                <p className="text-[#555555] text-xs mb-1">Ответ (EN)</p>
                <textarea rows={4} className={inputCls + ' resize-none'} value={form.answer_en} onChange={e => setForm(f => ({ ...f, answer_en: e.target.value }))} />
              </div>
            </div>
            <div>
              <p className="text-[#555555] text-xs mb-1">Порядок</p>
              <input type="number" className={inputCls + ' w-24'} value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
            </div>
            <div className="flex gap-2">
              <button
                onClick={save}
                disabled={saving || !form.question_ru || !form.answer_ru}
                className="px-4 py-2 bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:bg-[#333333] disabled:text-[#555555] text-white text-sm font-medium rounded-lg transition-colors"
              >
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button onClick={cancel} className="px-4 py-2 border border-[#333333] text-[#888888] hover:text-white text-sm rounded-lg transition-colors">
                Отмена
              </button>
              {editing.id && (
                <button
                  onClick={() => { remove(editing.id); cancel() }}
                  className="ml-auto px-4 py-2 border border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/10 text-sm rounded-lg transition-colors"
                >
                  Удалить
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Главный компонент ────────────────────────────────────────────────────────
export default function AdminDashboard({ waitingOrders, readySessions, readyOrders, questionSessions, messages }: Props) {
  const [tab, setTab] = useState<Tab>('waiting')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const assignedSessions = useRef<Set<string>>(new Set())

  // Карта сообщений по сессиям — обновляется в реальном времени
  const [messageMap, setMessageMap] = useState<Record<string, ChatMessage[]>>(() => {
    const map: Record<string, ChatMessage[]> = {}
    messages.forEach(m => {
      if (!map[m.session_id]) map[m.session_id] = []
      map[m.session_id].push(m)
    })
    return map
  })

  // Счётчики новых сообщений от клиентов (сбрасываются при открытии сессии)
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({})

  // Глобальная Realtime подписка — обновляет левую панель и чат без перезагрузки
  useEffect(() => {
    const supabase = createBrowserSupabase()
    const channel = supabase
      .channel('admin:global')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, payload => {
        const msg = payload.new as ChatMessage
        setMessageMap(prev => {
          const existing = prev[msg.session_id] ?? []
          if (existing.find(m => m.id === msg.id)) return prev
          return { ...prev, [msg.session_id]: [...existing, msg] }
        })
        // Считаем только сообщения от клиента
        if (msg.sender_type === 'user') {
          setUnreadMap(prev => ({
            ...prev,
            [msg.session_id]: (prev[msg.session_id] ?? 0) + 1,
          }))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  function handleSelect(id: string) {
    setSelectedId(id)
    setUnreadMap(prev => ({ ...prev, [id]: 0 }))

    if (tab === 'support' && !assignedSessions.current.has(id)) {
      const session = questionSessions.find(s => s.id === id)
      if (session && !session.operator_id) {
        assignedSessions.current.add(id)
        fetch('/api/admin/assign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: id }),
        }).catch(() => {})
      }
    }
  }

  function handleSent(msg: ChatMessage) {
    setMessageMap(prev => {
      const existing = prev[msg.session_id] ?? []
      if (existing.find(m => m.id === msg.id)) return prev
      return { ...prev, [msg.session_id]: [...existing, msg] }
    })
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'waiting', label: 'Оплачен', count: waitingOrders.length },
    { key: 'ready', label: 'Готов к получению', count: readySessions.length },
    { key: 'support', label: 'Тех поддержка', count: questionSessions.length },
    { key: 'reviews', label: 'Отзывы', count: 0 },
    { key: 'faq', label: 'FAQ', count: 0 },
  ]

  const selectedOrder = tab === 'waiting' ? waitingOrders.find(o => o.id === selectedId) : undefined
  const selectedSession = tab !== 'waiting'
    ? (tab === 'ready' ? readySessions : questionSessions).find(s => s.id === selectedId)
    : undefined
  const selectedSessionOrder = selectedSession ? readyOrders.find(o => o.id === selectedSession.order_id) : undefined
  const sessionMessages = selectedSession ? (messageMap[selectedSession.id] ?? []) : []

  if (tab === 'reviews') return <ReviewsPanel onBack={() => setTab('waiting')} />
  if (tab === 'faq') return <FaqPanel onBack={() => setTab('waiting')} />

  return (
    <div className="flex h-[calc(100vh-49px)]">
      {/* Left panel */}
      <div className="w-80 flex-shrink-0 border-r border-[#222222] flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-[#222222] overflow-x-auto scrollbar-none">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSelectedId(null) }}
              className={`flex-shrink-0 px-3 py-3 text-xs font-medium transition-colors relative ${
                tab === t.key ? 'text-[#8b5cf6]' : 'text-[#555555] hover:text-[#888888]'
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  tab === t.key ? 'bg-[#8b5cf6] text-white' : 'bg-[#222222] text-[#555555]'
                }`}>
                  {t.count}
                </span>
              )}
              {tab === t.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8b5cf6]" />}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {tab === 'waiting' && (
            waitingOrders.length === 0
              ? <p className="text-[#555555] text-sm text-center py-8">Нет оплаченных заказов</p>
              : waitingOrders.map(o => (
                <WaitingOrderCard key={o.id} order={o} active={selectedId === o.id} onClick={() => handleSelect(o.id)} />
              ))
          )}
          {tab === 'ready' && (
            readySessions.length === 0
              ? <p className="text-[#555555] text-sm text-center py-8">Нет заказов</p>
              : readySessions.map(s => {
                const msgs = messageMap[s.id] ?? []
                return (
                  <SessionCard
                    key={s.id} session={s}
                    order={readyOrders.find(o => o.id === s.order_id)}
                    lastMessage={msgs.at(-1)}
                    unread={unreadMap[s.id] ?? 0}
                    active={selectedId === s.id}
                    onClick={() => handleSelect(s.id)}
                  />
                )
              })
          )}
          {tab === 'support' && (
            questionSessions.length === 0
              ? <p className="text-[#555555] text-sm text-center py-8">Нет обращений</p>
              : questionSessions.map(s => {
                const msgs = messageMap[s.id] ?? []
                return (
                  <SessionCard
                    key={s.id} session={s}
                    lastMessage={msgs.at(-1)}
                    unread={unreadMap[s.id] ?? 0}
                    active={selectedId === s.id}
                    onClick={() => handleSelect(s.id)}
                  />
                )
              })
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 overflow-hidden">
        {!selectedId ? (
          <div className="flex items-center justify-center h-full text-[#333333]">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm">Выберите заказ или обращение</p>
            </div>
          </div>
        ) : selectedOrder ? (
          <OrderPane order={selectedOrder} />
        ) : selectedSession ? (
          <ChatPane
            key={selectedSession.id}
            session={selectedSession}
            order={selectedSessionOrder}
            messages={sessionMessages}
            onSent={handleSent}
          />
        ) : null}
      </div>
    </div>
  )
}
