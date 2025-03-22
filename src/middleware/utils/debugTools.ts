/**
 * Debug Tools Module
 * 
 * Provides utilities for debugging middleware behavior,
 * including overlay injection and request analysis.
 */

import { NextRequest, NextResponse } from 'next/server';
import { injectDebugInfo } from '../../utils/middlewareDebugOverlay';
import { getRedirectHistory } from '../../utils/redirectTracker';
import { MIDDLEWARE_CONFIG } from '../config';

/**
 * Enhances a response with debug information in development mode
 */
export function addDebugInfo(
  request: NextRequest, 
  response: NextResponse, 
  info: {
    detectedLocale: string;
    redirectCount: number;
    redirectReason: string;
    redirectTarget?: string;
    processingTime?: number;
    loopDetected?: boolean;
    isRaceCondition?: boolean;
    isSafari?: boolean;
  }
): NextResponse {
  if (!MIDDLEWARE_CONFIG.IS_DEV) {
    return response;
  }
  
  // Get redirect history
  const redirectHistory = getRedirectHistory(request);
  
  // Add debug overlay and return the enhanced response
  return injectDebugInfo(request, response, {
    ...info,
    redirectHistory,
  });
}

/**
 * Creates a request summary for debugging
 */
export function createRequestSummary(request: NextRequest): Record<string, any> {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  
  return {
    url: request.url,
    pathname: url.pathname,
    search: url.search,
    cookies: Object.fromEntries(
      request.cookies.getAll().map(cookie => [cookie.name, cookie.value])
    ),
    searchParams: Object.fromEntries(url.searchParams.entries()),
    userAgent: userAgent.substring(0, 100), // Truncate long user agents
    method: request.method,
    headers: Object.fromEntries(
      Array.from(request.headers.entries())
        .filter(([key]) => !['cookie', 'authorization'].includes(key.toLowerCase()))
    ),
  };
} 