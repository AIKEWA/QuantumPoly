/**
 * QuantumPoly Middleware
 * 
 * Main entry point for the middleware system that orchestrates locale detection,
 * redirect handling, loop protection, and browser compatibility.
 */

import { NextRequest, NextResponse } from 'next/server';
import { MIDDLEWARE_CONFIG } from './config';
import { detectLocale, setLocalePreference } from '../utils/localeDetection';
import { logDebug } from '../utils/debugLogging';
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '../i18n';
import { clearRedirectHistory } from '../utils/redirectTracker';

// Import middleware modules
import { hasValidLocalePrefix, handleLocalizedPath, createLocaleRedirect } from './modules/localeHandler';
import { shouldSkipRedirect, createProtectionRedirect, checkRedirectSafety, setJustRedirectedCookie } from './modules/redirectLogic';
import { detectSafari, shouldExcludeFromBrowserCompat } from './modules/browserCompat';
import { addDebugInfo } from './utils/debugTools';

// Export Next.js middleware config
export { config } from './config';

// Create the internationalization middleware for proper locale handling
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localeDetection: false // We handle detection manually
});

/**
 * Main middleware function
 */
export default function middleware(request: NextRequest) {
  const startTime = Date.now();
  const url = new URL(request.url);
  const { pathname, search } = url;
  
  // Get user agent to detect Safari
  const userAgent = request.headers.get('user-agent') || '';
  const isSafari = userAgent.includes('Safari') && !userAgent.includes('Chrome');
  
  // Log middleware entry for debugging
  logDebug('middleware', `Processing ${pathname}`, {
    url: request.url,
    isSafari
  });

  // STEP 1: Check if path already has a valid locale prefix
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0] || '';
  const hasValidLocalePrefix = MIDDLEWARE_CONFIG.LOCALES.includes(firstSegment);
  
  // CRITICAL: Early exit if we're already on a valid locale path
  // This is the key to preventing redirect loops
  if (hasValidLocalePrefix) {
    logDebug('middleware', `Already on a valid locale path (${firstSegment}), skipping redirect`);
    
    // Use intlMiddleware to handle the localized route
    const response = intlMiddleware(request);
    
    // Ensure we clear any redirect tracking cookies to reset state
    clearRedirectHistory(response);
    
    return response;
  }
  
  // STEP 2: Skip redirect if noRedirect parameter is present
  if (url.searchParams.has(MIDDLEWARE_CONFIG.PARAMS.NO_REDIRECT)) {
    logDebug('middleware', `Skipping redirect due to ${MIDDLEWARE_CONFIG.PARAMS.NO_REDIRECT} parameter`);
    
    // Clean up URLs in production by removing the noRedirect parameter
    if (!MIDDLEWARE_CONFIG.IS_DEV) {
      const cleanUrl = new URL(request.url);
      cleanUrl.searchParams.delete(MIDDLEWARE_CONFIG.PARAMS.NO_REDIRECT);
      return NextResponse.redirect(cleanUrl, { status: 302 });
    }
    
    return NextResponse.next();
  }
  
  // STEP 3: Skip redirect if we just redirected (prevents rapid consecutive redirects)
  if (request.cookies.has(MIDDLEWARE_CONFIG.COOKIES.JUST_REDIRECTED)) {
    logDebug('middleware', `Skipping redirect due to recent redirect (${MIDDLEWARE_CONFIG.COOKIES.JUST_REDIRECTED} cookie)`);
    const response = NextResponse.next();
    
    // Clean up by deleting the just-redirected cookie
    response.cookies.delete(MIDDLEWARE_CONFIG.COOKIES.JUST_REDIRECTED);
    
    return response;
  }
  
  // STEP 4: Skip for asset paths, API routes, and static files
  if (shouldSkipMiddleware(pathname)) {
    logDebug('middleware', `Skipping middleware for excluded path: ${pathname}`);
    return NextResponse.next();
  }
  
  // STEP 5: Check redirect history for loops
  const { redirectCount, hasLoop } = getRedirectInfo(request);
  
  // If we detect a loop or too many redirects, force the default locale with noRedirect
  if (hasLoop || redirectCount >= MIDDLEWARE_CONFIG.SAFETY.MAX_REDIRECTS) {
    logDebug('middleware', `Detected ${hasLoop ? 'loop' : 'too many redirects'}, forcing default locale`);
    
    // Create a safe URL with the default locale and noRedirect parameter
    const safeUrl = new URL(request.url);
    safeUrl.pathname = `/${MIDDLEWARE_CONFIG.DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}`;
    safeUrl.searchParams.set(MIDDLEWARE_CONFIG.PARAMS.NO_REDIRECT, '1');
    
    const response = NextResponse.redirect(safeUrl, { status: 302 });
    
    // Clear all redirect tracking cookies
    clearRedirectHistory(response);
    
    // Set locale preference to default
    setLocalePreference(MIDDLEWARE_CONFIG.DEFAULT_LOCALE, response);
    
    return response;
  }
  
  // STEP 6: For all other paths, perform normal locale detection and redirect
  const detectedLocale = detectLocale(request);
  logDebug('middleware', `Detected locale: ${detectedLocale}`);
  
  // Create the redirect URL with the detected locale
  const redirectUrl = new URL(request.url);
  redirectUrl.pathname = `/${detectedLocale}${pathname === '/' ? '' : pathname}`;
  
  // Create redirect response
  const response = NextResponse.redirect(redirectUrl, { status: 302 });
  
  // Set cookies to prevent redirect loops
  
  // 1. Track this redirect in history
  trackRedirect(request, response, redirectCount + 1);
  
  // 2. Set a very short-lived "just redirected" cookie to prevent consecutive redirects
  response.cookies.set(MIDDLEWARE_CONFIG.COOKIES.JUST_REDIRECTED, '1', {
    maxAge: MIDDLEWARE_CONFIG.SAFETY.JUST_REDIRECTED_EXPIRY, // Very short (1 second)
    path: '/',
    httpOnly: true,
    sameSite: 'lax', // For Safari compatibility
    secure: request.url.startsWith('https://')
  });
  
  // 3. Save the locale preference in a persistent cookie
  setLocalePreference(detectedLocale, response);
  
  return response;
}

