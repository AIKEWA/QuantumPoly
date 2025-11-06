/**
 * @fileoverview Authentication Validator for Block 9.9
 * @module lib/audit/auth-validator
 * @see BLOCK9.9_FINAL_AUDIT_AND_HANDOFF.md
 *
 * Helper functions for API key verification
 */

/**
 * Validate API key against environment variable
 */
export function validateApiKey(providedKey: string | null | undefined): boolean {
  const validKey = process.env.REVIEW_DASHBOARD_API_KEY;

  if (!validKey) {
    console.warn('REVIEW_DASHBOARD_API_KEY not configured');
    return false;
  }

  if (!providedKey) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  return constantTimeCompare(providedKey, validKey);
}

/**
 * Constant-time string comparison
 * Prevents timing attacks by ensuring comparison takes same time regardless of where strings differ
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Extract API key from Authorization header
 * Supports: "Bearer <key>" or "<key>"
 */
export function extractApiKey(authHeader: string | null | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  // Remove "Bearer " prefix if present
  const key = authHeader.replace(/^Bearer\s+/i, '').trim();

  return key || null;
}

/**
 * Validate request has valid authentication
 */
export function isAuthenticated(request: Request): boolean {
  const authHeader = request.headers.get('Authorization');
  const apiKey = extractApiKey(authHeader);
  return validateApiKey(apiKey);
}

/**
 * Create 401 Unauthorized response
 */
export function createUnauthorizedResponse(message: string = 'Unauthorized'): Response {
  return new Response(
    JSON.stringify({
      error: 'Unauthorized',
      message,
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

/**
 * Check if API key is configured
 */
export function isApiKeyConfigured(): boolean {
  return !!process.env.REVIEW_DASHBOARD_API_KEY;
}

