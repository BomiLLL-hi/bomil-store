'use client'

import { useState } from 'react'
import { useApp } from './providers'
import type { FaqItem } from '@/lib/types'

function FaqRow({ item, lang }: { item: FaqItem; lang: string }) {
  const [open, setOpen] = useState(false)
  const question = lang === 'ru' ? item.question_ru : item.question_en
  const answer = lang === 'ru' ? item.answer_ru : item.answer_en

  return (
    <div className="border-b border-[#1a1a1a] last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-white text-sm font-medium leading-relaxed">{question}</span>
        <svg
          className={`w-4 h-4 flex-shrink-0 text-[#8b5cf6] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <p className="text-[#888888] text-sm leading-relaxed pb-4">{answer}</p>
        </div>
      </div>
    </div>
  )
}

export default function FaqBlock({ items }: { items: FaqItem[] }) {
  const { t, lang } = useApp()

  if (items.length === 0) return null

  return (
    <section className="py-12 border-t border-[#161616]">
      <div className="px-4 md:px-6 max-w-3xl mx-auto">
        <h2 className="text-lg font-bold text-white mb-6">{t('faq.title')}</h2>
        <div className="bg-[#111111] border border-[#222222] rounded-2xl px-5">
          {items.map(item => (
            <FaqRow key={item.id} item={item} lang={lang} />
          ))}
        </div>
      </div>
    </section>
  )
}
