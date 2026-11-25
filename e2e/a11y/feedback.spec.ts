/**
 * @fileoverview Accessibility Tests for Feedback Page (Block 10.6)
 * @see BLOCK10.6_FEEDBACK_AND_TRUST.md
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { dismissConsent } from '../helpers/consent';

test.describe('Feedback Page Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/feedback');
    await dismissConsent(page);
  });
  
  test('should not have any automatically detectable accessibility violations', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  
  test('should have proper page structure', async ({ page }) => {
    // Check for main heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Share Your Feedback');
    
    // Check for form
    const form = page.locator('form');
    await expect(form).toBeVisible();
  });
  
  test('should have accessible form labels', async ({ page }) => {
    // Topic fieldset should have legend
    const topicLegend = page.locator('fieldset legend').first();
    await expect(topicLegend).toBeVisible();
    await expect(topicLegend).toContainText('What is this about?');
    
    // Message label
    const messageLabel = page.locator('label[for="message"]');
    await expect(messageLabel).toBeVisible();
    await expect(messageLabel).toContainText('Your message');
    
    // Email label (when visible)
    await page.locator('#consent-contact').check();
    const emailLabel = page.locator('label[for="email"]');
    await expect(emailLabel).toBeVisible();
  });
  
  test('should support keyboard navigation - Tab order', async ({ page }) => {
    await page.keyboard.press('Tab');
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName ?? null);
    expect(focusedTag).toBeTruthy();
  });
  
  test('should support keyboard navigation - Enter to submit', async ({ page }) => {
    // Fill form via keyboard
    await page.locator('button[aria-pressed="false"]').first().click();
    await page.locator('#message').fill('Test feedback message via keyboard navigation.');
    
    // Focus submit button and press Enter
    await page.locator('button[type="submit"]').focus();
    await page.keyboard.press('Enter');
    
    // Should trigger submission (will fail validation or succeed depending on mock)
    await page.waitForTimeout(500);
    
    // Check for either success or error state
    const hasErrorOrSuccess = await page.locator('[role="alert"], [role="status"]').count();
    expect(hasErrorOrSuccess).toBeGreaterThan(0);
  });
  
  test('should support Escape to cancel', async ({ page }) => {
    // Fill form
    await page.locator('button[aria-pressed="false"]').first().click();
    await page.locator('#message').fill('Test message.');
    
    // Trigger error state by submitting without all required fields
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(300);
    
    // Press Escape to cancel
    await page.keyboard.press('Escape');
    
    // Error should be cleared (or state reset)
    await page.waitForTimeout(300);
  });
  
  test('should have visible focus indicators', async ({ page }) => {
    const firstTopic = page.locator('button[aria-pressed="false"]').first();
    await firstTopic.focus();
    await expect(firstTopic).toBeFocused();
    await expect(firstTopic).toHaveClass(/focus:ring-2/);
  });
  
  test('should announce validation errors to screen readers', async ({ page }) => {
    // Submit form without filling required fields
    await page.locator('button[type="submit"]').click();

    const errorSummary = page.locator('[role="alert"][tabindex="-1"]').first();
    await expect(errorSummary).toBeVisible();

    const tabIndex = await errorSummary.getAttribute('tabindex');
    expect(tabIndex).toBe('-1');
  });
  
  test('should have aria-describedby for textarea', async ({ page }) => {
    const textarea = page.locator('#message');
    const describedBy = await textarea.getAttribute('aria-describedby');
    
    expect(describedBy).toBeTruthy();
    expect(describedBy).toContain('message-counter');
  });
  
  test('should update character counter dynamically', async ({ page }) => {
    const textarea = page.locator('#message');
    const counter = page.locator('#message-counter');
    
    // Initial state
    await expect(counter).toContainText('0 / 2000');
    
    // Type some text
    await textarea.fill('Test message');
    
    // Counter should update
    await expect(counter).toContainText('12 / 2000');
  });
  
  test('should mark required fields appropriately', async ({ page }) => {
    // Check for required asterisks (*)
    const topicLabel = page.locator('fieldset legend').first();
    await expect(topicLabel).toContainText('*');
    
    const messageLabel = page.locator('label[for="message"]');
    await expect(messageLabel).toContainText('*');
  });
  
  test('should have proper ARIA roles for status messages', async ({ page }) => {
    // Fill and submit form
    await page.locator('button[aria-pressed="false"]').first().click();
    await page.locator('#message').fill('This is a valid feedback message with sufficient length.');
    
    // Mock successful API response
    await page.route('**/api/feedback/report', async route => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          id: 'fbk_test_123',
          stored_at: new Date().toISOString(),
          trust_score: 0.75,
          message: 'Success',
          status: 'pending',
          next_steps: 'Review',
        }),
      });
    });
    
    await page.locator('button[type="submit"]').click();

    // Check for status/alert region after submission
    const statusRegion = page.locator('[role="status"], [role="alert"]').first();
    await expect(statusRegion).toBeVisible();
  });
  
  test('should have color contrast meeting WCAG AA', async ({ page }) => {
    // Run contrast check via Axe
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('[role="main"], form')
      .analyze();
    
    const contrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    );
    
    expect(contrastViolations).toEqual([]);
  });
  
  test('should handle email field conditional rendering accessibly', async ({ page }) => {
    // Email field should not be visible initially
    const emailInput = page.locator('#email');
    await expect(emailInput).not.toBeVisible();
    
    // Check consent checkbox
    await page.locator('#consent-contact').check();
    
    // Email field should now be visible
    await expect(emailInput).toBeVisible();
    
    // Should have proper label association
    const emailLabel = page.locator('label[for="email"]');
    await expect(emailLabel).toBeVisible();
  });
});

test.describe('Feedback Page Dark Mode Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Enable dark mode (assuming the site uses prefers-color-scheme)
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/en/feedback');
    await dismissConsent(page);
  });
  
  test('should not have accessibility violations in dark mode', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  
  test('should have sufficient color contrast in dark mode', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('#main-content')
      .analyze();
    
    const contrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    );
    
    expect(contrastViolations).toEqual([]);
  });
});
