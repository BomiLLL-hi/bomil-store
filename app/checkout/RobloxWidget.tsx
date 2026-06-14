'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/components/providers'

interface RobloxUser {
  id: number
  name: string
  displayName: string
}

interface AvatarData {
  targetId: number
  imageUrl: string
}

interface Props {
  onSelect: (username: string, userId: number) => void
  selected: { username: string; userId: number } | null
  initialQuery?: string
}

export default function RobloxWidget({ onSelect, selected, initialQuery }: Props) {
  const { t } = useApp()
  const [query, setQuery] = useState(initialQuery ?? '')
  const [results, setResults] = useState<RobloxUser[]>([])
  const [avatars, setAvatars] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim() || query.length < 2) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/roblox/search?q=${encodeURIComponent(query)}`)
        const json = await res.json()
        const users: RobloxUser[] = json.data ?? []
        setResults(users)

        if (users.length > 0) {
          const ids = users.map(u => u.id).join(',')
          const avatarRes = await fetch(`/api/roblox/avatars?ids=${ids}`)
          const avatarJson = await avatarRes.json()
          const map: Record<number, string> = {}
          for (const a of (avatarJson.data ?? []) as AvatarData[]) {
            map[a.targetId] = a.imageUrl
          }
          setAvatars(map)
        }
      } catch {}
      setLoading(false)
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  if (selected) {
    return (
      <div className="flex items-center justify-between bg-[#111111] border border-[#22c55e]/40 rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1a1a1a] overflow-hidden flex-shrink-0">
            {avatars[selected.userId] ? (
              <Image
                src={avatars[selected.userId]}
                alt={selected.username}
                width={32}
                height={32}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#555555] text-xs font-bold">
                {selected.username[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-white text-sm font-medium">{selected.username}</p>
            <p className="text-[#22c55e] text-xs">{t('checkout.roblox_hint')}</p>
          </div>
        </div>
        <button
          onClick={() => { onSelect('', 0); setQuery('') }}
          className="text-[#888888] hover:text-white text-xs transition-colors ml-2"
        >
          {t('checkout.roblox_change')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-[#555555] text-xs">Введите точный никнейм как в Roblox</p>
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555] w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('checkout.roblox_search')}
          className="w-full bg-[#111111] border border-[#333333] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#8b5cf6] transition-colors"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
          {results.map((user) => (
            <button
              key={user.id}
              onClick={() => {
                onSelect(user.name, user.id)
                setQuery('')
                setResults([])
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1a1a1a] transition-colors text-left border-b border-[#1a1a1a] last:border-0"
            >
              <div className="w-8 h-8 rounded-full bg-[#1a1a1a] overflow-hidden flex-shrink-0">
                {avatars[user.id] ? (
                  <Image
                    src={avatars[user.id]}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#555555] text-xs font-bold">
                    {user.name[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{user.name}</p>
                {user.displayName !== user.name && (
                  <p className="text-[#555555] text-xs truncate">{user.displayName}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {query.length >= 2 && !loading && results.length === 0 && (
        <p className="text-[#555555] text-xs text-center py-2">{t('search.no_results')}</p>
      )}
    </div>
  )
}
