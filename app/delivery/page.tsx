import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Условия доставки — BOMIL SHOP',
}

const points = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Время работы',
    text: 'Выдача заказов производится с 10:00 до 23:00 по московскому времени.',
    accent: true,
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: 'Живая выдача',
    text: 'Все заказы выдаются реальными людьми — нашими модераторами.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Скорость выдачи',
    text: 'Среднее время выдачи заказа составляет 1–10 минут в рабочее время. При большом количестве заказов время ожидания может быть немного увеличено.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
      </svg>
    ),
    title: 'Встреча в игре',
    text: 'Для получения заказа вы обязательно должны встретиться в игре с нашим модератором.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 12.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: 'Связь с модератором',
    text: 'После оформления заказа с вами свяжется модератор магазина для согласования выдачи.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Видеозапись',
    text: 'Каждый сотрудник записывает на видео передачу всех предметов. Это гарантия безопасности для обеих сторон.',
  },
]

export default function RefundPage() {
  return (
    <div className="px-4 md:px-6 max-w-3xl mx-auto py-12">
      <Link href="/" className="inline-flex items-center gap-1.5 text-[#888888] hover:text-white text-sm mb-8 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        На главную
      </Link>

      {/* Header */}
      <div className="mb-10">
        <p className="text-[#8b5cf6] text-xs font-semibold uppercase tracking-widest mb-2">Информация</p>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">Условия доставки</h1>
        <p className="text-[#555555] text-sm">Как происходит выдача заказов в BOMIL SHOP</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {points.map((point, i) => (
          <div
            key={i}
            className={`rounded-2xl p-5 border ${
              point.accent
                ? 'bg-[#8b5cf6]/10 border-[#8b5cf6]/30'
                : 'bg-[#111111] border-[#222222]'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${
              point.accent ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]' : 'bg-[#1a1a1a] text-[#888888]'
            }`}>
              {point.icon}
            </div>
            <h2 className={`font-semibold text-sm mb-2 ${point.accent ? 'text-[#a78bfa]' : 'text-white'}`}>
              {point.title}
            </h2>
            <p className="text-[#888888] text-sm leading-relaxed">{point.text}</p>
          </div>
        ))}
      </div>

      {/* Bottom note */}
      <div className="mt-8 bg-[#111111] border border-[#222222] rounded-2xl p-5 flex gap-4 items-start">
        <div className="w-9 h-9 rounded-xl bg-[#22c55e]/10 text-[#22c55e] flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <p className="text-white font-semibold text-sm mb-1">Гарантия безопасности</p>
          <p className="text-[#888888] text-sm leading-relaxed">
            Если у вас возникли вопросы или проблемы с заказом — напишите нам в Telegram или через форму техподдержки на сайте. Мы всё решим.
          </p>
        </div>
      </div>
    </div>
  )
}
