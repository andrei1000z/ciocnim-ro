/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  compress: true,
  // Edge-level rewrites: ciocnim.ro/foo → /ro/foo intern, fără headerul
  // X-Nextjs-Rewritten-Path pe care iOS Safari îl trata ca problemă CORS
  // la RSC prefetch. Transparent pentru client, fast path pe Vercel edge.
  async rewrites() {
    return {
      beforeFiles: [
        // Homepage ciocnim.ro/ → /ro
        {
          source: '/',
          destination: '/ro',
          has: [{ type: 'host', value: 'www.ciocnim.ro' }],
        },
        // Orice altceva: ciocnim.ro/:path → /ro/:path
        // Excludem /ro/* (ca să nu se rewrite-uie iar) și /api, /_next
        {
          source: '/:path((?!ro|api|_next|icon\\.svg|apple-icon|manifest|robots|sitemap|favicon|sw|og-).*)',
          destination: '/ro/:path',
          has: [{ type: 'host', value: 'www.ciocnim.ro' }],
        },
        {
          source: '/:path((?!ro|api|_next|icon\\.svg|apple-icon|manifest|robots|sitemap|favicon|sw|og-).*)/:rest*',
          destination: '/ro/:path/:rest*',
          has: [{ type: 'host', value: 'www.ciocnim.ro' }],
        },
      ],
    };
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob:",
              "connect-src 'self' wss://*.ciocnim.ro https://*.ciocnim.ro wss://*.trosc.fun https://*.trosc.fun wss://*.pusherapp.com wss://*.pusher.com https://*.pusherapp.com https://*.pusher.com https://sockjs.pusher.com https://sockjs-eu.pusher.com https://sockjs-us.pusher.com https://sockjs-ap.pusher.com https://sockjs-mt1.pusher.com",
              "media-src 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
      {
        source: '/:all*(ico|png|jpg|jpeg|svg|webp|woff|woff2)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
    ];
  },
};

export default nextConfig;
