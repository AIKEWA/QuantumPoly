import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { defaultLocale, locales } from './i18n';
import { reviewAuthMiddleware } from './middleware/review-auth';

// Create i18n middleware
const i18nMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Default locale when no locale is specified
  defaultLocale,

  // Always use locale prefix for consistent routing
  localePrefix: 'always',

  // Locale detection based on Accept-Language header
  localeDetection: true,
});

// Combined middleware: auth check + i18n
// eslint-disable-next-line import/no-default-export -- Required by Next.js middleware
export default function middleware(request: NextRequest): NextResponse {
  // Check review authentication first
  const authResponse = reviewAuthMiddleware(request);
  if (authResponse) {
    return authResponse;
  }

  // Continue with i18n middleware
  return i18nMiddleware(request);
}

export const config = {
  // Match all routes except Next.js internals and static files
  // Explicitly include root path, all locale paths, and API routes
  matcher: ['/', '/(de|en|tr|es|fr|it)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
