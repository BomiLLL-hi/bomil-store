'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useLiveChat } from './useLiveChat'
import ChatWidget from './ChatWidget'

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()
  const chat = useLiveChat(user?.id)

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.top = `-${scrollY}px`
    } else {
      const top = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.top = ''
      if (top) window.scrollTo(0, parseInt(top) * -1)
    }
    return () => {
      const top = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.top = ''
      if (top) window.scrollTo(0, parseInt(top) * -1)
    }
  }, [isOpen])

  function open() {
    setIsOpen(true)
    chat.onOpen()
  }

  function close() {
    setIsOpen(false)
    chat.onClose()
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={open}
        aria-label="Открыть чат поддержки"
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#8b5cf6] text-white rounded-full shadow-lg shadow-[#8b5cf6]/30 flex items-center justify-center transition-all duration-200 hover:bg-[#7c3aed] hover:scale-110 hover:shadow-xl hover:shadow-[#8b5cf6]/40 active:scale-95 ${
          isOpen ? 'opacity-0 pointer-events-none scale-75' : 'opacity-100 scale-100'
        }`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {chat.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#ef4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
          </span>
        )}
      </button>

      {/* Mobile overlay — always in DOM */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={close}
      />

      {/* Chat panel — always in DOM, CSS show/hide */}
      <div
        className={`fixed z-50 bg-[#0f0f0f] border border-[#222222] flex flex-col shadow-2xl
          bottom-0 left-0 right-0 h-[100dvh] rounded-t-2xl
          md:bottom-6 md:right-6 md:left-auto md:w-[380px] md:h-[520px] md:rounded-2xl
          transition-transform duration-300 ease-out md:transition-none ${
          isOpen
            ? 'translate-y-0'
            : 'translate-y-full pointer-events-none md:hidden'
        }`}
      >
        <ChatWidget
          isOpen={isOpen}
          messages={chat.messages}
          sending={chat.sending}
          showFlowButtons={chat.showFlowButtons}
          initialized={chat.initialized}
          session={chat.session}
          onSend={chat.sendMessage}
          onReset={chat.resetFlow}
          onClose={close}
        />
      </div>
    </>
  )
}
