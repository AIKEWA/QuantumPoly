/**
 * Browser Compatibility Module
 * 
 * Handles browser-specific quirks and compatibility issues,
 * particularly focusing on Safari-related redirect challenges.
 */

import { NextRequest } from 'next/server';
import { logDebug } from '../../utils/debugLogging';

/**
 * Detects if the request is coming from Safari
 */
export function detectSafari(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || '';
  const isSafari = userAgent.includes('Safari') && !userAgent.includes('Chrome');
  
  logDebug('browserCompat', `Browser detection - isSafari: ${isSafari}`, {
    userAgent: userAgent.substring(0, 100) // Truncate long user agents
  });
  
  return isSafari;
}

/**
 * Handles Safari-specific cookie settings
 * Safari has stricter cookie handling, so we need specific options
 */
export function getSafariCookieOptions(
  request: NextRequest,
  maxAge: number
): { 
  maxAge: number;
  path: string;
  httpOnly: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  secure: boolean;
} {
  return {
    maxAge,
    path: '/',
    httpOnly: true,
    sameSite: 'lax', // Changed from 'strict' to improve Safari compatibility
    secure: request.url.startsWith('https://') // Only set secure flag on HTTPS
  };
}

/**
 * Determines if we need to handle any browser-specific workarounds
 * for this request
 */
export function needsBrowserWorkaround(request: NextRequest): {
  needsWorkaround: boolean;
  browserInfo: {
    isSafari: boolean;
    userAgent: string;
  };
} {
  const userAgent = request.headers.get('user-agent') || '';
  const isSafari = detectSafari(request);
  const searchParams = new URL(request.url).searchParams;
  
  // Check for Safari and if we've already tried to handle it
  const needsWorkaround = isSafari && !searchParams.has('_safari');
  
  return {
    needsWorkaround,
    browserInfo: {
      isSafari,
      userAgent: userAgent.substring(0, 100) // Truncate long user agents
    }
  };
}

/**
 * Checks if a path should be excluded from browser-specific handling
 */
export function shouldExcludeFromBrowserCompat(pathname: string): boolean {
  // Early exit: API routes and static files should not have browser-specific handling
  return pathname.startsWith('/api/') || !!pathname.match(/\.\w+$/);
} 