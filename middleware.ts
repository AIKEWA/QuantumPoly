import createMiddleware from 'next-intl/middleware';

// Define locales directly in the middleware
const locales = ['en', 'de', 'tr'];
const defaultLocale = 'en';

// This middleware handles internationalization
export default createMiddleware({
  // A list of all locales that are supported
  locales,
  
  // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
  defaultLocale,
  
  // Whether to use the locale prefix in URLs
  localePrefix: 'as-needed'
});

export const config = {
  // Match all pathnames except for
  // - static files (e.g. /_next/*, /images/*)
  // - API routes (e.g. /api/*)
  matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico).*)']
}; 