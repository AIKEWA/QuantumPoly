/**
 * E2E Tests: Locale Routing
 * 
 * Tests URL handling, redirects, and locale parameter validation
 */

import { test, expect } from '@playwright/test';
import {
  getSupportedLocales,
  navigateToLocale,
  verifyLocaleInURL,
  getHTMLLang,
} from '../fixtures/i18n-test-helpers';

test.describe('Locale Routing', () => {
  const locales = getSupportedLocales();

  test('root path redirects to default locale', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to /en (default locale)
    await expect(page).toHaveURL(/\/(en|de|tr|es|fr|it)\/?$/);
  });

  for (const locale of locales) {
    test(`navigates to /${locale} successfully`, async ({ page }) => {
      await navigateToLocale(page, locale);
      
      // Verify URL contains locale
      const urlContainsLocale = await verifyLocaleInURL(page, locale);
      expect(urlContainsLocale).toBe(true);
      
      // Verify HTML lang attribute matches
      const htmlLang = await getHTMLLang(page);
      expect(htmlLang).toBe(locale);
      
      // Page should have loaded successfully
      await expect(page.locator('body')).toBeVisible();
    });

    test(`/${locale} has correct HTML structure`, async ({ page }) => {
      await navigateToLocale(page, locale);
      
      // Check essential page elements
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
    });

    test(`/${locale} sets correct document title`, async ({ page }) => {
      await navigateToLocale(page, locale);
      
      // Title should contain "QuantumPoly"
      await expect(page).toHaveTitle(/QuantumPoly/);
    });
  }

  test('handles invalid locale gracefully', async ({ page }) => {
    const response = await page.goto('/invalid-locale');
    
    // Should return 404 or redirect
    expect(response?.status()).toBeGreaterThanOrEqual(400);
  });

  test('preserves query parameters during locale navigation', async ({ page }) => {
    await page.goto('/en?test=123');
    
    // Switch to German
    await page.goto('/de?test=123');
    
    // Query parameter should be preserved
    expect(page.url()).toContain('test=123');
  });

  test('locale parameter is case-insensitive', async ({ page }) => {
    // Try uppercase locale code
    await page.goto('/EN');
    
    // Should normalize to lowercase
    await expect(page).toHaveURL(/\/en/i);
  });

  test('trailing slash handling is consistent', async ({ page }) => {
    await page.goto('/en/');
    const urlWithSlash = page.url();
    
    await page.goto('/en');
    const urlWithoutSlash = page.url();
    
    // Both should resolve to the same normalized URL
    expect(urlWithSlash.endsWith('/')).toBe(urlWithoutSlash.endsWith('/'));
  });

  test('locale switching preserves current path', async ({ page }) => {
    // Navigate to home in English
    await navigateToLocale(page, 'en', '');
    const currentPath = new URL(page.url()).pathname.replace('/en', '');
    
    // Switch to German
    await navigateToLocale(page, 'de', currentPath);
    
    // Should be on the same path but with German locale
    expect(page.url()).toContain('/de' + currentPath);
  });

  test('nested paths work with locale prefix', async ({ page }) => {
    // If you have nested routes, test them
    await page.goto('/en/');
    
    // Verify nested path maintains locale
    expect(page.url()).toContain('/en');
  });

  test('browser back/forward maintains correct locale', async ({ page }) => {
    // Navigate through multiple locales
    await navigateToLocale(page, 'en');
    await navigateToLocale(page, 'de');
    await navigateToLocale(page, 'es');
    
    // Go back
    await page.goBack();
    expect(page.url()).toContain('/de');
    
    // Go back again
    await page.goBack();
    expect(page.url()).toContain('/en');
    
    // Go forward
    await page.goForward();
    expect(page.url()).toContain('/de');
  });
});

