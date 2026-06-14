import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('q')?.trim()
  const q = raw?.startsWith('@') ? raw.slice(1) : raw
  if (!q || q.length < 3) {
    return NextResponse.json({ data: [] })
  }

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Origin': 'https://www.roblox.com',
    'Referer': 'https://www.roblox.com/',
  }

  // Try search endpoint first
  try {
    const res = await fetch(
      `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(q)}&limit=8`,
      { cache: 'no-store', headers }
    )
    if (res.ok) {
      const json = await res.json()
      if (json.data?.length > 0) {
        return NextResponse.json({ data: json.data })
      }
    }
  } catch {}

  // Fallback: exact username lookup via POST
  try {
    const res = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      cache: 'no-store',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [q], excludeBannedUsers: false }),
    })
    if (res.ok) {
      const json = await res.json()
      if (json.data?.length > 0) {
        return NextResponse.json({ data: json.data.map((u: { id: number; name: string; displayName: string }) => ({
          id: u.id,
          name: u.name,
          displayName: u.displayName,
        })) })
      }
    }
  } catch {}

  return NextResponse.json({ data: [] })
}
