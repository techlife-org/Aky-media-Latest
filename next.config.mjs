/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'https://abbakabiryusuf.com',
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://server.bitcoops.com',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: false,
  // Dynamic output based on environment
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : process.env.EXPORT_STATIC === 'true' ? 'export' : 'standalone',
  // Disable static optimization for API routes when not exporting
  ...(process.env.EXPORT_STATIC === 'true' && {
    distDir: 'out',
    basePath: '',
    assetPrefix: '',
    trailingSlash: true,
    // Skip API routes during static export
    generateBuildId: async () => {
      return 'static-export'
    },
  }),
  experimental: {
    serverComponentsExternalPackages: ['mongodb'],
  },
  images: {
    unoptimized: true,
    domains: ['server.bitcoops.com', 'abbakabiryusuf.com', 'res.cloudinary.com', 'img.youtube.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'server.bitcoops.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'abbakabiryusuf.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
  async rewrites() {
    // Only apply rewrites when not exporting static
    if (process.env.EXPORT_STATIC === 'true') {
      return []
    }
    
    return [
      {
        source: '/socket.io/:path*',
        destination: '/api/socket/:path*',
      },
    ]
  },
}

export default nextConfig
