/**
 * Middleware Configuration
 * 
 * This file contains all static configuration for the QuantumPoly middleware,
 * separating configuration from implementation.
 */

import { locales, defaultLocale } from '../i18n';

// Constants for middleware behavior
export const MIDDLEWARE_CONFIG = {
  // Locale and redirects
  LOCALES: locales,
  DEFAULT_LOCALE: defaultLocale,
  
  // Cookie names and expiration
  COOKIES: {
    REDIRECT_HISTORY: 'redirect-history',
    JUST_REDIRECTED: 'just-redirected',
    LOCALE_PREFERENCE: 'NEXT_LOCALE',
  },
  
  // Safety thresholds
  SAFETY: {
    MAX_REDIRECTS: 2,
    COOKIE_EXPIRY: 60, // 1 minute expiry for redirect protection
    JUST_REDIRECTED_EXPIRY: 1, // 1 second expiry to minimize blocking future redirects
    REDIRECT_RACE_TIMEOUT_MS: 1500, // 1.5 seconds
  },
  
  // URL parameters
  PARAMS: {
    NO_REDIRECT: 'noRedirect',
    SAFARI_BYPASS: 'safari-bypass',
    SAFARI_MARKER: '_safari',
  },
  
  // Development mode detection
  IS_DEV: process.env.NODE_ENV === 'development',
  
  // Path exclusions
  EXCLUDE_PATHS: ['api', '_next', 'assets', '_vercel'],
};

/**
 * Static middleware matcher configuration
 * This defines which routes the middleware will be applied to
 */
export const config = {
  // IMPORTANT: Using a static array of strings for matcher configuration
  // This prevents dynamic expressions that can cause inconsistent behavior
  matcher: [
    // Include root path - critical for initial locale detection
    '/',
    
    // Include locale paths to ensure proper handling
    ...locales.map(locale => `/${locale}`),
    ...locales.map(locale => `/${locale}/`),
    
    // Catch all other non-locale, non-excluded paths with a static pattern
    // Note: This pattern matches any path that doesn't start with:
    // - A locale prefix
    // - An excluded path prefix 
    // - A file extension
    '/((?!api|_next|assets|_vercel|en|de|tr).*)'
  ]
}; 