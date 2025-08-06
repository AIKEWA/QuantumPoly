/**
 * Locale Handler Module
 * 
 * Responsible for locale detection, validation, and redirection.
 * This module contains all logic related to handling locales in middleware.
 */

import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { MIDDLEWARE_CONFIG } from '../config';
import { detectLocale, setLocalePreference } from '../../utils/localeDetection';
import { logDebug } from '../../utils/debugLogging';

// Set up next-intl middleware with our config
const intlMiddleware = createIntlMiddleware({
  locales: MIDDLEWARE_CONFIG.LOCALES,
  defaultLocale: MIDDLEWARE_CONFIG.DEFAULT_LOCALE,
  localeDetection: false, // Disable built-in detection as we're handling it manually
});

/**
 * Checks if the current path has a valid locale prefix
 */
export function hasValidLocalePrefix(pathname: string): { 
  hasLocalePrefix: boolean;
  firstSegment: string;
} {
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0] || '';
  const hasLocalePrefix = MIDDLEWARE_CONFIG.LOCALES.includes(firstSegment);
  
  logDebug('localeHandler', `Path segments: ${JSON.stringify(pathSegments)}, firstSegment: "${firstSegment}", hasLocalePrefix: ${hasLocalePrefix}`);
  
  return { hasLocalePrefix, firstSegment };
}

/**
 * Handles paths that already have valid locale prefixes
 */
export function handleLocalizedPath(request: NextRequest): NextResponse {
  const { pathname } = new URL(request.url);
  const { firstSegment } = hasValidLocalePrefix(pathname);
  
  logDebug('localeHandler', `Path already has valid locale prefix (${firstSegment}), forwarding to intlMiddleware`);
  
  // Handle with intlMiddleware
  const response = intlMiddleware(request);
  
  // Save the user's locale preference
  setLocalePreference(firstSegment, response);
  
  return response;
}

/**
 * Creates a redirect to the appropriate localized path
 */
export function createLocaleRedirect(
  request: NextRequest, 
  locale: string, 
  options: { 
    isSafari?: boolean; 
    addNoRedirectParam?: boolean;
  } = {}
): NextResponse {
  const { pathname, search } = new URL(request.url);
  const { isSafari = false, addNoRedirectParam = false } = options;
  
  // Use pathname for determining the new path
  const newPathname = pathname === '/' ? '' : pathname;
  const redirectTarget = `/${locale}${newPathname}`;
  
  // Prepare redirect URL
  const redirectUrl = new URL(`${redirectTarget}${search || ''}`, request.url);
  
  // For Safari, add a special parameter to help track and debug Safari-specific issues
  if (isSafari) {
    redirectUrl.searchParams.set(MIDDLEWARE_CONFIG.PARAMS.SAFARI_MARKER, '1');
  }
  
  // Add noRedirect parameter if requested (for loop protection)
  if (addNoRedirectParam) {
    redirectUrl.searchParams.set(MIDDLEWARE_CONFIG.PARAMS.NO_REDIRECT, '1');
  }
  
  // Use 302 Found instead of 307 Temporary Redirect for better Safari compatibility
  const response = NextResponse.redirect(redirectUrl, { status: 302 });
  
  // Add debugging headers
  response.headers.set('X-Redirect-Type', 'locale-redirect');
  response.headers.set('X-Detected-Locale', locale);
  
  // Save the detected locale preference
  setLocalePreference(locale, response);
  
  return response;
} 