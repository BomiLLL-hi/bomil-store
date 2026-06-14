'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ChatMessage } from '@/lib/types'

interface Props {
  isOpen: boolean
  messages: ChatMessage[]
  sending: boolean
  showFlowButtons: boolean
  initialized: boolean
  session: { type: string | null; ticket_number: string | null; order_id: string | null } | null
  onSend: (content: string) => void
  onReset: () => void
  onClose: () => void
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function formatDateSeparator(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const key = (dt: Date) => dt.toDateString()
  if (key(d) === key(today)) return 'Сегодня'
  if (key(d) === key(yesterday)) return 'Вчера'
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

function msgDateKey(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function MessageBubble({ msg, isNew, animDuration = '0.3s' }: { msg: ChatMessage; isNew: boolean; animDuration?: string }) {
  const isUser = msg.sender_type === 'user'
  const isBot = msg.sender_type === 'bot'
  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${isNew ? 'animate-fade-in-up' : ''}`}
      style={isNew ? { animationDuration: animDuration } : undefined}
    >
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-[#8b5cf6] flex items-center justify-center flex-shrink-0 mr-2 mt-1">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
          </svg>
        </div>
      )}
      <div className={`relative max-w-[75%] px-3 pt-2 pb-1.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
        isUser ? 'bg-[#8b5cf6] text-white rounded-tr-sm'
        : isBot ? 'bg-[#1a1a1a] text-white rounded-tl-sm border border-[#2a2a2a]'
        : 'bg-[#1a3a2a] text-[#22c55e] rounded-tl-sm border border-[#22c55e]/20'
      }`}>
        <span className="pr-9">{msg.content}</span>
        <span className={`absolute bottom-1.5 right-2.5 text-[10px] leading-none select-none ${isUser ? 'text-white/50' : 'text-[#555555]'}`}>
          {formatTime(msg.created_at)}
        </span>
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex justify-start">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl rounded-tl-sm px-4 py-2.5">
        <div className="flex gap-1 items-center">
          <span className="w-1.5 h-1.5 bg-[#555555] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-[#555555] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-[#555555] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

function ChatHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#222222] bg-[#0f0f0f]">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#8b5cf6] flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div>
          <p className="text-white text-sm font-semibold">Поддержка MM2</p>
          <p className="text-[#22c55e] text-xs">Онлайн</p>
        </div>
      </div>
      <button onClick={onClose} className="p-1.5 text-[#888888] hover:text-white transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

// ─── Mobile layout ────────────────────────────────────────────────────────────
// Кнопки находятся внутри scroll-области.
// Нижняя панель (инпут) всегда в DOM с фиксированной высотой — invisible когда видны кнопки.
// Это исключает layout shift при переключении.

function ChatWidgetMobile({ isOpen, messages, sending, showFlowButtons, initialized, session, onSend, onReset, onClose }: Props) {
  const [input, setInput] = useState('')
  const [stickyDate, setStickyDate] = useState<string | null>(null)
  const [stickyVisible, setStickyVisible] = useState(false)
  const [inputMode, setInputMode] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const seenIds = useRef<Set<string>>(new Set())
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didInitRef = useRef(false)

  // Sync с пропом: если сервер сбросил поток — вернуть кнопки
  useEffect(() => {
    if (showFlowButtons) setInputMode(false)
  }, [showFlowButtons])

  function handleFlowClick(content: string) {
    if (sending || !initialized) return
    setInputMode(true)
    onSend(content)
  }

  function handleReset() {
    setInputMode(false)
    onReset()
  }

  const showButtons = !inputMode

  // Скролл вниз при каждом открытии и при инициализации — до отрисовки
  useLayoutEffect(() => {
    if (!isOpen || !initialized) return
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [isOpen, initialized])

  // Новые сообщения пока чат открыт — плавно
  useEffect(() => {
    if (!initialized) return
    if (!didInitRef.current) { didInitRef.current = true; return }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, initialized])

  useEffect(() => {
    if (!sending) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [sending])

  function handleScroll() {
    const container = scrollRef.current
    if (!container) return
    const seps = container.querySelectorAll<HTMLElement>('[data-date]')
    let current: string | null = null
    const top = container.getBoundingClientRect().top
    for (const sep of seps) {
      if (sep.getBoundingClientRect().top <= top + 8) current = sep.dataset.date ?? null
    }
    if (current) {
      setStickyDate(current)
      setStickyVisible(true)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      hideTimerRef.current = setTimeout(() => setStickyVisible(false), 1500)
    }
  }

  function handleSend() {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    onSend(text)
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader onClose={onClose} />

      {/* Messages */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 relative">
        {stickyDate && (
          <div className={`sticky top-2 flex justify-center z-10 pointer-events-none transition-opacity duration-300 ${stickyVisible ? 'opacity-100' : 'opacity-0'}`}>
            <span className="px-3 py-1 rounded-full bg-[#222222]/90 backdrop-blur-sm text-[#888888] text-xs">{stickyDate}</span>
          </div>
        )}
        {!initialized ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {messages.map((msg, i) => {
              const isNew = !seenIds.current.has(msg.id)
              seenIds.current.add(msg.id)
              const showDate = i === 0 || msgDateKey(msg.created_at) !== msgDateKey(messages[i - 1].created_at)
              return (
                <div key={msg.id}>
                  {showDate && (
                    <div data-date={formatDateSeparator(msg.created_at)} className="flex justify-center my-2">
                      <span className="px-3 py-1 rounded-full bg-[#1a1a1a] text-[#666666] text-xs">{formatDateSeparator(msg.created_at)}</span>
                    </div>
                  )}
                  <MessageBubble msg={msg} isNew={isNew} />
                </div>
              )
            })}

            {session?.type === 'question' && session?.ticket_number && (
              <div className="flex justify-center pt-1">
                <button onClick={onReset} disabled={sending} className="text-xs text-[#888888] underline underline-offset-2">← Вернуться в главное меню</button>
              </div>
            )}

            {sending && <TypingDots />}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Bottom panel */}
      <div className="border-t border-[#222222] bg-[#0f0f0f] flex-shrink-0">
        {showButtons ? (
          <div className="flex flex-col gap-2 px-3 py-3">
            <button
              onClick={() => handleFlowClick('Получить заказ')}
              disabled={sending || !initialized}
              className="w-full py-2.5 bg-[#8b5cf6] disabled:opacity-40 text-white text-sm font-semibold rounded-xl"
            >
              📦 Получить заказ
            </button>
            <button
              onClick={() => handleFlowClick('Связаться с тех поддержкой')}
              disabled={sending || !initialized}
              className="w-full py-2.5 bg-transparent border border-[#8b5cf6] disabled:opacity-40 text-[#8b5cf6] text-sm font-semibold rounded-xl"
            >
              💬 Связаться с тех поддержкой
            </button>
          </div>
        ) : (
          <div className="flex flex-col px-3 py-3">
            {(session?.type !== 'question' || !session?.ticket_number) && !session?.order_id && (
              <button onClick={handleReset} disabled={sending} className="w-full text-xs text-[#8b5cf6]/70 mb-2 text-left">← Вернуться назад</button>
            )}
            <div className="flex gap-2">
              <input
                type="text" value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Введите сообщение..." maxLength={1000}
                className="flex-1 bg-[#111111] border border-[#333333] rounded-xl px-3 py-2.5 text-[16px] text-white placeholder-[#555555] focus:outline-none focus:border-[#8b5cf6] transition-colors"
              />
              <button onClick={handleSend} disabled={!input.trim() || sending} className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[#8b5cf6] disabled:bg-[#333333] disabled:text-[#555555] text-white rounded-xl">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Desktop layout ───────────────────────────────────────────────────────────
// Нижняя панель имеет фиксированную высоту (h-[116px]).
// Кнопки и инпут оба абсолютно позиционированы внутри неё и переключаются через opacity.
// Scroll-область НИКОГДА не меняет высоту → нет прыжков.

function ChatWidgetDesktop({ isOpen, messages, sending, showFlowButtons, initialized, session, onSend, onReset, onClose }: Props) {
  const [input, setInput] = useState('')
  const [stickyDate, setStickyDate] = useState<string | null>(null)
  const [stickyVisible, setStickyVisible] = useState(false)
  const [inputMode, setInputMode] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const seenIds = useRef<Set<string>>(new Set())
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didInitRef = useRef(false)

  useEffect(() => {
    if (showFlowButtons) setInputMode(false)
  }, [showFlowButtons])

  function handleFlowClick(content: string) {
    if (sending || !initialized) return
    setInputMode(true)
    onSend(content)
  }

  function handleReset() {
    setInputMode(false)
    onReset()
  }

  // Скролл вниз при каждом открытии и при инициализации — до отрисовки
  useLayoutEffect(() => {
    if (!isOpen || !initialized) return
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [isOpen, initialized])

  // Новые сообщения пока чат открыт — плавно
  useEffect(() => {
    if (!initialized) return
    if (!didInitRef.current) { didInitRef.current = true; return }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, initialized])

  useEffect(() => {
    if (!sending) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [sending])

  function handleScroll() {
    const container = scrollRef.current
    if (!container) return
    const seps = container.querySelectorAll<HTMLElement>('[data-date]')
    let current: string | null = null
    const top = container.getBoundingClientRect().top
    for (const sep of seps) {
      if (sep.getBoundingClientRect().top <= top + 8) current = sep.dataset.date ?? null
    }
    if (current) {
      setStickyDate(current)
      setStickyVisible(true)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      hideTimerRef.current = setTimeout(() => setStickyVisible(false), 1500)
    }
  }

  function handleSend() {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    onSend(text)
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader onClose={onClose} />

      {/* Messages */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 relative">
        {stickyDate && (
          <div className={`sticky top-2 flex justify-center z-10 pointer-events-none transition-opacity duration-300 ${stickyVisible ? 'opacity-100' : 'opacity-0'}`}>
            <span className="px-3 py-1 rounded-full bg-[#222222]/90 backdrop-blur-sm text-[#888888] text-xs">{stickyDate}</span>
          </div>
        )}
        {!initialized ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {messages.map((msg, i) => {
              const isNew = !seenIds.current.has(msg.id)
              seenIds.current.add(msg.id)
              const showDate = i === 0 || msgDateKey(msg.created_at) !== msgDateKey(messages[i - 1].created_at)
              return (
                <div key={msg.id}>
                  {showDate && (
                    <div data-date={formatDateSeparator(msg.created_at)} className="flex justify-center my-2">
                      <span className="px-3 py-1 rounded-full bg-[#1a1a1a] text-[#666666] text-xs">{formatDateSeparator(msg.created_at)}</span>
                    </div>
                  )}
                  <MessageBubble msg={msg} isNew={isNew} animDuration="0.5s" />
                </div>
              )
            })}

            {session?.type === 'question' && session?.ticket_number && (
              <div className="flex justify-center pt-1">
                <button onClick={onReset} disabled={sending} className="text-xs text-[#888888] hover:text-[#8b5cf6] transition-colors underline underline-offset-2">← Вернуться в главное меню</button>
              </div>
            )}

            {sending && <TypingDots />}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Bottom panel */}
      <div className="border-t border-[#222222] bg-[#0f0f0f] flex-shrink-0">
        {!inputMode ? (
          <div className="flex flex-col gap-2 px-3 py-3">
            <button
              onClick={() => handleFlowClick('Получить заказ')}
              disabled={sending || !initialized}
              className="w-full py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              📦 Получить заказ
            </button>
            <button
              onClick={() => handleFlowClick('Связаться с тех поддержкой')}
              disabled={sending || !initialized}
              className="w-full py-2.5 bg-transparent border border-[#8b5cf6] disabled:opacity-40 text-[#8b5cf6] hover:bg-[#8b5cf6]/10 text-sm font-semibold rounded-xl transition-colors"
            >
              💬 Связаться с тех поддержкой
            </button>
          </div>
        ) : (
          <div className="flex flex-col justify-center px-3 py-3">
            {(!session?.ticket_number && !session?.order_id) && (
              <button onClick={handleReset} disabled={sending} className="w-full text-xs text-[#8b5cf6]/70 hover:text-[#8b5cf6] transition-colors mb-2 text-left">← Вернуться назад</button>
            )}
            <div className="flex gap-2">
              <input
                type="text" value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Введите сообщение..." maxLength={1000}
                className="flex-1 bg-[#111111] border border-[#333333] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#8b5cf6] transition-colors"
              />
              <button onClick={handleSend} disabled={!input.trim() || sending} className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:bg-[#333333] disabled:text-[#555555] text-white rounded-xl transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export default function ChatWidget(props: Props) {
  const isMobile = useIsMobile()
  if (isMobile === null) return null
  return isMobile ? <ChatWidgetMobile {...props} /> : <ChatWidgetDesktop {...props} />
}
