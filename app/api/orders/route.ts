import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase-service'
import { sendOrderCreated } from '@/lib/email'
import type { OrderItem } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, roblox_username, roblox_user_id, items, total_rub, user_id } = body as {
      email: string
      roblox_username: string
      roblox_user_id: number
      items: OrderItem[]
      total_rub: number
      user_id: string | null
    }

    if (!email || !roblox_username || !items?.length || !total_rub) {
      return NextResponse.json({ error: 'Заполните все обязательные поля' }, { status: 400 })
    }

    const supabase = createServiceSupabase()
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: user_id ?? null,
        email: email.trim().toLowerCase(),
        roblox_username,
        roblox_user_id: roblox_user_id ?? 0,
        items,
        total_rub,
        status: 'pending',
      })
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Ошибка создания заказа' }, { status: 500 })
    }

    // Отправляем email асинхронно, не ждём
    sendOrderCreated(data).catch(() => {})

    return NextResponse.json({ order: data })
  } catch {
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
