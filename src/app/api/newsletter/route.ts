/**
 * Newsletter Subscription API Route (Block 4.2)
 *
 * POST /api/newsletter
 *
 * Purpose:
 * Provides a robust, i18n-ready endpoint for newsletter subscriptions with Zod validation,
 * duplicate detection, and dual-dimensional rate limiting (per-email + per-IP).
 * Designed for easy migration to Supabase and Redis-backed rate limiting.
 *
 * Features:
 * - Strict schema validation via Zod
 * - In-memory duplicate detection
 * - Dual-dimensional rate limiting (email + IP) with 10s window
 * - i18n message keys (no raw copy in responses)
 * - Proper HTTP semantics (400, 409, 429, 201, 500)
 * - Clear Supabase and Redis migration path markers
 *
 * Architecture Decision:
 * - Using in-memory Maps for prototyping; enables fast iteration
 * - Returns only message keys to keep API locale-agnostic
 * - Normalized emails (trim + lowercase) for consistency
 * - Rate limiting per email AND per IP to prevent abuse
 * - Rate limit checks execute BEFORE business logic to minimize server load
 *
 * @see docs/ADR-006-multi-agent-cognitive-architecture.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Zod schema for newsletter subscription requests
 * Validates that the email field is present and properly formatted
 */
const NewsletterSchema = z.object({
  email: z.string().email(),
});

/**
 * Type inference from Zod schema for type safety
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type NewsletterRequest = z.infer<typeof NewsletterSchema>;

/**
 * Response payload structure
 * Always includes a messageKey for i18n resolution on the client
 * Optionally includes debug info in non-production environments
 */
interface NewsletterResponse {
  messageKey: string;
  debug?: {
    errorCode: string;
    timestamp?: string;
  };
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

/**
 * Rate limiting window in milliseconds
 * Enforces a 10-second cooldown per email and per IP to prevent abuse
 *
 * TODO(rl): For production horizontal scaling, replace in-memory Maps with:
 * - **Redis** (fixed window or sliding window counter)
 * - **rate-limiter-flexible** library for advanced token bucket/leaky bucket
 * - **Upstash Redis** for serverless/edge-friendly distributed rate limiting
 * - Coordinate limits across all instances to avoid per-instance drift
 */
const RATE_LIMIT_WINDOW_MS = 10_000; // 10 seconds

// ============================================================================
// IN-MEMORY STORAGE (DEV/PROTOTYPE ONLY)
// ============================================================================

/**
 * In-memory subscriber storage
 * Key: normalized email (lowercase, trimmed)
 * Value: timestamp (epoch ms) of subscription
 *
 * TODO(supabase): Replace this Map with Supabase client:
 * - Create `newsletter_subscriptions` table with columns:
 *   - id (uuid, primary key)
 *   - email (text, unique constraint)
 *   - subscribed_at (timestamptz, default now())
 *   - ip_address (text, optional for enhanced tracking)
 * - Use Supabase insert/select operations
 * - Add indexes on email for fast lookups
 */
const subscribers = new Map<string, number>();

/**
 * Force error flag for testing error handling paths
 * Only available in test/development environments
 * When true, POST handler will throw an error to trigger 500 response
 */
let FORCE_ERROR = false;

/**
 * Rate limiting store: per-email timestamps
 * Key: normalized email
 * Value: timestamp (epoch ms) of last request
 *
 * TODO(rl): Replace with Redis key-value store:
 * - Use Redis SET with EX (expiration) for automatic cleanup
 * - Example: SET rate:email:{hash} {timestamp} EX 10
 * - Consider INCR + TTL for sliding window counters
 * - Hash emails before storing for privacy (SHA-256 or similar)
 *
 * CONCURRENCY NOTE: Single-threaded Node.js execution is safe for dev.
 * In serverless/multi-instance production, per-instance Maps lead to
 * inconsistent limits across instances. Redis provides shared state.
 */
const emailLastSeen = new Map<string, number>();

/**
 * Rate limiting store: per-IP timestamps
 * Key: client IP address
 * Value: timestamp (epoch ms) of last request
 *
 * TODO(rl): Replace with Redis key-value store:
 * - Use Redis SET with EX for automatic cleanup
 * - Example: SET rate:ip:{ip} {timestamp} EX 10
 * - Implement composite keys (email+IP) for stricter controls
 * - Add per-IP bucket limits (e.g., max 10 different emails per IP per hour)
 *
 * SECURITY NOTE: IP addresses can be spoofed behind proxies.
 * - Validate x-forwarded-for headers only from trusted reverse proxies
 * - Use Vercel/Cloudflare platform headers when available
 * - Consider adding CAPTCHA for repeated violations
 * - Avoid logging raw IPs in production; hash or redact for GDPR compliance
 */
const ipLastSeen = new Map<string, number>();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalizes email addresses for consistent storage and comparison
 * @param email - Raw email input
 * @returns Normalized email (trimmed and lowercase)
 */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Extracts client IP address from request headers
 * Prioritizes proxy headers in reverse-proxy environments (Vercel, Cloudflare, etc.)
 *
 * @param request - Next.js request object
 * @returns IP address string or 'unknown' if unavailable
 *
 * SECURITY CONSIDERATIONS:
 * - x-forwarded-for can be spoofed by clients if not validated by a trusted reverse proxy
 * - Only use this in production behind Vercel/Cloudflare where headers are sanitized
 * - For enhanced security, validate that request originates from trusted proxy IPs
 * - Consider implementing IP allowlist/blocklist for known abusers
 *
 * TODO(rl): Extract this to a shared utility module:
 * - Create src/lib/ip-utils.ts for reusable IP extraction
 * - Add runtime detection (Vercel vs Node.js standalone vs Edge)
 * - Support platform-specific headers (e.g., CF-Connecting-IP for Cloudflare)
 * - Add IP validation and CIDR range checks
 */
function getClientIp(request: NextRequest): string {
  // Priority 1: x-forwarded-for (first IP in chain is original client)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take first IP in comma-separated list (original client)
    const firstIp = forwardedFor.split(',')[0].trim();
    if (firstIp) {
      return firstIp;
    }
  }

