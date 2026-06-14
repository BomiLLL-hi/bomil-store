import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kbfrmdtaggmffkolkigp.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'tr.rbxcdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'thumbnails.roblox.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
