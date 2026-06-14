import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.get('ids')
  if (!ids) return NextResponse.json({ data: [] })

  try {
    const res = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${ids}&size=48x48&format=Png&isCircular=true`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return NextResponse.json({ data: [] })
    const json = await res.json()
    return NextResponse.json({ data: json.data ?? [] })
  } catch {
    return NextResponse.json({ data: [] })
  }
}
