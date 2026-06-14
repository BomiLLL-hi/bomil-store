import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getAllProducts() {
  try {
    const { data, error } = await supabase
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

export async function getProductBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('hidden_status', false)
      .single()

    if (error) return null
    return data
  } catch {
    return null
  }
}

export async function getProductsByIds(ids: string[]) {
  if (!ids.length) return []
  try {
    const { data, error } = await supabase
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
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'usd_rate')
      .single()

    return data ? parseFloat(data.value) : 90
  } catch {
    return 90
  }
}
