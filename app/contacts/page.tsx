import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Контакты — BOMIL SHOP',
  description: 'Свяжитесь с нами любым удобным способом',
}

const contacts = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    label: 'ИП',
    value: 'Шестов Богдан Дмитриевич',
    href: null,
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    label: 'ИНН',
    value: '392301788835',
    href: null,
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    label: 'Телефон',
    value: '+7 911 478-22-53',
    href: 'tel:+79114782253',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Почта',
    value: 'malyasss123@mail.ru',
    href: 'mailto:malyasss123@mail.ru',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.48 14.013l-2.95-.924c-.64-.204-.657-.64.136-.954l11.526-4.446c.537-.194 1.006.131.37.559z" />
      </svg>
    ),
    label: 'Telegram',
    value: '@iosbitch',
    href: 'https://t.me/iosbitch',
  },
]

export default function ContactsPage() {
  return (
    <div className="px-4 md:px-6 max-w-2xl mx-auto py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[#888888] hover:text-white text-sm mb-10 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        В каталог
      </Link>

      {/* Заголовок */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-3">Контакты</h1>
        <p className="text-[#888888] text-sm leading-relaxed">
          Если у вас остались какие-то вопросы, свяжитесь с нами любым удобным способом — мы всегда на связи.
        </p>
      </div>

      {/* Карточки */}
      <div className="space-y-3 mb-10">
        {contacts.map(({ icon, label, value, href }) => (
          <div
            key={label}
            className="bg-[#111111] border border-[#222222] rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-[#8b5cf6]/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6] flex-shrink-0">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#555555] text-xs mb-0.5">{label}</p>
              {href ? (
                <a
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="text-white font-medium text-sm hover:text-[#a78bfa] transition-colors"
                >
                  {value}
                </a>
              ) : (
                <p className="text-white font-medium text-sm">{value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Баннер */}
      <div className="bg-gradient-to-br from-[#8b5cf6]/10 to-[#7c3aed]/5 border border-[#8b5cf6]/20 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-[#8b5cf6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <p className="text-white font-semibold mb-1">Быстрый ответ</p>
        <p className="text-[#888888] text-sm">Напишите нам в Telegram — мы обычно отвечаем в течение нескольких минут.</p>
      </div>
    </div>
  )
}
