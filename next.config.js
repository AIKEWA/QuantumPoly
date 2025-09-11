/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const isPreview = process.env.VERCEL_ENV === 'preview';

const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  async headers() {
    const securityHeaders = [
      {
        key: isProd ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only',
        value: csp,
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
      {
        key: 'Cross-Origin-Opener-Policy',
        value: 'same-origin',
      },
      {
        key: 'Cross-Origin-Resource-Policy',
        value: 'same-origin',
      },
    ];

    // Add noindex for preview environments
    if (isPreview) {
      securityHeaders.push({
        key: 'X-Robots-Tag',
        value: 'noindex',
      });
    }

    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