  // Priority 2: x-real-ip (alternative single-IP header)
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Priority 3: Vercel-specific headers
  const vercelIp = request.headers.get('x-vercel-forwarded-for');
  if (vercelIp) {
    return vercelIp.split(',')[0].trim();
  }

  // Fallback: Mark as unknown (should rarely happen in production)
  // In local development, this is expected behavior
  return 'unknown';
}

/**
 * Checks if a key (email or IP) is within the rate limit window
 * Generic function that works with both emailLastSeen and ipLastSeen maps
 *
 * @param keyMap - Map storing timestamps for rate limit keys
 * @param key - The key to check (email or IP)
 * @param now - Current timestamp (defaults to Date.now(), injectable for testing)
 * @returns Object with { limited: boolean, retryAfterSeconds: number }
 *
 * TODO(rl): Replace with Redis-based implementation:
 * - Use Redis GET to retrieve last timestamp
 * - Use Redis SETNX + EXPIRE for atomic set-if-not-exists with TTL
 * - Consider INCR-based sliding window for smoother fairness:
 *   - Store request count instead of timestamp
 *   - Allow N requests per window with gradual cooldown
 */
function checkRateLimit(
  keyMap: Map<string, number>,
  key: string,
  now: number = Date.now(),
): { limited: boolean; retryAfterSeconds: number } {
  const lastSeen = keyMap.get(key);

  if (!lastSeen) {
    // No prior request from this key
    return { limited: false, retryAfterSeconds: 0 };
  }

  const timeSinceLast = now - lastSeen;

  if (timeSinceLast < RATE_LIMIT_WINDOW_MS) {
    // Still within rate limit window
    const remainingMs = RATE_LIMIT_WINDOW_MS - timeSinceLast;
    const retryAfterSeconds = Math.ceil(remainingMs / 1000);
    return { limited: true, retryAfterSeconds };
  }

  // Window expired, allow request
  return { limited: false, retryAfterSeconds: 0 };
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

/**
 * POST /api/newsletter
 *
 * Handles newsletter subscription requests with dual-dimensional rate limiting
 *
 * Request body:
 * { "email": "user@example.com" }
 *
 * Response scenarios (in check order):
 * - 400: Invalid JSON or email format → newsletter.invalidEmail
 * - 429: Rate limit exceeded (email OR IP) → newsletter.rateLimitExceeded
 * - 409: Already subscribed (outside rate window) → newsletter.alreadySubscribed
 * - 201: Successfully subscribed → newsletter.success
 * - 500: Unexpected server error → newsletter.serverError
 *
 * All responses include { messageKey: string } for i18n resolution
 *
 * Rate Limiting Strategy:
 * - Checked BEFORE business logic to minimize server load under attack
 * - Both email AND IP must be outside their respective windows
 * - Returns Retry-After header with seconds until window expires
 *
 * TODO(rl): For production, consider additional strategies:
 * - Token bucket algorithm for smoother UX (burst allowance)
 * - Progressive penalties for repeat offenders (exponential backoff)
 * - CAPTCHA challenge after N violations
 * - Allowlist for verified partners/integrations
 */
export async function POST(request: NextRequest): Promise<NextResponse<NewsletterResponse>> {
  try {
    // ========================================================================
    // TEST MODE: Force error if flag is set (for testing 500 responses)
    // ========================================================================
    if (FORCE_ERROR) {
      throw new Error('Forced error for testing');
    }

    const now = Date.now(); // Capture once for consistency across checks

    // ========================================================================
    // STEP 1: Parse and validate request body
    // ========================================================================
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      // Invalid JSON payload
      return NextResponse.json<NewsletterResponse>(
        {
          messageKey: 'newsletter.invalidEmail',
          ...(process.env.NODE_ENV !== 'production' && {
            debug: {
              errorCode: 'E_INVALID_JSON',
              timestamp: new Date().toISOString(),
            },
          }),
        },
        { status: 400 },
      );
    }

    // ========================================================================
    // STEP 2: Validate with Zod schema
    // ========================================================================
    const validationResult = NewsletterSchema.safeParse(body);
    if (!validationResult.success) {
      // Email validation failed
      return NextResponse.json<NewsletterResponse>(
        {
          messageKey: 'newsletter.invalidEmail',
          ...(process.env.NODE_ENV !== 'production' && {
            debug: {
              errorCode: 'E_INVALID_EMAIL',
              timestamp: new Date().toISOString(),
            },
          }),
        },
        { status: 400 },
      );
    }

    const { email: rawEmail } = validationResult.data;

    // ========================================================================
    // STEP 3: Derive rate limit keys (email + IP)
    // ========================================================================
    const emailKey = normalizeEmail(rawEmail);
    const ipKey = getClientIp(request);

    // ========================================================================
    // STEP 4: Rate limit checks (BEFORE business logic)
    // ========================================================================
    // Priority: Check email first (more specific), then IP (broader)
    // This ordering minimizes false positives from shared IPs (NAT, corporate)

    // Check email rate limit
    const emailRateLimit = checkRateLimit(emailLastSeen, emailKey, now);
    if (emailRateLimit.limited) {
      return NextResponse.json<NewsletterResponse>(
        {
          messageKey: 'newsletter.rateLimitExceeded',
          ...(process.env.NODE_ENV !== 'production' && {
            debug: {
              errorCode: 'E_RATE_LIMITED_EMAIL',
              timestamp: new Date().toISOString(),
            },
          }),
        },
        {
          status: 429,
          headers: {
            'Retry-After': emailRateLimit.retryAfterSeconds.toString(),
            // Optional: Observability headers (dev only)
            ...(process.env.NODE_ENV !== 'production' && {
              'X-RateLimit-Scope': 'email',
              'X-RateLimit-Window': (RATE_LIMIT_WINDOW_MS / 1000).toString(),
            }),
          },
        },
      );
    }

    // Check IP rate limit
    const ipRateLimit = checkRateLimit(ipLastSeen, ipKey, now);
    if (ipRateLimit.limited) {
      return NextResponse.json<NewsletterResponse>(
        {
          messageKey: 'newsletter.rateLimitExceeded',
          ...(process.env.NODE_ENV !== 'production' && {
            debug: {
              errorCode: 'E_RATE_LIMITED_IP',
              timestamp: new Date().toISOString(),
            },
          }),
        },
        {
          status: 429,
          headers: {
            'Retry-After': ipRateLimit.retryAfterSeconds.toString(),
            // Optional: Observability headers (dev only)
            ...(process.env.NODE_ENV !== 'production' && {
              'X-RateLimit-Scope': 'ip',
              'X-RateLimit-Window': (RATE_LIMIT_WINDOW_MS / 1000).toString(),
            }),
          },
        },
      );
    }

    // ========================================================================
    // STEP 5: Check for duplicate subscription (outside rate limit window)
    // ========================================================================
    const alreadyExists = subscribers.has(emailKey);

    // TODO(supabase): Replace duplicate check with Supabase query:
    // const { data: existing } = await supabase
    //   .from('newsletter_subscriptions')
    //   .select('email')
    //   .eq('email', emailKey)
    //   .maybeSingle();
    // if (existing) {
    //   // Update rate limit timestamps even on duplicate
    //   emailLastSeen.set(emailKey, now);
    //   ipLastSeen.set(ipKey, now);
    //   return 409...
    // }

    if (alreadyExists) {
      // Email already subscribed (but outside rate limit window)
      // Update rate limit timestamps to prevent rapid resubmission attempts
      emailLastSeen.set(emailKey, now);
      ipLastSeen.set(ipKey, now);

      return NextResponse.json<NewsletterResponse>(
        {
          messageKey: 'newsletter.alreadySubscribed',
          ...(process.env.NODE_ENV !== 'production' && {
            debug: {
              errorCode: 'E_ALREADY_SUBSCRIBED',
              timestamp: new Date().toISOString(),
            },
          }),
        },
        { status: 409 },
      );
    }

    // ========================================================================
    // STEP 6: Success - Store subscription and update rate limits
    // ========================================================================
    subscribers.set(emailKey, now);
    emailLastSeen.set(emailKey, now);
    ipLastSeen.set(ipKey, now);

    // TODO(supabase): Replace Map insert with Supabase insert:
    // const { error } = await supabase
    //   .from('newsletter_subscriptions')
    //   .insert({
    //     email: emailKey,
    //     ip_address: ipKey, // Optional: store for analytics/abuse detection
    //     subscribed_at: new Date().toISOString(),
    //   });
    //
    // if (error) {
    //   // Map Postgres error codes to HTTP responses:
    //   // - 23505 (unique_violation) → 409 alreadySubscribed
    //   // - Connection errors, timeouts → 500 serverError
    //   if (error.code === '23505') {
    //     emailLastSeen.set(emailKey, now);
    //     ipLastSeen.set(ipKey, now);
    //     return NextResponse.json({ messageKey: 'newsletter.alreadySubscribed' }, { status: 409 });
    //   }
    //   throw error; // Let catch block handle as 500
    // }
    //
    // // Update rate limits after successful DB insert
    // emailLastSeen.set(emailKey, now);
    // ipLastSeen.set(ipKey, now);

    return NextResponse.json<NewsletterResponse>(
      {
        messageKey: 'newsletter.success',
        ...(process.env.NODE_ENV !== 'production' && {
          debug: {
            errorCode: 'SUCCESS',
            timestamp: new Date().toISOString(),
          },
        }),
      },
      { status: 201 },
    );
  } catch (error) {
    // ========================================================================
    // STEP 7: Handle unexpected errors
    // ========================================================================
    // Log server-side for monitoring/debugging
    console.error('[Newsletter API] Unexpected error:', error);

    // TODO(supabase): Add structured error logging:
    // - Use monitoring service (Sentry, LogRocket, DataDog, etc.)
    // - Include request context (IP, user agent, timestamp)
    // - Redact sensitive data (email, IP) per GDPR requirements
    // - Alert on error rate thresholds (> 5% error rate)

    return NextResponse.json<NewsletterResponse>(
      {
        messageKey: 'newsletter.serverError',
        ...(process.env.NODE_ENV !== 'production' && {
          debug: {
            errorCode: 'E_INTERNAL_SERVER_ERROR',
            timestamp: new Date().toISOString(),
          },
        }),
      },
      { status: 500 },
    );
  }
}

