/**
 * E2E Accessibility Test: Policy Pages
 *
 * Tests policy pages for WCAG 2.2 AA compliance with complex content,
 * table of contents navigation, and skip links.
 *
 * Scope: PolicyLayout with full content, TOC, metadata
 * Evidence: Zero critical/serious violations for governance compliance
 */

import { test, expect } from '../fixtures/a11y';

test.describe('A11y E2E: Policy Pages', () => {
  test('privacy policy has no accessibility violations', async ({ page, makeAxeBuilder }) => {
    await page.goto('/en/privacy');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await makeAxeBuilder().analyze();

    const criticalIssues = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    expect(criticalIssues).toEqual([]);
  });

  test('ethics policy has no accessibility violations', async ({ page, makeAxeBuilder }) => {
    await page.goto('/en/ethics');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await makeAxeBuilder().analyze();

    const criticalIssues = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    expect(criticalIssues).toEqual([]);
  });

  test('skip link works correctly', async ({ page }) => {
    await page.goto('/en/privacy');
    await page.waitForLoadState('networkidle');

    // Tab to skip link
    await page.keyboard.press('Tab');

    // Verify skip link is focused and visible
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();

    // Activate skip link
    await page.keyboard.press('Enter');

    // Verify focus moved to main content
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeFocused();
  });

  test('table of contents navigation is accessible', async ({ page, makeAxeBuilder }) => {
    await page.goto('/en/privacy');
    await page.waitForLoadState('networkidle');

    // Verify TOC exists and is accessible
    const toc = page.locator('nav[aria-label*="Table of contents"]');
    await expect(toc).toBeVisible();

    // Scan TOC specifically
    const accessibilityScanResults = await makeAxeBuilder()
      .include('nav[aria-label*="Table of contents"]')
      .analyze();

    const criticalIssues = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    expect(criticalIssues).toEqual([]);
  });

  test('TOC links navigate to correct sections', async ({ page }) => {
    await page.goto('/en/privacy');
    await page.waitForLoadState('networkidle');

    // Get first TOC link
    const firstTocLink = page.locator('nav[aria-label*="Table of contents"] a').first();
    const href = await firstTocLink.getAttribute('href');

    if (href) {
      await firstTocLink.click();

      // Verify section is scrolled into view
      const targetId = href.replace('#', '');
      const targetSection = page.locator(`#${targetId}`);
      await expect(targetSection).toBeInViewport();
    }
  });

  test('heading hierarchy is correct', async ({ page }) => {
    await page.goto('/en/privacy');
    await page.waitForLoadState('networkidle');

    // Check heading structure
    const headings = await page.evaluate(() => {
      const headingElements = Array.from(
        document.querySelectorAll('h1, h2, h3, h4, h5, h6'),
      );
      return headingElements.map((h) => ({
        level: parseInt(h.tagName.substring(1)),
        text: h.textContent?.trim(),
      }));
    });

    // Should have exactly one h1
    const h1Count = headings.filter((h) => h.level === 1).length;
    expect(h1Count).toBe(1);

    // Verify no skipped heading levels
    for (let i = 1; i < headings.length; i++) {
      const prevLevel = headings[i - 1].level;
      const currLevel = headings[i].level;
      // Next heading should be same level, one level down, or jump back up
      expect(currLevel - prevLevel).toBeLessThanOrEqual(1);
    }
  });

  test('metadata is properly structured', async ({ page }) => {
    await page.goto('/en/privacy');
    await page.waitForLoadState('networkidle');

    // Verify status badge has proper label
    const statusBadge = page.locator('[aria-label*="Status"]');
    await expect(statusBadge).toBeVisible();

    // Verify version is present
    const version = page.locator('[aria-label*="Version"]');
    await expect(version).toBeVisible();

    // Verify date information uses time elements
    const timeElements = page.locator('time');
    const timeCount = await timeElements.count();
    expect(timeCount).toBeGreaterThan(0);
  });

  test('maintains accessibility on different locales', async ({ page, makeAxeBuilder }) => {
    // Test German locale
    await page.goto('/de/privacy');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await makeAxeBuilder().analyze();

    const criticalIssues = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    expect(criticalIssues).toEqual([]);
  });
});

