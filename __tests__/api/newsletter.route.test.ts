/**
 * @fileoverview Newsletter API Route Integration Tests (Block 4.4)
 *
 * Comprehensive tests for /api/newsletter POST handler with direct handler invocation
 * Validates all response scenarios, rate limiting, and error handling
 *
 * Coverage target: ≥90% (lines, branches, functions, statements)
 *
 * @jest-environment node
 * @see src/app/api/newsletter/route.ts
 */

import { NextRequest } from 'next/server';

import { POST, GET, PUT, DELETE, PATCH, __test__ } from '@/app/api/newsletter/route';

// ============================================================================
// TEST UTILITIES
// ============================================================================

/**
 * Creates a Next.js Request object for testing the newsletter API
 * @param body - Request body (will be JSON.stringified)
 * @param headers - Optional additional headers
 * @returns NextRequest object for testing
 */
function makeRequest(body: unknown, headers?: Record<string, string>): NextRequest {
  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  return new NextRequest('http://localhost:3000/api/newsletter', {
    method: 'POST',
    headers: baseHeaders,
    body: JSON.stringify(body),
  });
}

/**
 * Helper to extract JSON from Response
 */
async function getResponseJson(response: Response) {
  return await response.json();
}

// ============================================================================
// TEST SUITE
// ============================================================================

