/**
 * @fileoverview Review Dashboard E2E Tests - Block 9.9
 * @see BLOCK9.9_FINAL_AUDIT_AND_HANDOFF.md
 *
 * Playwright tests for review dashboard and audit workflow
 */

import { test, expect } from '@playwright/test';

test.describe('Review Dashboard - Block 9.9', () => {
  test.describe('Dashboard Rendering', () => {
    test('should load review dashboard without errors', async ({ page }) => {
      await page.goto('/en/governance/review');
      await page.waitForLoadState('networkidle');

      // Check main heading
      const heading = page.locator('h1');
      await expect(heading).toContainText('Block 9.9');
      await expect(heading).toContainText('Human Audit');
    });

    test('should display all required sections', async ({ page }) => {
      await page.goto('/en/governance/review');
      await page.waitForLoadState('networkidle');

      // System Overview
      await expect(page.locator('text=System Overview')).toBeVisible();
      await expect(page.locator('text=Release Candidate')).toBeVisible();
      await expect(page.locator('text=Commit Hash')).toBeVisible();

      // Sign-Off Progress
      await expect(page.locator('text=Sign-Off Progress')).toBeVisible();
      await expect(page.locator('text=Lead Engineer')).toBeVisible();
      await expect(page.locator('text=Governance Officer')).toBeVisible();
      await expect(page.locator('text=Legal Counsel')).toBeVisible();
      await expect(page.locator('text=Accessibility Reviewer')).toBeVisible();

      // Integrity Status
      await expect(page.locator('text=Integrity Status')).toBeVisible();

      // Review History
      await expect(page.locator('text=Review History')).toBeVisible();
    });

    test('should display governance milestones', async ({ page }) => {
      await page.goto('/en/governance/review');
      await page.waitForLoadState('networkidle');

      // Check for Block 9.0-9.8
      await expect(page.locator('text=Block 9.0')).toBeVisible();
      await expect(page.locator('text=Block 9.8')).toBeVisible();
      await expect(page.locator('text=Continuous Integrity')).toBeVisible();
    });

    test('should be localized correctly', async ({ page }) => {
      // Test German locale
      await page.goto('/de/governance/review');
      await page.waitForLoadState('networkidle');

      // Should still load (even if not fully translated)
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
    });
  });

  test.describe('Integrity Integration', () => {
    test('should fetch and display integrity status', async ({ page }) => {
      await page.goto('/en/governance/review');
      await page.waitForLoadState('networkidle');

      // Wait for integrity status to load
      await page.waitForSelector('text=Integrity Status', { timeout: 10000 });

      // Check for integrity status elements
      const statusPanel = page.locator('text=Integrity Status').locator('..');
      await expect(statusPanel).toBeVisible();

      // Should show last verification
      await expect(page.locator('text=Last Verification')).toBeVisible();

      // Should show ledger health
      await expect(page.locator('text=Ledger Health')).toBeVisible();
    });

    test('should display system state correctly', async ({ page }) => {
      await page.goto('/en/governance/review');
      await page.waitForLoadState('networkidle');

      // System state should be one of: healthy, degraded, attention_required
      const stateElement = page.locator('[aria-label*="System state"]');
      await expect(stateElement).toBeVisible();

      const stateText = await stateElement.textContent();
      expect(['healthy', 'degraded', 'attention required']).toContain(
        stateText?.toLowerCase().trim() || ''
      );
    });

    test('should show conditional approval warning when needed', async ({ page }) => {
      await page.goto('/en/governance/review');
      await page.waitForLoadState('networkidle');

      // If system state is attention_required, warning should be visible
      const stateElement = page.locator('[aria-label*="System state"]');
      const stateText = await stateElement.textContent();

      if (stateText?.toLowerCase().includes('attention required')) {
        await expect(page.locator('text=Conditional Approval Required')).toBeVisible();
      }
    });
  });

  test.describe('Sign-Off Workflow', () => {
    test('should show authentication requirement', async ({ page }) => {
      await page.goto('/en/governance/review');
      await page.waitForLoadState('networkidle');

      // Should show API key input or sign-off form
      const hasAuthInput = await page.locator('text=Authentication Required').isVisible();
      const hasSignOffForm = await page.locator('text=Submit Sign-Off').isVisible();

      expect(hasAuthInput || hasSignOffForm).toBeTruthy();
    });

    test('should validate form fields', async ({ page }) => {
      await page.goto('/en/governance/review');
      await page.waitForLoadState('networkidle');

      // Check if sign-off form is visible (requires API key)
      const submitButton = page.locator('button:has-text("Submit Sign-Off")');

      if (await submitButton.isVisible()) {
        // Try to submit without filling fields
        await submitButton.click();

        // Should show validation (HTML5 validation)
        const reviewerNameInput = page.locator('#reviewer-name');
        const isInvalid = await reviewerNameInput.evaluate((el: HTMLInputElement) => {
          return !el.validity.valid;
        });

        expect(isInvalid).toBeTruthy();
      }
    });

    test('should have all required role options', async ({ page }) => {
      await page.goto('/en/governance/review');
      await page.waitForLoadState('networkidle');

      const roleSelect = page.locator('#role');

      if (await roleSelect.isVisible()) {
        const options = await roleSelect.locator('option').allTextContents();

        expect(options).toContain('Lead Engineer');
        expect(options).toContain('Governance Officer');
        expect(options).toContain('Legal Counsel');
        expect(options).toContain('Accessibility Reviewer');
      }
    });

    test('should have decision options', async ({ page }) => {
      await page.goto('/en/governance/review');
      await page.waitForLoadState('networkidle');

      const decisionSelect = page.locator('#decision');

      if (await decisionSelect.isVisible()) {
        const options = await decisionSelect.locator('option').allTextContents();

        expect(options).toContain('Approved');
        expect(options).toContain('Approved with Exceptions');
        expect(options).toContain('Rejected');
      }
    });
  });

  test.describe('Review History', () => {
    test('should display review history section', async ({ page }) => {
      await page.goto('/en/governance/review');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('text=Review History')).toBeVisible();
    });

    test('should show privacy notice', async ({ page }) => {
      await page.goto('/en/governance/review');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('text=Privacy Notice')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have no critical accessibility violations', async ({ page }) => {
      await page.goto('/en/governance/review');
      await page.waitForLoadState('networkidle');

      // Basic accessibility checks
      // Check for main heading
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);

      // Check for proper ARIA labels
      const integrityPanel = page.locator('[role="region"][aria-label*="Integrity"]');
      if (await integrityPanel.isVisible()) {
        await expect(integrityPanel).toHaveAttribute('aria-label');
      }
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/en/governance/review');
      await page.waitForLoadState('networkidle');

      // Tab through interactive elements
      await page.keyboard.press('Tab');

      // Check if focus is visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have proper form labels', async ({ page }) => {
      await page.goto('/en/governance/review');
      await page.waitForLoadState('networkidle');

      // Check if form inputs have labels
      const reviewerNameInput = page.locator('#reviewer-name');

      if (await reviewerNameInput.isVisible()) {
        const label = page.locator('label[for="reviewer-name"]');
        await expect(label).toBeVisible();
      }
    });
  });
});

