import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/cms', destination: '/admin', permanent: true },
      { source: '/cms/:path*', destination: '/admin/:path*', permanent: true },
      { source: '/blog', destination: '/articles', permanent: true },
      { source: '/blog/:slug', destination: '/articles/:slug', permanent: true },
      { source: '/work', destination: '/works', permanent: true },
      { source: '/work/:slug', destination: '/works/:slug', permanent: true },
      { source: '/case-study/:slug', destination: '/works/:slug', permanent: true },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.regru.cloud',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
}

export default nextConfig
