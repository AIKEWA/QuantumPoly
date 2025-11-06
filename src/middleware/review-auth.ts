/**
 * @fileoverview Review Dashboard Authentication Middleware
 * @module middleware/review-auth
 * @see BLOCK9.9_FINAL_AUDIT_AND_HANDOFF.md
 *
 * API key validation middleware for review dashboard and audit APIs
 */

import { NextRequest, NextResponse } from 'next/server';

import { validateApiKey, extractApiKey } from '@/lib/audit/auth-validator';

/**
 * Protected routes requiring authentication
 */
const PROTECTED_ROUTES = [
  '/api/audit/sign-off', // POST sign-off submission
];

/**
 * Routes that should check auth but allow access without it
 * (for displaying auth UI)
 */
const CONDITIONAL_ROUTES = [
  '/governance/review', // Review dashboard (all locales)
];

/**
 * Check if route requires authentication
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if route is conditional (shows auth UI)
 */
function isConditionalRoute(pathname: string): boolean {
  return CONDITIONAL_ROUTES.some((route) => pathname.includes(route));
}

/**
 * Review authentication middleware
 */
export function reviewAuthMiddleware(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  // Skip non-protected routes
  if (!isProtectedRoute(pathname) && !isConditionalRoute(pathname)) {
    return null;
  }

  // Extract and validate API key
  const authHeader = request.headers.get('Authorization');
  const apiKey = extractApiKey(authHeader);
  const isValid = validateApiKey(apiKey);

  // For protected API routes, enforce authentication
  if (isProtectedRoute(pathname)) {
    if (!isValid) {
      return new NextResponse(
        JSON.stringify({
          error: 'Unauthorized',
          message: 'Valid API key required for audit sign-off submission',
          documentation: '/governance/review',
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'WWW-Authenticate': 'Bearer realm="Review Dashboard", charset="UTF-8"',
          },
        }
      );
    }
  }

  // For conditional routes (dashboard), allow access but pass auth status
  if (isConditionalRoute(pathname)) {
    const response = NextResponse.next();
    response.headers.set('X-Review-Auth-Status', isValid ? 'authenticated' : 'unauthenticated');
    return response;
  }

  return null;
}

