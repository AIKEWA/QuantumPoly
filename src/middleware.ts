/**
 * next-intl Middleware for QuantumPoly
 *
 * This middleware handles locale routing and detection for our internationalized
 * Next.js application using the App Router.
 *
 * @module middleware
 * @version 1.0.0
 * @author QuantumPoly Development Team
 */

import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '../i18n';

/**
 * Create and configure the internationalization middleware
 *
 * This middleware:
 * - Automatically detects user locale preferences
 * - Redirects to appropriate locale routes
 * - Handles locale switching
 * - Sets appropriate headers for SEO
 */
export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Configure locale detection
  localeDetection: true,

  // Configure locale prefix handling
  localePrefix: 'as-needed', // Only add prefix for non-default locales

  // Configure alternative links for SEO
  alternateLinks: true,

  // REVIEW: Consider adding custom path matching for specific routes
  pathnames: {
    '/': '/',
    '/about': {
      en: '/about',
      de: '/ueber-uns',
      tr: '/hakkimizda',
    },
    // Add more custom pathnames as needed
  },
});

/**
 * Configure which routes the middleware should run on
 *
 * This matcher ensures the middleware only runs on routes that need
 * internationalization, excluding API routes, static files, and assets.
 */
export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(de|tr)/:path*',

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
};

// FEEDBACK: Monitor middleware performance and locale detection accuracy
// DISCUSS: Should we add custom logic for business users or regional preferences?
