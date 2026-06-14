'use client'

import { useEffect, useRef, useState } from 'react'
import type { ChatMessage, ChatSession } from '@/lib/types'

const COOLDOWN_MS = 500

function getSessionKey(userId?: string) {
  return userId ? `mm2_chat_session_${userId}` : 'mm2_chat_session_guest'
}

export function useLiveChat(userId?: string) {
  const [session, setSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sending, setSending] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showFlowButtons, setShowFlowButtons] = useState(false)
  const lastSentRef = useRef(0)
  const isOpenRef = useRef(false)
  const initStartedRef = useRef(false)

  // Автоматическая инициализация при монтировании — данные загружаются до первого открытия
  useEffect(() => {
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Ref для текущих сообщений — чтобы не читать state внутри updater
  const messagesRef = useRef<ChatMessage[]>([])
  useEffect(() => { messagesRef.current = messages }, [messages])

  // Polling ответов оператора и бот-уведомлений каждые 3 секунды
  // (Realtime заблокирован RLS для анонимных пользователей)
  const sessionIdRef = useRef<string | null>(null)
  useEffect(() => { sessionIdRef.current = session?.id ?? null }, [session?.id])

  useEffect(() => {
    async function pollOperatorMessages() {
      const sid = sessionIdRef.current
      if (!sid) return
      try {
        const res = await fetch(`/api/chat/messages?sessionId=${sid}`, { cache: 'no-store' })
        if (!res.ok) return
        const { messages: fetched } = await res.json() as { messages: ChatMessage[] }
        if (!fetched) return

        const existingIds = new Set(messagesRef.current.map(m => m.id))
        const incoming = fetched.filter(m =>
          !existingIds.has(m.id) &&
          (m.sender_type === 'operator' || m.sender_type === 'bot')
        )
        if (incoming.length === 0) return

        // Побочные эффекты вне setState updater
        if (!isOpenRef.current) {
          const operatorCount = incoming.filter(m => m.sender_type === 'operator').length
          if (operatorCount > 0) setUnreadCount(c => c + operatorCount)
          playSound()
        }

        setMessages(prev => {
          const prevIds = new Set(prev.map(m => m.id))
          const toAdd = incoming.filter(m => !prevIds.has(m.id))
          if (toAdd.length === 0) return prev
          return [...prev, ...toAdd]
        })
      } catch {}
    }

    const interval = setInterval(pollOperatorMessages, 3000)
    return () => clearInterval(interval)
  }, [])

  async function init() {
    if (initStartedRef.current) return
    initStartedRef.current = true
    try {
      const key = getSessionKey(userId)
      const guestKey = getSessionKey(undefined)
      let savedId = typeof window !== 'undefined' ? localStorage.getItem(key) : null

      // Залогиненный без своей сессии — берём гостевую
      if (!savedId && userId && typeof window !== 'undefined') {
        savedId = localStorage.getItem(guestKey)
      }

      const res = await fetch('/api/chat/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: savedId, userId: userId ?? null }),
      })
      if (!res.ok) throw new Error('session error')
      const data = await res.json()
      if (data.session) {
        setSession(data.session)
        setMessages(data.messages ?? [])
        localStorage.setItem(key, data.session.id)
        // Гостевая сессия перенесена — удаляем гостевой ключ
        if (userId && typeof window !== 'undefined') {
          localStorage.removeItem(guestKey)
        }
      }
      setShowFlowButtons(!data.session?.type)
      setInitialized(true)
    } catch {
      initStartedRef.current = false // разрешаем повторную попытку при следующем открытии
    }
  }

  async function sendMessage(content: string) {
    if (!session || sending) return
    const now = Date.now()
    if (now - lastSentRef.current < COOLDOWN_MS) return
    lastSentRef.current = now
    setSending(true)
    if (content === 'Получить заказ' || content === 'Связаться с тех поддержкой') {
      setShowFlowButtons(false)
    }

    const tempId = `tmp_${now}`
    const tempMsg: ChatMessage = {
      id: tempId, session_id: session.id, sender_type: 'user',
      content, created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempMsg])

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id, content }),
      })
      const { userMessage, botMessage } = await res.json()

      setMessages(prev => [
        ...prev.map(m => m.id === tempId ? { ...(userMessage ?? m), id: tempId } : m),
        ...(botMessage ? [botMessage] : []),
      ])

      // Обновляем локальный тип сессии (ticket_number не трогаем — он постоянный)
      if (content === 'Получить заказ' || content === 'Связаться с тех поддержкой') {
        const updatedType = content === 'Получить заказ' ? 'order' : 'question'
        setSession(s => s ? { ...s, type: updatedType, order_id: null } : s)
        setShowFlowButtons(false)
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId))
    }
    setSending(false)
  }

  async function resetFlow() {
    if (!session || sending) return
    setSending(true)
    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id, content: '__reset' }),
      })
      const { botMessage } = await res.json()
      if (botMessage) setMessages(prev => [...prev, botMessage])
      setSession(s => s ? { ...s, type: null, order_id: null } : s)
      setTimeout(() => setShowFlowButtons(true), 300)
    } catch {}
    setSending(false)
  }

  function onOpen() {
    isOpenRef.current = true
    setUnreadCount(0)
    if (!initialized) init()
  }

  function onClose() {
    isOpenRef.current = false
  }

  return { session, messages, sending, initialized, unreadCount, showFlowButtons, sendMessage, resetFlow, onOpen, onClose }
}

function playSound() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.25)
    osc.onended = () => ctx.close()
  } catch {}
}
