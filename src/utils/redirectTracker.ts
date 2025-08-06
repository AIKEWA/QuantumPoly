/**
 * Redirect Tracker Utility
 * 
 * This utility provides enhanced tracking and diagnostics for redirects in
 * Next.js middleware, helping to identify and debug redirect loops.
 */

import { NextRequest, NextResponse } from 'next/server';
import { logDebug } from './debugLogging';

// Constants
const REDIRECT_HISTORY_COOKIE = 'redirect-history';
const COOKIE_EXPIRY = 60; // 1 minute expiry
const MAX_HISTORY_ENTRIES = 5;

type RedirectEntry = {
  from: string;
  to: string;
  timestamp: number;
  reason: string;
};

/**
 * Tracks a redirect by recording it in a cookie-based history
 */
export function trackRedirect(
  request: NextRequest,
  response: NextResponse,
  toPath: string,
  reason: string
): NextResponse {
  // Get the actual pathname that client requested, not nextUrl.pathname
  const actualUrl = new URL(request.url);
  const from = actualUrl.pathname;
  const to = toPath;
  const timestamp = Date.now();
  
  // Get existing redirect history
  let redirectHistory: RedirectEntry[] = [];
  try {
    const historyCookie = request.cookies.get(REDIRECT_HISTORY_COOKIE);
    if (historyCookie?.value) {
      redirectHistory = JSON.parse(decodeURIComponent(historyCookie.value));
    }
  } catch (e) {
    // If parsing fails, start with empty history
    redirectHistory = [];
  }
  
  // Add new entry
  redirectHistory.push({
    from,
    to,
    timestamp,
    reason
  });
  
  // Limit history to last MAX_HISTORY_ENTRIES entries to keep cookie size reasonable
  if (redirectHistory.length > MAX_HISTORY_ENTRIES) {
    redirectHistory = redirectHistory.slice(-MAX_HISTORY_ENTRIES);
  }
  
  // Safari compatibility: Handle cookie options for better browser compatibility
  const isSecure = request.url.startsWith('https://');
  
  // Save updated history - use encode/decode to handle special characters
  const historyJson = JSON.stringify(redirectHistory);
  response.cookies.set(REDIRECT_HISTORY_COOKIE, encodeURIComponent(historyJson), {
    maxAge: COOKIE_EXPIRY,
    path: '/',
    httpOnly: true,
    sameSite: 'lax', // Changed from 'strict' for Safari compatibility
    secure: isSecure // Only set secure flag on HTTPS
  });
  
  // Also set the data as a response header for debugging
  response.headers.set('X-Redirect-History', encodeURIComponent(JSON.stringify({
    count: redirectHistory.length,
    latest: { from, to, reason }
  })));
  
  // Log the redirect
  logDebug('redirect-tracker', `Redirect: ${from} → ${to} (${reason})`, {
    history: redirectHistory
  });
  
  return response;
}

/**
 * Detects potential redirect loops based on the redirect history
 */
export function detectRedirectLoop(request: NextRequest): {
  hasLoop: boolean;
  loopPath?: string;
  redirectCount: number;
  loopPattern?: string;
  timeSinceFirstRedirect?: number;
} {
  // Get redirect history
  let redirectHistory: RedirectEntry[] = [];
  try {
    const historyCookie = request.cookies.get(REDIRECT_HISTORY_COOKIE);
    if (historyCookie?.value) {
      redirectHistory = JSON.parse(decodeURIComponent(historyCookie.value));
    }
  } catch (e) {
    // If parsing fails, return no loop
    return { hasLoop: false, redirectCount: 0 };
  }
  
  // Count redirects
  const redirectCount = redirectHistory.length;
  
  // No redirects yet
  if (redirectCount === 0) {
    return { hasLoop: false, redirectCount: 0 };
  }
  
  // Calculate time since first redirect for timing analysis
  const now = Date.now();
  const firstRedirectTime = redirectHistory[0]?.timestamp || now;
  const timeSinceFirstRedirect = now - firstRedirectTime;
  
  // Check for loops (same path visited twice)
  const pathCounts = new Map<string, number>();
  redirectHistory.forEach(entry => {
    const count = pathCounts.get(entry.from) || 0;
    pathCounts.set(entry.from, count + 1);
  });
  
  // Find any path visited more than once
  let loopPath: string | undefined;
  let hasLoop = false;
  
  // Use Array.from to convert Map entries to an array for compatibility
  Array.from(pathCounts.entries()).forEach(([path, count]) => {
    if (count > 1) {
      hasLoop = true;
      loopPath = path;
    }
  });
  
  // Look for A->B->A pattern (ping-pong redirects)
  let loopPattern: string | undefined;
  if (redirectHistory.length >= 3) {
    for (let i = 0; i < redirectHistory.length - 2; i++) {
      if (redirectHistory[i].from === redirectHistory[i+2].from) {
        hasLoop = true;
        loopPattern = `${redirectHistory[i].from}->${redirectHistory[i+1].from}->${redirectHistory[i+2].from}`;
        break;
      }
    }
  }
  
  return {
    hasLoop,
    loopPath,
    redirectCount,
    loopPattern,
    timeSinceFirstRedirect
  };
}

/**
 * Clears the redirect history
 */
export function clearRedirectHistory(response: NextResponse): NextResponse {
  // Using both approaches for maximum browser compatibility:
  // 1. Clear by setting empty value with maxAge=0
  response.cookies.set(REDIRECT_HISTORY_COOKIE, '', {
    maxAge: 0,
    path: '/',
    httpOnly: true,
    sameSite: 'lax', // Using lax for Safari compatibility
  });
  
  // 2. Explicitly delete the cookie
  response.cookies.delete(REDIRECT_HISTORY_COOKIE);
  
  // 3. Also use the Set-Cookie header directly as a backup method
  // Some browsers handle cookie clearing differently
  const newCookieHeader = `${REDIRECT_HISTORY_COOKIE}=; Path=/; Max-Age=0; HttpOnly`;
  response.headers.append('Set-Cookie', newCookieHeader);
  
  return response;
}

/**
 * Gets the current redirect history from cookies
 */
export function getRedirectHistory(request: NextRequest): RedirectEntry[] | undefined {
  try {
    const historyCookie = request.cookies.get(REDIRECT_HISTORY_COOKIE);
    if (historyCookie?.value) {
      return JSON.parse(decodeURIComponent(historyCookie.value));
    }
  } catch (e) {
    console.error('Failed to parse redirect history cookie:', e);
  }
  return undefined;
} 