describe('Newsletter API Route (Block 4.4)', () => {
  // Reset state before each test to ensure isolation
  beforeEach(() => {
    __test__.resetStores();
  });

  // Clean up after each test
  afterEach(() => {
    __test__.setForceError(false);
  });

  // ==========================================================================
  // SUCCESS PATH
  // ==========================================================================

  describe('Success Path (201)', () => {
    it('accepts valid email and returns success messageKey', async () => {
      const response = await POST(makeRequest({ email: 'test@example.com' }));
      const data = await getResponseJson(response);

      expect(response.status).toBe(201);
      expect(data).toEqual(
        expect.objectContaining({
          messageKey: 'newsletter.success',
        }),
      );
      expect(__test__.isSubscribed('test@example.com')).toBe(true);
      expect(__test__.getSubscriberCount()).toBe(1);
    });

    it('normalizes email addresses (lowercase, trim)', async () => {
      // Note: Zod email validator rejects emails with spaces, so we test normalization
      // by using different casing which gets normalized internally
      const response = await POST(makeRequest({ email: 'Test@Example.COM' }));
      const data = await getResponseJson(response);

      expect(response.status).toBe(201);
      expect(data.messageKey).toBe('newsletter.success');
      // Verify it's stored in normalized form (lowercase)
      expect(__test__.isSubscribed('test@example.com')).toBe(true);
      expect(__test__.isSubscribed('Test@Example.COM')).toBe(true); // Also checks normalized lookup
    });

    it('accepts multiple different emails sequentially', async () => {
      const emails = ['user1@example.com', 'user2@example.com', 'user3@example.com'];

      // Use different IPs to avoid rate limiting
      for (let i = 0; i < emails.length; i++) {
        const response = await POST(
          makeRequest({ email: emails[i] }, { 'x-forwarded-for': `192.168.1.${i + 1}` }),
        );
        expect(response.status).toBe(201);
      }

      expect(__test__.getSubscriberCount()).toBe(3);
    });
  });

  // ==========================================================================
  // VALIDATION ERRORS (400)
  // ==========================================================================

  describe('Validation Errors (400)', () => {
    it('rejects invalid JSON payload', async () => {
      const request = new NextRequest('http://localhost:3000/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{invalid-json',
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data.messageKey).toBe('newsletter.invalidEmail');
    });

    it('rejects missing email field', async () => {
      const response = await POST(makeRequest({}));
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data.messageKey).toBe('newsletter.invalidEmail');
    });

    it('rejects invalid email format (no @)', async () => {
      const response = await POST(makeRequest({ email: 'not-an-email' }));
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data.messageKey).toBe('newsletter.invalidEmail');
    });

    it('rejects invalid email format (missing domain)', async () => {
      const response = await POST(makeRequest({ email: 'user@' }));
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data.messageKey).toBe('newsletter.invalidEmail');
    });

    it('rejects invalid email format (missing local part)', async () => {
      const response = await POST(makeRequest({ email: '@example.com' }));
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data.messageKey).toBe('newsletter.invalidEmail');
    });

    it('rejects empty string email', async () => {
      const response = await POST(makeRequest({ email: '' }));
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data.messageKey).toBe('newsletter.invalidEmail');
    });

    it('rejects null email', async () => {
      const response = await POST(makeRequest({ email: null }));
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data.messageKey).toBe('newsletter.invalidEmail');
    });

    it('rejects non-string email', async () => {
      const response = await POST(makeRequest({ email: 12345 }));
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data.messageKey).toBe('newsletter.invalidEmail');
    });
  });

  // ==========================================================================
  // DUPLICATE SUBSCRIPTION (409)
  // ==========================================================================

  describe('Duplicate Subscription (409)', () => {
    it('returns 409 when email is already subscribed (outside rate limit window)', async () => {
      // First subscription - should succeed
      const firstResponse = await POST(makeRequest({ email: 'duplicate@example.com' }));
      expect(firstResponse.status).toBe(201);

      // Clear rate limits to simulate time passing (rate limit window expired)
      // This allows us to test the pure duplicate logic without hitting rate limits
      __test__.clearRateLimits();

      // Second subscription - should return 409 (duplicate, not rate limited)
      const secondResponse = await POST(makeRequest({ email: 'duplicate@example.com' }));
      const secondData = await getResponseJson(secondResponse);

      expect(secondResponse.status).toBe(409);
      expect(secondData.messageKey).toBe('newsletter.alreadySubscribed');
    });

    it('returns 429 when duplicate attempted within rate limit window', async () => {
      // First subscription
      await POST(makeRequest({ email: 'ratelimited-duplicate@example.com' }));

      // Second attempt within window (without clearing rate limits)
      const secondResponse = await POST(
        makeRequest({ email: 'ratelimited-duplicate@example.com' }),
      );
      const secondData = await getResponseJson(secondResponse);

      // Should hit rate limit before duplicate check
      expect(secondResponse.status).toBe(429);
      expect(secondData.messageKey).toBe('newsletter.rateLimitExceeded');
    });

    it('handles normalized duplicate (case insensitive)', async () => {
      // Subscribe with lowercase
      await POST(makeRequest({ email: 'user@example.com' }));

      // Clear rate limits to test duplicate logic
      __test__.clearRateLimits();

      // Try to subscribe with different casing
      const response = await POST(makeRequest({ email: 'USER@EXAMPLE.COM' }));
      const data = await getResponseJson(response);

      // Should detect normalized duplicate
      expect(response.status).toBe(409);
      expect(data.messageKey).toBe('newsletter.alreadySubscribed');
    });
  });

  // ==========================================================================
  // RATE LIMITING (429)
  // ==========================================================================

  describe('Rate Limiting (429)', () => {
    it('rate limits duplicate email within 10s window', async () => {
      const email = 'ratelimit@example.com';

      // First request
      const firstResponse = await POST(makeRequest({ email }));
      expect(firstResponse.status).toBe(201);

      // Second request within window
      const secondResponse = await POST(makeRequest({ email }));
      const data = await getResponseJson(secondResponse);

      expect(secondResponse.status).toBe(429);
      expect(data.messageKey).toBe('newsletter.rateLimitExceeded');

      // Verify Retry-After header is present
      const retryAfter = secondResponse.headers.get('Retry-After');
      expect(retryAfter).toBeTruthy();
      expect(Number.parseInt(retryAfter!, 10)).toBeGreaterThan(0);
      expect(Number.parseInt(retryAfter!, 10)).toBeLessThanOrEqual(10);
    });

    it('rate limits same IP address within 10s window', async () => {
      const headers = { 'x-forwarded-for': '192.168.1.100' };

      // First request from IP
      const firstResponse = await POST(makeRequest({ email: 'user1@example.com' }, headers));
      expect(firstResponse.status).toBe(201);

      // Second request from same IP with different email
      const secondResponse = await POST(makeRequest({ email: 'user2@example.com' }, headers));
      const data = await getResponseJson(secondResponse);

      expect(secondResponse.status).toBe(429);
      expect(data.messageKey).toBe('newsletter.rateLimitExceeded');

      // Verify Retry-After header
      expect(secondResponse.headers.get('Retry-After')).toBeTruthy();
    });

    it('includes Retry-After header with seconds remaining', async () => {
      const email = 'retry@example.com';

      await POST(makeRequest({ email }));
      const response = await POST(makeRequest({ email }));

      const retryAfter = response.headers.get('Retry-After');
      expect(retryAfter).toBeTruthy();

      const seconds = Number.parseInt(retryAfter!, 10);
      expect(seconds).toBeGreaterThan(0);
      expect(seconds).toBeLessThanOrEqual(10);
    });

    it('rate limits check multiple IP header formats', async () => {
      // Test with x-real-ip header
      const headers = { 'x-real-ip': '10.0.0.1' };

      const firstResponse = await POST(makeRequest({ email: 'ip1@example.com' }, headers));
      expect(firstResponse.status).toBe(201);

      const secondResponse = await POST(makeRequest({ email: 'ip2@example.com' }, headers));
      expect(secondResponse.status).toBe(429);
    });

    it('rate limits using Vercel-specific headers', async () => {
      const headers = { 'x-vercel-forwarded-for': '203.0.113.1' };

      const firstResponse = await POST(makeRequest({ email: 'vercel1@example.com' }, headers));
      expect(firstResponse.status).toBe(201);

      const secondResponse = await POST(makeRequest({ email: 'vercel2@example.com' }, headers));
      expect(secondResponse.status).toBe(429);
    });

    it('rate limits when email limit triggers before IP limit', async () => {
      const email = 'email-first@example.com';

      await POST(makeRequest({ email }));
      const response = await POST(makeRequest({ email }));

      expect(response.status).toBe(429);

      // In non-production, check debug headers
      if (process.env.NODE_ENV !== 'production') {
        const scope = response.headers.get('X-RateLimit-Scope');
        expect(scope).toBe('email');
      }
    });
  });

  // ==========================================================================
  // SERVER ERROR (500)
  // ==========================================================================

  describe('Server Error (500)', () => {
    it('returns 500 when forced error is enabled', async () => {
      __test__.setForceError(true);

      const response = await POST(makeRequest({ email: 'error@example.com' }));
      const data = await getResponseJson(response);

      expect(response.status).toBe(500);
      expect(data.messageKey).toBe('newsletter.serverError');
    });

    it('handles unexpected errors gracefully', async () => {
      __test__.setForceError(true);

      const response = await POST(makeRequest({ email: 'crash@example.com' }));
      const data = await getResponseJson(response);

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('messageKey', 'newsletter.serverError');

      // Should not crash the handler
      __test__.setForceError(false);
      const recoveryResponse = await POST(makeRequest({ email: 'recovery@example.com' }));
      expect(recoveryResponse.status).toBe(201);
    });
  });

  // ==========================================================================
  // HTTP METHOD VALIDATION (405)
  // ==========================================================================

  describe('HTTP Method Validation (405)', () => {
    it('returns 405 for GET requests', async () => {
      const response = await GET();

      expect(response.status).toBe(405);
      expect(response.headers.get('Allow')).toBe('POST');

      const data = await getResponseJson(response);
      expect(data).toHaveProperty('error', 'Method not allowed');
    });

    it('returns 405 for PUT requests', async () => {
      const response = await PUT();

      expect(response.status).toBe(405);
      expect(response.headers.get('Allow')).toBe('POST');
    });

    it('returns 405 for DELETE requests', async () => {
      const response = await DELETE();

      expect(response.status).toBe(405);
      expect(response.headers.get('Allow')).toBe('POST');
    });

    it('returns 405 for PATCH requests', async () => {
      const response = await PATCH();

      expect(response.status).toBe(405);
      expect(response.headers.get('Allow')).toBe('POST');
    });
  });

  // ==========================================================================
  // EDGE CASES & INTEGRATION
  // ==========================================================================

  describe('Edge Cases', () => {
    it('handles extremely long email addresses', async () => {
      const longEmail = 'a'.repeat(100) + '@' + 'b'.repeat(100) + '.com';
      const response = await POST(makeRequest({ email: longEmail }));

      // Should either accept or reject based on validation
      expect([201, 400]).toContain(response.status);
    });

    it('handles special characters in email local part', async () => {
      const specialEmail = 'user+tag@example.com';
      const response = await POST(makeRequest({ email: specialEmail }));

      expect(response.status).toBe(201);
      expect(__test__.isSubscribed(specialEmail)).toBe(true);
    });

    it('handles emails with subdomains', async () => {
      const email = 'user@mail.example.com';
      const response = await POST(makeRequest({ email }));

      expect(response.status).toBe(201);
    });

    it('handles Unicode email addresses', async () => {
      const email = 'user@例え.jp';
      const response = await POST(makeRequest({ email }));

      // Zod email validator might reject Unicode domains
      expect([201, 400]).toContain(response.status);
    });

    it('prevents subscriber count from leaking between tests', async () => {
      expect(__test__.getSubscriberCount()).toBe(0);

      await POST(makeRequest({ email: 'isolated@example.com' }));
      expect(__test__.getSubscriberCount()).toBe(1);

      // Reset is handled by beforeEach, but let's verify it works
      __test__.resetStores();
      expect(__test__.getSubscriberCount()).toBe(0);
    });
  });

  // ==========================================================================
  // TEST UTILITIES VALIDATION
  // ==========================================================================

  describe('Test Utilities', () => {
    it('resetStores clears all maps', async () => {
      // Add some data
      await POST(makeRequest({ email: 'test1@example.com' }));
      await POST(makeRequest({ email: 'test2@example.com' }));

      expect(__test__.getSubscriberCount()).toBeGreaterThan(0);

      // Reset
      __test__.resetStores();

      expect(__test__.getSubscriberCount()).toBe(0);

      // Should be able to subscribe again
      const response = await POST(makeRequest({ email: 'test1@example.com' }));
      expect(response.status).toBe(201);
    });

    it('setForceError controls error state', () => {
      expect(__test__.setForceError).toBeDefined();
      expect(__test__.setForceError).toBeInstanceOf(Function);

      // Should not throw
      __test__.setForceError(true);
      __test__.setForceError(false);
    });

    it('getSubscriberCount returns accurate count', async () => {
      expect(__test__.getSubscriberCount()).toBe(0);

      await POST(makeRequest({ email: 'count1@example.com' }, { 'x-forwarded-for': '10.0.0.1' }));
      expect(__test__.getSubscriberCount()).toBe(1);

      await POST(makeRequest({ email: 'count2@example.com' }, { 'x-forwarded-for': '10.0.0.2' }));
      expect(__test__.getSubscriberCount()).toBe(2);
    });

    it('isSubscribed checks email existence', async () => {
      const email = 'check@example.com';

      expect(__test__.isSubscribed(email)).toBe(false);

      await POST(makeRequest({ email }));

      expect(__test__.isSubscribed(email)).toBe(true);
    });
  });

  // ==========================================================================
  // RESPONSE CONTRACT
  // ==========================================================================

  describe('Response Contract', () => {
    it('always includes messageKey in response body', async () => {
      const testCases = [
        { email: 'valid@example.com', expectedStatus: 201 },
        { email: 'invalid', expectedStatus: 400 },
      ];

      for (const { email, expectedStatus } of testCases) {
        __test__.resetStores();
        const response = await POST(makeRequest({ email }));
        const data = await getResponseJson(response);

        expect(response.status).toBe(expectedStatus);
        expect(data).toHaveProperty('messageKey');
        expect(typeof data.messageKey).toBe('string');
        expect(data.messageKey).toMatch(/^newsletter\./);
      }
    });

    it('includes debug info in non-production environments', async () => {
      const originalEnv = process.env.NODE_ENV;

      try {
        process.env.NODE_ENV = 'development';

        const response = await POST(makeRequest({ email: 'debug@example.com' }));
        const data = await getResponseJson(response);

        // In development, debug info may be present
        if (data.debug) {
          expect(data.debug).toHaveProperty('errorCode');
          expect(data.debug).toHaveProperty('timestamp');
        }
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it('returns appropriate Content-Type header', async () => {
      const response = await POST(makeRequest({ email: 'headers@example.com' }));

      const contentType = response.headers.get('Content-Type');
      expect(contentType).toContain('application/json');
    });
  });
});

