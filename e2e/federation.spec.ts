/**
 * @fileoverview Federation E2E Tests
 * @see BLOCK9.6_COLLECTIVE_ETHICS_GRAPH.md
 *
 * Tests federation APIs and verifies no personal data leakage.
 */

import { test, expect } from '@playwright/test';

test.describe('Federation APIs', () => {
  test('GET /api/federation/verify returns partner trust states', async ({ request }) => {
    const response = await request.get('/api/federation/verify');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();

    // Verify response structure
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('total_partners');
    expect(data).toHaveProperty('partners');
    expect(data).toHaveProperty('compliance_baseline');
    expect(data).toHaveProperty('privacy_notice');

    // Verify partners array
    expect(Array.isArray(data.partners)).toBeTruthy();

    if (data.partners.length > 0) {
      const partner = data.partners[0];

      // Verify partner structure
      expect(partner).toHaveProperty('partner_id');
      expect(partner).toHaveProperty('partner_display_name');
      expect(partner).toHaveProperty('last_merkle_root');
      expect(partner).toHaveProperty('last_verified_at');
      expect(partner).toHaveProperty('trust_status');
      expect(partner).toHaveProperty('notes');
      expect(partner).toHaveProperty('governance_endpoint');

      // Verify trust status is valid enum value
      expect(['valid', 'stale', 'flagged', 'error']).toContain(partner.trust_status);

      // Verify no personal data
      expect(partner).not.toHaveProperty('user_id');
      expect(partner).not.toHaveProperty('email');
      expect(partner).not.toHaveProperty('ip_address');
    }

    // Verify compliance baseline
    expect(data.compliance_baseline).toContain('Stage VI');
  });

  test('GET /api/federation/trust returns network summary', async ({ request }) => {
    const response = await request.get('/api/federation/trust');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();

    // Verify response structure
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('total_partners');
    expect(data).toHaveProperty('valid_partners');
    expect(data).toHaveProperty('stale_partners');
    expect(data).toHaveProperty('flagged_partners');
    expect(data).toHaveProperty('error_partners');
    expect(data).toHaveProperty('network_merkle_aggregate');
    expect(data).toHaveProperty('trust_score');
    expect(data).toHaveProperty('health_status');
    expect(data).toHaveProperty('compliance_baseline');

    // Verify numeric values
    expect(typeof data.total_partners).toBe('number');
    expect(typeof data.valid_partners).toBe('number');
    expect(typeof data.stale_partners).toBe('number');
    expect(typeof data.flagged_partners).toBe('number');
    expect(typeof data.error_partners).toBe('number');
    expect(typeof data.trust_score).toBe('number');

    // Verify trust score range
    expect(data.trust_score).toBeGreaterThanOrEqual(0);
    expect(data.trust_score).toBeLessThanOrEqual(100);

    // Verify health status
    expect(['healthy', 'degraded', 'critical']).toContain(data.health_status);

    // Verify no personal data
    expect(data).not.toHaveProperty('user_id');
    expect(data).not.toHaveProperty('email');
    expect(data).not.toHaveProperty('ip_address');
  });

  test('GET /api/federation/record returns this instance FederationRecord', async ({ request }) => {
    const response = await request.get('/api/federation/record');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();

    // Verify FederationRecord structure
    expect(data).toHaveProperty('partner_id');
    expect(data).toHaveProperty('partner_display_name');
    expect(data).toHaveProperty('merkle_root');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('compliance_stage');
    expect(data).toHaveProperty('hash_algorithm');
    expect(data).toHaveProperty('governance_endpoint');

    // Verify partner_id
    expect(data.partner_id).toBe('quantumpoly.ai');

    // Verify merkle_root format (64-character hex string)
    expect(data.merkle_root).toMatch(/^[a-f0-9]{64}$/i);

    // Verify hash algorithm
    expect(data.hash_algorithm).toBe('SHA-256');

    // Verify compliance stage
    expect(data.compliance_stage).toContain('Stage');

    // Verify no personal data
    expect(data).not.toHaveProperty('user_id');
    expect(data).not.toHaveProperty('email');
    expect(data).not.toHaveProperty('ip_address');
  });

  test('GET /api/federation/verify with partner_id filter', async ({ request }) => {
    const response = await request.get('/api/federation/verify?partner_id=quantumpoly.ai');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();

    // Verify only one partner returned
    expect(data.total_partners).toBe(1);
    expect(data.partners).toHaveLength(1);

    // Verify correct partner
    expect(data.partners[0].partner_id).toBe('quantumpoly.ai');
  });

  test('GET /api/federation/verify with invalid partner_id returns 404', async ({ request }) => {
    const response = await request.get('/api/federation/verify?partner_id=nonexistent');

    expect(response.status()).toBe(404);

    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('POST /api/federation/register without API key returns 401', async ({ request }) => {
    const response = await request.post('/api/federation/register', {
      data: {
        partner_id: 'test-partner',
        partner_display_name: 'Test Partner',
        governance_endpoint: 'https://test.org/api/federation/record',
      },
    });

    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Unauthorized');
  });

  test('POST /api/federation/notify without signature returns 400', async ({ request }) => {
    const response = await request.post('/api/federation/notify', {
      data: {
        partner_id: 'test-partner',
        event_type: 'merkle_update',
        timestamp: new Date().toISOString(),
        payload: { merkle_root: 'abc123' },
      },
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('Federation APIs have CORS headers', async ({ request }) => {
    const response = await request.get('/api/federation/verify');

    const headers = response.headers();
    expect(headers['access-control-allow-origin']).toBe('*');
    expect(headers['access-control-allow-methods']).toContain('GET');
  });

  test('Federation APIs have rate limit headers', async ({ request }) => {
    const response = await request.get('/api/federation/verify');

    const headers = response.headers();
    expect(headers).toHaveProperty('x-ratelimit-limit');
    expect(headers).toHaveProperty('x-ratelimit-remaining');
  });

  test('Federation APIs have cache headers', async ({ request }) => {
    const response = await request.get('/api/federation/verify');

    const headers = response.headers();
    expect(headers).toHaveProperty('cache-control');
    expect(headers['cache-control']).toContain('max-age');
  });

  test('No personal data in verification responses', async ({ request }) => {
    const response = await request.get('/api/federation/verify');
    const data = await response.json();

    const jsonString = JSON.stringify(data);

    // Check for common personal data patterns
    expect(jsonString).not.toMatch(/user_id/i);
    expect(jsonString).not.toMatch(/email/i);
    expect(jsonString).not.toMatch(/ip_address/i);
    expect(jsonString).not.toMatch(/phone/i);
    expect(jsonString).not.toMatch(/address/i);
    expect(jsonString).not.toMatch(/@/); // Email addresses
    expect(jsonString).not.toMatch(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/); // IP addresses
  });

  test('No personal data in trust summary responses', async ({ request }) => {
    const response = await request.get('/api/federation/trust');
    const data = await response.json();

    const jsonString = JSON.stringify(data);

    // Check for common personal data patterns
    expect(jsonString).not.toMatch(/user_id/i);
    expect(jsonString).not.toMatch(/email/i);
    expect(jsonString).not.toMatch(/ip_address/i);
    expect(jsonString).not.toMatch(/phone/i);
    expect(jsonString).not.toMatch(/address/i);
    expect(jsonString).not.toMatch(/@/); // Email addresses
    expect(jsonString).not.toMatch(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/); // IP addresses
  });

  test('No personal data in FederationRecord responses', async ({ request }) => {
    const response = await request.get('/api/federation/record');
    const data = await response.json();

    const jsonString = JSON.stringify(data);

    // Check for common personal data patterns
    expect(jsonString).not.toMatch(/user_id/i);
    expect(jsonString).not.toMatch(/email/i);
    expect(jsonString).not.toMatch(/ip_address/i);
    expect(jsonString).not.toMatch(/phone/i);
    expect(jsonString).not.toMatch(/address/i);
    expect(jsonString).not.toMatch(/@/); // Email addresses (except in URLs)
    expect(jsonString.replace(/https?:\/\/[^\s]+/g, '')).not.toMatch(/@/);
  });
});