test.describe('Audit APIs - Block 9.9', () => {
  test.describe('GET /api/audit/status', () => {
    test('should return valid audit status', async ({ request }) => {
      const response = await request.get('/api/audit/status');

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const data = await response.json();

      // Verify required fields
      expect(data).toHaveProperty('release_candidate');
      expect(data).toHaveProperty('commit_hash');
      expect(data).toHaveProperty('readiness_state');
      expect(data).toHaveProperty('integrity_state');
      expect(data).toHaveProperty('required_signoffs');
      expect(data).toHaveProperty('completed_signoffs');
      expect(data).toHaveProperty('blocking_issues');

      // Verify types
      expect(Array.isArray(data.required_signoffs)).toBeTruthy();
      expect(Array.isArray(data.completed_signoffs)).toBeTruthy();
      expect(Array.isArray(data.blocking_issues)).toBeTruthy();
    });

    test('should have proper CORS headers', async ({ request }) => {
      const response = await request.get('/api/audit/status');

      const headers = response.headers();
      expect(headers['access-control-allow-origin']).toBe('*');
      expect(headers['access-control-allow-methods']).toContain('GET');
    });

    test('should have cache control headers', async ({ request }) => {
      const response = await request.get('/api/audit/status');

      const headers = response.headers();
      expect(headers['cache-control']).toContain('public');
      expect(headers['cache-control']).toContain('max-age=300');
    });
  });

  test.describe('POST /api/audit/sign-off', () => {
    test('should require authentication', async ({ request }) => {
      const response = await request.post('/api/audit/sign-off', {
        data: {
          reviewer_name: 'Test Reviewer',
          role: 'Lead Engineer',
          review_scope: ['Test Scope'],
          decision: 'approved',
        },
      });

      expect(response.status()).toBe(401);

      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    test('should validate request body', async ({ request }) => {
      // Try with invalid API key
      const response = await request.post('/api/audit/sign-off', {
        headers: {
          Authorization: 'Bearer invalid-key',
        },
        data: {
          // Missing required fields
          reviewer_name: '',
        },
      });

      expect(response.status()).toBe(401);
    });
  });

  test.describe('GET /api/audit/history', () => {
    test('should return sign-off history', async ({ request }) => {
      const response = await request.get('/api/audit/history');

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const data = await response.json();

      // Verify structure
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('limit');
      expect(data).toHaveProperty('signoffs');
      expect(data).toHaveProperty('privacy_notice');

      expect(Array.isArray(data.signoffs)).toBeTruthy();
    });

    test('should respect limit parameter', async ({ request }) => {
      const response = await request.get('/api/audit/history?limit=5');

      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data.limit).toBe(5);
      expect(data.signoffs.length).toBeLessThanOrEqual(5);
    });

    test('should validate limit parameter', async ({ request }) => {
      const response = await request.get('/api/audit/history?limit=100');

      expect(response.status()).toBe(400);

      const data = await response.json();
      expect(data.error).toBe('Bad Request');
    });

    test('should have proper CORS headers', async ({ request }) => {
      const response = await request.get('/api/audit/history');

      const headers = response.headers();
      expect(headers['access-control-allow-origin']).toBe('*');
    });
  });

  test.describe('OPTIONS requests (CORS preflight)', () => {
    test('should handle OPTIONS for /api/audit/status', async ({ request }) => {
      const response = await request.fetch('/api/audit/status', {
        method: 'OPTIONS',
      });

      expect(response.status()).toBe(204);

      const headers = response.headers();
      expect(headers['access-control-allow-origin']).toBe('*');
      expect(headers['access-control-allow-methods']).toContain('GET');
    });

    test('should handle OPTIONS for /api/audit/sign-off', async ({ request }) => {
      const response = await request.fetch('/api/audit/sign-off', {
        method: 'OPTIONS',
      });

      expect(response.status()).toBe(204);

      const headers = response.headers();
      expect(headers['access-control-allow-headers']).toContain('Authorization');
    });
  });
});

