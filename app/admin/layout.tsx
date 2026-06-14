import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import { createServiceSupabase } from '@/lib/supabase-service'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth?next=/admin')

  const db = createServiceSupabase()
  const { data: profile } = await db
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'operator')) {
    redirect('/')
  }

  const navLinks = [
    { href: '/admin', label: 'Чат и Заказы' },
    { href: '/admin/products', label: 'Товары' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#0a0a0a] text-white">
      <div className="border-b border-[#222222] bg-[#0f0f0f] px-6 py-0 flex items-center gap-6 flex-shrink-0">
        <div className="flex items-center gap-2 py-3 flex-shrink-0">
          <div className="w-6 h-6 rounded bg-[#8b5cf6] flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-white font-semibold text-sm">BOMIL Admin</span>
        </div>

        <nav className="flex items-center gap-1 flex-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-3 text-xs font-medium text-[#555555] hover:text-white transition-colors border-b-2 border-transparent hover:border-[#8b5cf6]"
            >
              {label}
            </Link>
          ))}
        </nav>

        <span className="text-[#555555] text-xs py-3">{profile.role}</span>
      </div>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