/**
 * Additional HTTP methods return 405 Method Not Allowed
 * Only POST is supported for newsletter subscriptions
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    {
      status: 405,
      headers: { Allow: 'POST' },
    },
  );
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    {
      status: 405,
      headers: { Allow: 'POST' },
    },
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    {
      status: 405,
      headers: { Allow: 'POST' },
    },
  );
}

export async function PATCH(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    {
      status: 405,
      headers: { Allow: 'POST' },
    },
  );
}

// ============================================================================
// TEST UTILITIES (DEV/TEST ONLY)
// ============================================================================

/**
 * Test utilities for resetting state and simulating errors
 * Only exported in non-production environments
 * Used by integration tests to ensure clean state between test runs
 *
 * Usage in tests:
 * ```ts
 * import { POST, __test__ } from '@/app/api/newsletter/route';
 *
 * beforeEach(() => {
 *   __test__.resetStores();
 * });
 *
 * it('handles server errors', async () => {
 *   __test__.setForceError(true);
 *   const res = await POST(request);
 *   expect(res.status).toBe(500);
 *   __test__.setForceError(false);
 * });
 * ```
 */
// Only export test utilities in non-production builds
// Next.js Route handlers only allow specific exports (GET, POST, etc.)
// Conditional exports prevent build-time type validation errors
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (exports as any).__test__ = {
    /**
     * Resets all in-memory storage maps
     * Clears subscribers, email rate limits, and IP rate limits
     * Should be called in beforeEach() to ensure test isolation
     */
    resetStores: () => {
      subscribers.clear();
      emailLastSeen.clear();
      ipLastSeen.clear();
    },

    /**
     * Clears only rate limit stores (keeps subscribers)
     * Useful for testing duplicate subscription logic outside rate limit window
     */
    clearRateLimits: () => {
      emailLastSeen.clear();
      ipLastSeen.clear();
    },

    /**
     * Controls forced error state for testing 500 responses
     * When enabled, POST handler will throw an error immediately
     * @param value - true to force errors, false to disable
     */
    setForceError: (value: boolean) => {
      FORCE_ERROR = value;
    },

    /**
     * Gets current subscriber count (for test assertions)
     * @returns Number of subscribed emails
     */
    getSubscriberCount: () => subscribers.size,

    /**
     * Checks if an email is subscribed (for test assertions)
     * @param email - Email to check
     * @returns true if email is subscribed
     */
    isSubscribed: (email: string) => subscribers.has(normalizeEmail(email)),
  };
}
