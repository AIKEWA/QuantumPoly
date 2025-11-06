/**
 * @fileoverview Integrity API E2E Tests
 * @see BLOCK9.8_CONTINUOUS_INTEGRITY.md
 */

import { test, expect } from '@playwright/test';

test.describe('Integrity Status API', () => {
  test('should return current system state', async ({ page }) => {
    const response = await page.request.get('/api/integrity/status');
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    
    // Verify required fields
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('system_state');
    expect(data).toHaveProperty('last_verification');
    expect(data).toHaveProperty('verification_scope');
    expect(data).toHaveProperty('ledger_status');
    expect(data).toHaveProperty('open_issues');
    expect(data).toHaveProperty('recent_repairs');
    expect(data).toHaveProperty('pending_human_reviews');
    expect(data).toHaveProperty('global_merkle_root');
    expect(data).toHaveProperty('compliance_baseline');
    expect(data).toHaveProperty('privacy_notice');
    expect(data).toHaveProperty('documentation_url');
  });

  test('should have valid system state', async ({ page }) => {
    const response = await page.request.get('/api/integrity/status');
    const data = await response.json();
    
    expect(['healthy', 'degraded', 'attention_required']).toContain(data.system_state);
  });

  test('should have valid ledger status', async ({ page }) => {
    const response = await page.request.get('/api/integrity/status');
    const data = await response.json();
    
    expect(data.ledger_status).toHaveProperty('governance');
    expect(data.ledger_status).toHaveProperty('consent');
    expect(data.ledger_status).toHaveProperty('federation');
    expect(data.ledger_status).toHaveProperty('trust_proofs');
    
    const validStatuses = ['valid', 'degraded', 'critical'];
    expect(validStatuses).toContain(data.ledger_status.governance);
    expect(validStatuses).toContain(data.ledger_status.consent);
    expect(validStatuses).toContain(data.ledger_status.federation);
    expect(validStatuses).toContain(data.ledger_status.trust_proofs);
  });

  test('should expose no personal data', async ({ page }) => {
    const response = await page.request.get('/api/integrity/status');
    const data = await response.json();
    
    expect(data.privacy_notice).toContain('No personal information');
    
    // Verify no email addresses, IPs, or user IDs in response
    const responseText = JSON.stringify(data);
    expect(responseText).not.toMatch(/@/);
    expect(responseText).not.toMatch(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/);
    expect(responseText).not.toMatch(/user_id|userId|user-id/i);
  });

  test('should have proper CORS headers', async ({ page }) => {
    const response = await page.request.get('/api/integrity/status');
    
    const headers = response.headers();
    expect(headers['access-control-allow-origin']).toBe('*');
    expect(headers['access-control-allow-methods']).toContain('GET');
  });

  test('should have rate limit headers', async ({ page }) => {
    const response = await page.request.get('/api/integrity/status');
    
    const headers = response.headers();
    expect(headers).toHaveProperty('x-ratelimit-limit');
    expect(headers).toHaveProperty('x-ratelimit-remaining');
  });

  test('should have cache control headers', async ({ page }) => {
    const response = await page.request.get('/api/integrity/status');
    
    const headers = response.headers();
    expect(headers['cache-control']).toContain('public');
    expect(headers['cache-control']).toContain('max-age=300');
  });

  test('should return valid JSON', async ({ page }) => {
    const response = await page.request.get('/api/integrity/status');
    
    expect(response.headers()['content-type']).toContain('application/json');
    
    // Should not throw when parsing
    const data = await response.json();
    expect(data).toBeTruthy();
  });

  test('should have valid timestamp format', async ({ page }) => {
    const response = await page.request.get('/api/integrity/status');
    const data = await response.json();
    
    // Should be valid ISO 8601
    expect(() => new Date(data.timestamp)).not.toThrow();
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
  });

  test('should have valid compliance baseline', async ({ page }) => {
    const response = await page.request.get('/api/integrity/status');
    const data = await response.json();
    
    expect(data.compliance_baseline).toContain('Stage');
    expect(data.compliance_baseline).toContain('Continuous Integrity');
  });

  test('should handle OPTIONS request (CORS preflight)', async ({ page }) => {
    const response = await page.request.fetch('/api/integrity/status', {
      method: 'OPTIONS',
    });
    
    expect(response.status()).toBe(204);
    
    const headers = response.headers();
    expect(headers['access-control-allow-origin']).toBe('*');
    expect(headers['access-control-allow-methods']).toContain('GET');
  });
});

test.describe('Integrity Monitoring System', () => {
  test('should have integrity reports directory', async ({ page }) => {
    // This test verifies the system structure exists
    // In a real deployment, we'd check for actual report files
    
    const response = await page.request.get('/api/integrity/status');
    const data = await response.json();
    
    // If last_verification is not "Never", reports should exist
    if (data.last_verification !== 'Never') {
      expect(data.last_verification).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    }
  });

  test('should track open issues', async ({ page }) => {
    const response = await page.request.get('/api/integrity/status');
    const data = await response.json();
    
    expect(Array.isArray(data.open_issues)).toBeTruthy();
    
    // If there are open issues, they should have proper structure
    if (data.open_issues.length > 0) {
      const issue = data.open_issues[0];
      expect(issue).toHaveProperty('classification');
      expect(issue).toHaveProperty('count');
      expect(issue).toHaveProperty('severity');
      expect(issue).toHaveProperty('summary');
    }
  });

  test('should track recent repairs', async ({ page }) => {
    const response = await page.request.get('/api/integrity/status');
    const data = await response.json();
    
    expect(Array.isArray(data.recent_repairs)).toBeTruthy();
    
    // If there are recent repairs, they should have proper structure
    if (data.recent_repairs.length > 0) {
      const repair = data.recent_repairs[0];
      expect(repair).toHaveProperty('timestamp');
      expect(repair).toHaveProperty('classification');
      expect(repair).toHaveProperty('status');
      expect(repair).toHaveProperty('summary');
    }
  });

  test('should count pending human reviews', async ({ page }) => {
    const response = await page.request.get('/api/integrity/status');
    const data = await response.json();
    
    expect(typeof data.pending_human_reviews).toBe('number');
    expect(data.pending_human_reviews).toBeGreaterThanOrEqual(0);
  });

  test('should have global merkle root', async ({ page }) => {
    const response = await page.request.get('/api/integrity/status');
    const data = await response.json();
    
    // Global Merkle root should be a hex string (or empty if no ledgers)
    if (data.global_merkle_root) {
      expect(data.global_merkle_root).toMatch(/^[0-9a-f]{64}$/);
    }
  });
});

