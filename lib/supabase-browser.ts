import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim()
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim()

let _client: ReturnType<typeof createClient> | null = null

export function createBrowserSupabase() {
  if (typeof window === 'undefined') {
    return createClient(url, key)
  }
  if (!_client) {
    _client = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storage: window.localStorage,
      },
    })
  }
  return _client
}
