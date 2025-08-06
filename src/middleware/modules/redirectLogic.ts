/**
 * Redirect Logic Module
 * 
 * Responsible for managing redirects, detecting loops, and handling
 * redirect-related middleware behavior.
 */

import { NextRequest, NextResponse } from 'next/server';
import { MIDDLEWARE_CONFIG } from '../config';
import { logDebug } from '../../utils/debugLogging';
import { 
  trackRedirect,
  detectRedirectLoop,
  clearRedirectHistory,
  getRedirectHistory
} from '../../utils/redirectTracker';

// Shorthand access to config values
const { COOKIES, SAFETY, PARAMS, IS_DEV } = MIDDLEWARE_CONFIG;

/**
 * Checks if we should bypass redirect due to protection mechanisms
 * Returns true if we should skip redirection
 */
export function shouldSkipRedirect(request: NextRequest): boolean {
  const searchParams = new URL(request.url).searchParams;
  
  // Check if noRedirect flag is present in query parameters
  if (searchParams.has(PARAMS.NO_REDIRECT)) {
    logDebug('redirectLogic', `Skip redirect due to ${PARAMS.NO_REDIRECT} flag`);
    return true;
  }
  
  // Check if we just redirected to prevent immediate redirect cycles
  // This cookie acts as a throttle/cooldown mechanism
  const justRedirected = request.cookies.has(COOKIES.JUST_REDIRECTED);
  if (justRedirected) {
    logDebug('redirectLogic', `Detected recent redirect (just-redirected cookie), skipping further redirects`);
    return true;
  }
  
  return false;
}

/**
 * Sets the "just redirected" cookie to prevent immediate redirect loops
 */
export function setJustRedirectedCookie(
  response: NextResponse, 
  request: NextRequest, 
  pathname: string
): void {
  // For root path, use a shorter expiration to prevent blocking future redirects
  const cookieMaxAge = pathname === '/' ? 2 : 5;  // 2 seconds for root path, 5 for others
  
  response.cookies.set(COOKIES.JUST_REDIRECTED, '1', {
    maxAge: cookieMaxAge,
    path: '/',
    httpOnly: true,
    sameSite: 'lax', // Better Safari compatibility
    secure: request.url.startsWith('https://') // Only set secure flag on HTTPS
  });
}

/**
 * Handles the case where we need to protect against redirect loops
 * by forcing a redirect to the default locale with noRedirect parameter
 */
export function createProtectionRedirect(
  request: NextRequest, 
  loopInfo: ReturnType<typeof detectRedirectLoop>,
  isSafari: boolean
): NextResponse {
  const { pathname, search } = new URL(request.url);
  const { DEFAULT_LOCALE } = MIDDLEWARE_CONFIG;
  
  // Determine reason for protection redirect
  const isRaceCondition = !!(loopInfo.timeSinceFirstRedirect && 
    loopInfo.timeSinceFirstRedirect > SAFETY.REDIRECT_RACE_TIMEOUT_MS &&
    loopInfo.redirectCount >= 2);
  
  const reason = loopInfo.hasLoop ? 'Redirect loop detected' : 
                isRaceCondition ? 'Browser race condition detected' : 
                'Too many redirects';
  
  logDebug('redirectLogic', `${reason}, forcing default locale: ${DEFAULT_LOCALE}`);
  
  const newPathname = pathname === '/' ? '' : pathname;
  // Add noRedirect parameter to break potential loops
  const redirectTarget = `/${DEFAULT_LOCALE}${newPathname}`;
  const targetUrl = new URL(`${redirectTarget}${search || ''}`, request.url);
  targetUrl.searchParams.set(PARAMS.NO_REDIRECT, '1');
  
  // Add Safari specific debug info
  if (isSafari) {
    targetUrl.searchParams.set(PARAMS.SAFARI_BYPASS, '1');
  }
  
  // Use 302 Found for better cookie handling
  const response = NextResponse.redirect(targetUrl, { status: 302 });
  
  // Clear the redirect history
  clearRedirectHistory(response);
  
  // Add headers for debugging
  response.headers.set('X-Redirect-Debug', `fallback-redirect:${reason}`);
  response.headers.set('X-Redirect-Count', loopInfo.redirectCount.toString());
  
  // Set the just-redirected cookie
  setJustRedirectedCookie(response, request, pathname);
  
  // Track this final redirect
  const reasonSlug = reason.toLowerCase().replace(/\s+/g, '-');
  trackRedirect(request, response, redirectTarget, `protection-${reasonSlug}`);
  
  return response;
}

/**
 * Checks if a redirect might cause a loop or race condition
 * Returns information about the loop state
 */
export function checkRedirectSafety(request: NextRequest): {
  isSafe: boolean;
  loopInfo: ReturnType<typeof detectRedirectLoop>;
  isRaceCondition: boolean;
} {
  const loopInfo = detectRedirectLoop(request);
  logDebug('redirectLogic', `Redirect loop check: ${JSON.stringify(loopInfo)}`);
  
  // Race condition check - if we've been redirecting for over 1.5 seconds,
  // treat it as a potential browser race issue
  const isRaceCondition = !!(loopInfo.timeSinceFirstRedirect && 
    loopInfo.timeSinceFirstRedirect > SAFETY.REDIRECT_RACE_TIMEOUT_MS &&
    loopInfo.redirectCount >= 2);
  
  // Is it safe to redirect?
  const isSafe = !loopInfo.hasLoop && 
    loopInfo.redirectCount < SAFETY.MAX_REDIRECTS && 
    !isRaceCondition;
  
  return { isSafe, loopInfo, isRaceCondition };
} 