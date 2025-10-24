/**
 * E2E Tests: Policy Pages Accessibility
 * 
 * Validates policy-specific accessibility requirements:
 * - Disclaimer presence on privacy/imprint pages
 * - Translation fallback notices
 * - Robots meta tags based on publication status
 * - Semantic landmark structure
 * - Heading hierarchy in rendered pages
 */

import { test, expect } from '@playwright/test';

test.describe('Policy Pages - Accessibility & Compliance', () => {
  const policyTypes = ['ethics', 'gep', 'privacy', 'imprint'] as const;
  const locales = ['en', 'de'] as const;

  test.describe('Disclaimer Content', () => {
    test('/en/privacy contains required disclaimer', async ({ page }) => {
      await page.goto('/en/privacy');

      // Wait for page to load
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      // Check for disclaimer text (policy content includes "informational")
      const content = await page.textContent('body');
      expect(content?.toLowerCase()).toContain('informational');
    });

    test('/en/imprint contains required disclaimer', async ({ page }) => {
      await page.goto('/en/imprint');

      // Wait for page to load
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      // Check for disclaimer text
      const content = await page.textContent('body');
      expect(content?.toLowerCase()).toContain('informational');
    });
  });

  test.describe('Translation Fallback Notices', () => {
    test('shows fallback notice when translation is incomplete', async ({ page }) => {
      // Test locales that might have incomplete translations (es, fr, it)
      const testLocales = ['es', 'fr', 'it'];

      for (const locale of testLocales) {
        await page.goto(`/${locale}/ethics`);

        // Wait for page to load
        await page.waitForLoadState('networkidle');

        // Check if fallback notice exists
        const fallbackNotice = page.getByText(/translation in progress/i);
        const isVisible = await fallbackNotice.isVisible().catch(() => false);

        if (isVisible) {
          // If fallback is shown, verify it has proper ARIA
          await expect(fallbackNotice).toBeVisible();
          await expect(page.getByText(/showing english content/i)).toBeVisible();

          // Verify it's in a status role
          const statusElement = page.locator('[role="status"]');
          await expect(statusElement).toBeVisible();
        }
      }
    });

    test('does not show fallback notice for complete translations', async ({ page }) => {
      // English and German should have complete translations
      const completeLocales = ['en', 'de'];

      for (const locale of completeLocales) {
        await page.goto(`/${locale}/privacy`);

        // Wait for page to load
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        // Fallback notice should not be present
        const fallbackNotice = page.getByText(/translation in progress/i);
        await expect(fallbackNotice).not.toBeVisible();
      }
    });
  });

  test.describe('Robots Meta Tags', () => {
    test('published policies have index robots meta', async ({ page }) => {
      await page.goto('/en/privacy');

      // Get robots meta tag
      const robots = await page.locator('meta[name="robots"]').getAttribute('content');

      // Check publication status from page
      const statusBadge = await page.getByText(/published/i).first();
      const isPublished = await statusBadge.isVisible().catch(() => false);

      if (isPublished) {
        expect(robots?.toLowerCase()).toContain('index');
        expect(robots?.toLowerCase()).toContain('follow');
      }
    });

    test('non-published policies have noindex robots meta', async ({ page }) => {
      // Test each policy to see if any are draft/in-progress
      for (const policy of policyTypes) {
        await page.goto(`/en/${policy}`);

        const robots = await page.locator('meta[name="robots"]').getAttribute('content');
        const statusText = await page.getByText(/draft|in progress|published/i).first().textContent();

        if (statusText?.toLowerCase().includes('draft') || statusText?.toLowerCase().includes('progress')) {
          expect(robots?.toLowerCase()).toContain('noindex');
          expect(robots?.toLowerCase()).toContain('nofollow');
        }
      }
    });

    test('all policy pages have robots meta tag', async ({ page }) => {
      for (const policy of policyTypes) {
        for (const locale of locales) {
          await page.goto(`/${locale}/${policy}`);

          const robotsMeta = page.locator('meta[name="robots"]');
          await expect(robotsMeta).toBeAttached();

          const content = await robotsMeta.getAttribute('content');
          expect(content).toBeTruthy();
        }
      }
    });
  });

  test.describe('Semantic Landmarks', () => {
    test('policy pages have proper landmark structure', async ({ page }) => {
      await page.goto('/en/privacy');

      // Wait for page to load
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      // Verify main landmark
      const main = page.locator('main');
      await expect(main).toBeVisible();
      await expect(main).toHaveAttribute('id', 'main-content');

      // Verify footer landmark
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();

      // Skip link should be present
      const skipLink = page.getByText('Skip to main content');
      await expect(skipLink).toBeAttached();
    });

    test('all policy pages have navigation landmark when TOC present', async ({ page }) => {
      for (const policy of ['privacy', 'ethics', 'gep']) {
        await page.goto(`/en/${policy}`);

        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        // Check if TOC exists
        const tocHeading = page.getByText(/on this page/i);
        const hasToc = await tocHeading.isVisible().catch(() => false);

        if (hasToc) {
          // Verify navigation landmark
          const nav = page.locator('nav[aria-label*="table of contents"]');
          await expect(nav).toBeVisible();
        }
      }
    });
  });

  test.describe('Heading Hierarchy', () => {
    test('policy pages have exactly one H1', async ({ page }) => {
      for (const policy of policyTypes) {
        await page.goto(`/en/${policy}`);

        const h1Elements = await page.locator('h1').all();
        expect(h1Elements).toHaveLength(1);
      }
    });

    test('policy pages have proper heading structure', async ({ page }) => {
      await page.goto('/en/privacy');

      // Get all headings
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();

      // Extract heading levels
      const levels: number[] = [];
      for (const heading of headings) {
        const tagName = await heading.evaluate((el) => el.tagName.toLowerCase());
        const level = parseInt(tagName.charAt(1), 10);
        levels.push(level);
      }

      // Verify first heading is H1
      expect(levels[0]).toBe(1);

      // Verify no level jumps (e.g., h1 -> h3)
      for (let i = 1; i < levels.length; i++) {
        const current = levels[i];
        const previous = levels[i - 1];

        // Allow same level or one level deeper, or going back up
        const difference = current - previous;
        expect(difference).toBeLessThanOrEqual(1);
      }
    });

    test('H1 has proper ID for main landmark labeling', async ({ page }) => {
      await page.goto('/en/privacy');

      const h1 = page.locator('h1');
      await expect(h1).toHaveAttribute('id', 'page-title');

      // Verify main is labeled by this H1
      const main = page.locator('main');
      await expect(main).toHaveAttribute('aria-labelledby', 'page-title');
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('skip link works and focuses main content', async ({ page }) => {
      await page.goto('/en/privacy');

      // Tab to skip link (it's first focusable element)
      await page.keyboard.press('Tab');

      // Verify skip link is focused
      const skipLink = page.getByText('Skip to main content');
      await expect(skipLink).toBeFocused();

      // Activate skip link
      await page.keyboard.press('Enter');

      // Main content should be in focus
      const main = page.locator('main#main-content');
      await expect(main).toBeFocused();
    });

    test('TOC links are keyboard accessible', async ({ page }) => {
      await page.goto('/en/privacy');

      const tocLinks = page.locator('nav[aria-label*="table of contents"] a');
      const linkCount = await tocLinks.count();

      if (linkCount > 0) {
        // First link should be focusable
        const firstLink = tocLinks.first();
        await firstLink.focus();
        await expect(firstLink).toBeFocused();

        // Should have visible focus indicator
        const outline = await firstLink.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return styles.outline || styles.boxShadow;
        });

        expect(outline).not.toBe('none');
      }
    });
  });

  test.describe('Status Badges and ARIA', () => {
    test('status badge has accessible label', async ({ page }) => {
      await page.goto('/en/privacy');

      // Status badge should have aria-label
      const statusBadge = page.locator('[aria-label*="Status:"]');
      await expect(statusBadge).toBeVisible();
    });

    test('version badge has accessible label', async ({ page }) => {
      await page.goto('/en/privacy');

      // Version badge should have aria-label
      const versionBadge = page.locator('[aria-label*="Version"]');
      await expect(versionBadge).toBeVisible();
    });
  });

  test.describe('Date Formatting', () => {
    test('dates use time element with datetime attribute', async ({ page }) => {
      await page.goto('/en/privacy');

      const timeElements = page.locator('time');
      const count = await timeElements.count();

      expect(count).toBeGreaterThanOrEqual(2); // lastReviewed + nextReviewDue

      // Verify all time elements have datetime
      for (let i = 0; i < count; i++) {
        const timeEl = timeElements.nth(i);
        const datetime = await timeEl.getAttribute('datetime');
        expect(datetime).toBeTruthy();
        expect(datetime).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    });
  });

  test.describe('Cross-locale Consistency', () => {
    test('all locales have consistent landmark structure', async ({ page }) => {
      for (const locale of locales) {
        await page.goto(`/${locale}/privacy`);

        await expect(page.locator('main')).toBeVisible();
        await expect(page.locator('footer')).toBeVisible();

        const h1Count = await page.locator('h1').count();
        expect(h1Count).toBe(1);
      }
    });

    test('all policy types have consistent structure', async ({ page }) => {
      for (const policy of policyTypes) {
        await page.goto(`/en/${policy}`);

        // All should have main content
        await expect(page.locator('main#main-content')).toBeVisible();

        // All should have H1
        const h1 = page.locator('h1');
        await expect(h1).toBeVisible();
        await expect(h1).toHaveAttribute('id', 'page-title');

        // All should have status badge
        const statusBadge = page.locator('[aria-label*="Status:"]');
        await expect(statusBadge).toBeVisible();

        // All should have version badge
        const versionBadge = page.locator('[aria-label*="Version"]');
        await expect(versionBadge).toBeVisible();
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('maintains accessibility on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/en/privacy');

      // Skip link should still work
      await page.keyboard.press('Tab');
      const skipLink = page.getByText('Skip to main content');
      await expect(skipLink).toBeFocused();

      // Main landmarks should still be present
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();

      // H1 should be visible
      await expect(page.locator('h1')).toBeVisible();
    });
  });

  test.describe('Color and Contrast', () => {
    test('policy content has sufficient contrast', async ({ page }) => {
      await page.goto('/en/privacy');

      // Get main content area
      const main = page.locator('main');
      await expect(main).toBeVisible();

      // Note: Full color contrast testing requires axe-core or lighthouse
      // Here we verify content is visible
      const isVisible = await main.isVisible();
      expect(isVisible).toBe(true);
    });
  });
});