/**
 * Determines if middleware should be skipped for certain paths
 */
function shouldSkipMiddleware(pathname: string): boolean {
  // Skip static files and excluded paths
  return (
    // Check for file extensions (static files)
    pathname.includes('.') ||
    // Check for excluded path prefixes
    MIDDLEWARE_CONFIG.EXCLUDE_PATHS.some(prefix => pathname.startsWith(`/${prefix}/`)) ||
    MIDDLEWARE_CONFIG.EXCLUDE_PATHS.some(prefix => pathname === `/${prefix}`)
  );
}

/**
 * Gets information about redirect history from cookies
 */
function getRedirectInfo(request: NextRequest): { redirectCount: number; hasLoop: boolean } {
  try {
    // Get redirect history cookie
    const historyCookie = request.cookies.get(MIDDLEWARE_CONFIG.COOKIES.REDIRECT_HISTORY);
    
    if (!historyCookie?.value) {
      return { redirectCount: 0, hasLoop: false };
    }
    
    // Parse the redirect history
    const history = JSON.parse(decodeURIComponent(historyCookie.value));
    
    if (!Array.isArray(history)) {
      return { redirectCount: 0, hasLoop: false };
    }
    
    // Count redirects
    const redirectCount = history.length;
    
    // Check for loops by looking for any path that appears more than once
    const pathCounts = new Map<string, number>();
    let hasLoop = false;
    
    history.forEach((entry: any) => {
      if (typeof entry.from === 'string') {
        const count = pathCounts.get(entry.from) || 0;
        pathCounts.set(entry.from, count + 1);
        
        if (count > 0) {
          hasLoop = true;
        }
      }
    });
    
    return { redirectCount, hasLoop };
  } catch (error) {
    // If parsing fails, return conservative values
    return { redirectCount: 0, hasLoop: false };
  }
}

/**
 * Tracks a redirect in the history cookie
 */
function trackRedirect(request: NextRequest, response: NextResponse, redirectCount: number): void {
  const from = new URL(request.url).pathname;
  const to = response.headers.get('Location')?.split('?')[0] || '';
  
  try {
    // Get existing history
    let history: any[] = [];
    
    const historyCookie = request.cookies.get(MIDDLEWARE_CONFIG.COOKIES.REDIRECT_HISTORY);
    if (historyCookie?.value) {
      history = JSON.parse(decodeURIComponent(historyCookie.value));
    }
    
    // Add new entry
    history.push({
      from,
      to,
      timestamp: Date.now()
    });
    
    // Limit history size
    if (history.length > 5) {
      history = history.slice(-5);
    }
    
    // Save updated history
    response.cookies.set(
      MIDDLEWARE_CONFIG.COOKIES.REDIRECT_HISTORY,
      encodeURIComponent(JSON.stringify(history)),
      {
        maxAge: MIDDLEWARE_CONFIG.SAFETY.COOKIE_EXPIRY,
        path: '/',
        httpOnly: true,
        sameSite: 'lax', // For Safari compatibility
        secure: request.url.startsWith('https://')
      }
    );
  } catch (error) {
    console.error('Failed to track redirect:', error);
  }
}

/**
 * Clears all redirect-related cookies
 */
function clearRedirectCookies(response: NextResponse): void {
  // Clear redirect history cookie
  response.cookies.delete(MIDDLEWARE_CONFIG.COOKIES.REDIRECT_HISTORY);
  
  // Clear just-redirected cookie
  response.cookies.delete(MIDDLEWARE_CONFIG.COOKIES.JUST_REDIRECTED);
} 