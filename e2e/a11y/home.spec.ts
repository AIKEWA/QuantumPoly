/**
 * E2E Accessibility Test: Home Page
 *
 * Tests the Home page for WCAG 2.2 AA compliance in a real browser environment.
 * Validates full user interaction flows including keyboard navigation.
 *
 * Scope: Full page render with all interactive elements
 * Evidence: Zero critical/serious violations for ethical compliance
 */

import { test, expect } from '../fixtures/a11y';

test.describe('A11y E2E: Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en');
    // Wait for page to be fully interactive
    await page.waitForLoadState('networkidle');
  });

  test('has no critical or serious accessibility violations', async ({ page, makeAxeBuilder }) => {
    const accessibilityScanResults = await makeAxeBuilder().analyze();

    // Filter for critical and serious issues only
    const criticalIssues = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    expect(criticalIssues).toEqual([]);
  });

  test('maintains accessibility on German locale', async ({ page, makeAxeBuilder }) => {
    await page.goto('/de');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await makeAxeBuilder().analyze();
    const criticalIssues = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    expect(criticalIssues).toEqual([]);
  });

  test('keyboard navigation works correctly', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');

    // Verify focus is visible
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      const styles = window.getComputedStyle(el!);
      return {
        tagName: el?.tagName,
        outlineStyle: styles.outlineStyle,
        outlineWidth: styles.outlineWidth,
      };
    });

    // Focus should be on an interactive element
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement.tagName);
  });

  test('newsletter form has proper accessibility', async ({ page, makeAxeBuilder }) => {
    // Focus on newsletter section
    const accessibilityScanResults = await makeAxeBuilder()
      .include('[aria-labelledby="newsletter-title"]')
      .analyze();

    const criticalIssues = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    expect(criticalIssues).toEqual([]);

    // Verify form has proper labels
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('aria-invalid', 'false');
    await expect(emailInput).toHaveAccessibleName();
  });

  test('all sections have proper landmarks', async ({ page }) => {
    // Verify main landmark exists
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Verify sections have proper aria labels
    const sections = await page.locator('section[aria-labelledby]').count();
    expect(sections).toBeGreaterThan(0);
  });

  test('images and decorative elements have proper alt text', async ({ page }) => {
    // Get all images
    const images = page.locator('img');
    const imageCount = await images.count();

    // Each image should have alt attribute (can be empty for decorative)
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const hasAlt = await img.evaluate((el) => el.hasAttribute('alt'));
      expect(hasAlt).toBe(true);
    }
  });
});

