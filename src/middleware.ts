import createMiddleware from 'next-intl/middleware';

import { defaultLocale, locales } from './i18n';

// eslint-disable-next-line import/no-default-export -- Required by Next.js middleware
export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Default locale when no locale is specified
  defaultLocale,

  // Always use locale prefix for consistent routing
  localePrefix: 'always',

  // Locale detection based on Accept-Language header
  localeDetection: true,
});

export const config = {
  // Match all routes except Next.js internals and static files
  // Explicitly include root path and all locale paths
  matcher: [
    '/',
    '/(de|en|tr|es|fr|it)/:path*',
    '/((?!_next|_vercel|api|.*\\..*).*)',
  ],
};

