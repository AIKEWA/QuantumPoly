/**
 * E2E Tests: Content Verification
 * 
 * Tests that content is properly translated and displayed per locale
 */

import { test, expect } from '@playwright/test';
import {
  getSupportedLocales,
  navigateToLocale,
  expectedContent,
  waitForLocaleContent,
} from '../fixtures/i18n-test-helpers';

test.describe('Content Verification', () => {
  const locales = getSupportedLocales();

  for (const locale of locales) {
    test(`${locale} displays correct hero title`, async ({ page }) => {
      await navigateToLocale(page, locale);
      await waitForLocaleContent(page);
      
      const content = expectedContent[locale];
      
      // Check hero title
      const heroTitle = page.getByRole('heading', { 
        name: content.heroTitle,
        level: 1 
      }).or(page.getByText(content.heroTitle, { exact: false }));
      
      await expect(heroTitle.first()).toBeVisible();
    });

    test(`${locale} displays correct about section`, async ({ page }) => {
      await navigateToLocale(page, locale);
      await waitForLocaleContent(page);
      
      const content = expectedContent[locale];
      
      // Check about title
      const aboutTitle = page.getByText(content.aboutTitle, { exact: false });
      await expect(aboutTitle.first()).toBeVisible();
    });

    test(`${locale} displays correct vision section`, async ({ page }) => {
      await navigateToLocale(page, locale);
      await waitForLocaleContent(page);
      
      const content = expectedContent[locale];
      
      // Check vision title
      const visionTitle = page.getByText(content.visionTitle, { exact: false });
      await expect(visionTitle.first()).toBeVisible();
    });

    test(`${locale} displays correct newsletter section`, async ({ page }) => {
      await navigateToLocale(page, locale);
      await waitForLocaleContent(page);
      
      const content = expectedContent[locale];
      
      // Check newsletter title
      const newsletterTitle = page.getByText(content.newsletterTitle, { exact: false });
      await expect(newsletterTitle.first()).toBeVisible();
    });

    test(`${locale} has no untranslated [NEEDS_TRANSLATION] markers`, async ({ page }) => {
      await navigateToLocale(page, locale);
      await waitForLocaleContent(page);
      
      // Check for translation markers
      const translationMarkers = page.getByText('[NEEDS_TRANSLATION]');
      await expect(translationMarkers).toHaveCount(0);
    });

    test(`${locale} has no hardcoded English text (if non-English)`, async ({ page }) => {
      if (locale === 'en') return; // Skip for English

      await navigateToLocale(page, locale);
      await waitForLocaleContent(page);
      
      // Check for common English words that shouldn't appear
      const hardcodedEnglish = [
        'Welcome to QuantumPoly',
        'About Us',
        'Our Vision',
        'Stay in the Loop',
      ];
      
      for (const text of hardcodedEnglish) {
        const element = page.getByText(text, { exact: true });
        await expect(element).toHaveCount(0);
      }
    });
  }

  test('all locales have consistent content structure', async ({ page }) => {
    const structures: Record<string, number> = {};
    
    for (const locale of locales) {
      await navigateToLocale(page, locale);
      await waitForLocaleContent(page);
      
      // Count major sections
      const headingCount = await page.locator('h1, h2, h3').count();
      const sectionCount = await page.locator('section').count();
      
      structures[locale] = headingCount + sectionCount;
    }
    
    // All locales should have similar structure
    const values = Object.values(structures);
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Structure should not vary by more than 2 elements
    expect(max - min).toBeLessThanOrEqual(2);
  });

  test('dynamic content with placeholders renders correctly', async ({ page }) => {
    // If you have dynamic content like "Welcome, {name}"
    // Test that it renders properly in different locales
    
    for (const locale of locales) {
      await navigateToLocale(page, locale);
      await waitForLocaleContent(page);
      
      // Check for proper placeholder rendering
      const bodyText = await page.locator('body').textContent();
      
      // Should not contain raw placeholders like {name}
      expect(bodyText).not.toContain('{name}');
      expect(bodyText).not.toContain('{count}');
      expect(bodyText).not.toContain('{value}');
    }
  });

  test('text direction is appropriate for locale', async ({ page }) => {
    for (const locale of locales) {
      await navigateToLocale(page, locale);
      await waitForLocaleContent(page);
      
      const dir = await page.getAttribute('html', 'dir');
      
      // All current locales are LTR
      // This test will catch RTL issues if/when Arabic is added
      expect(dir).toBe('ltr');
    }
  });

  test('locale-specific formatting is correct', async ({ page }) => {
    // Test that dates, numbers, currencies use locale format
    // This is a placeholder for when you add formatted content
    
    for (const locale of locales) {
      await navigateToLocale(page, locale);
      await waitForLocaleContent(page);
      
      // Example: Check if dates follow expected format
      // German: DD.MM.YYYY, English: MM/DD/YYYY, etc.
      // This will depend on your actual content
      
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).toBeTruthy();
    }
  });

  test('images have proper alt text in each locale', async ({ page }) => {
    for (const locale of locales) {
      await navigateToLocale(page, locale);
      await waitForLocaleContent(page);
      
      // Get all images
      const images = page.locator('img');
      const count = await images.count();
      
      // Check that all images have alt text
      for (let i = 0; i < count; i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    }
  });

  test('forms have localized labels and placeholders', async ({ page }) => {
    for (const locale of locales) {
      await navigateToLocale(page, locale);
      await waitForLocaleContent(page);
      
      // Check email input (newsletter form)
      const emailInput = page.locator('input[type="email"]');
      
      if (await emailInput.count() > 0) {
        const placeholder = await emailInput.first().getAttribute('placeholder');
        
        // Placeholder should exist and not be in English for non-English locales
        expect(placeholder).toBeTruthy();
        
        if (locale !== 'en') {
          expect(placeholder?.toLowerCase()).not.toContain('example.com');
        }
      }
    }
  });

  test('error messages are localized', async ({ page }) => {
    for (const locale of locales) {
      await navigateToLocale(page, locale);
      await waitForLocaleContent(page);
      
      // Try to trigger a validation error (e.g., invalid email)
      const emailInput = page.locator('input[type="email"]');
      const submitButton = page.locator('button[type="submit"]');
      
      if (await emailInput.count() > 0 && await submitButton.count() > 0) {
        await emailInput.first().fill('invalid-email');
        await submitButton.first().click();
        
        // Wait for error message
        await page.waitForTimeout(500);
        
        // Error message should not be in English for non-English locales
        const bodyText = await page.locator('body').textContent();
        
        if (locale !== 'en') {
          // Should not contain English error text
          expect(bodyText).not.toContain('Please enter a valid email');
        }
      }
    }
  });

  test('no mixed language content within same section', async ({ page }) => {
    for (const locale of locales) {
      await navigateToLocale(page, locale);
      await waitForLocaleContent(page);
      
      // This is a smoke test - actual implementation would need linguistic analysis
      // For now, just verify key content is present
      const content = expectedContent[locale];
      const bodyText = await page.locator('body').textContent() || '';
      
      // Check that locale-specific content is present
      expect(bodyText.includes(content.heroTitle.substring(0, 10))).toBe(true);
    }
  });
});

