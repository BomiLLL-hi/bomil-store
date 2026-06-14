import { createServiceSupabase } from './supabase-service'

export async function getAllProducts() {
  try {
    const db = createServiceSupabase()
    const { data, error } = await db
      .from('products')
      .select('*')
      .eq('hidden_status', false)
      .order('created_at', { ascending: false })

    if (error) { console.error('getAllProducts error:', error); return [] }
    return data ?? []
  } catch (e) {
    console.error('getAllProducts exception:', e)
    return []
  }
}

export async function getProductsByIds(ids: string[]) {
  if (!ids.length) return []
  try {
    const db = createServiceSupabase()
    const { data, error } = await db
      .from('products')
      .select('*')
      .in('id', ids)

    if (error) return []
    return data ?? []
  } catch {
    return []
  }
}

export async function getUsdRate(): Promise<number> {
  try {
    const db = createServiceSupabase()
    const { data } = await db
      .from('site_settings')
      .select('value')
      .eq('key', 'usd_rate')
      .single()

    return data ? parseFloat(data.value) : 90
  } catch {
    return 90
  }
}
