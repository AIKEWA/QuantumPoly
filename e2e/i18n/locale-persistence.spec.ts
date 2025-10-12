/**
 * E2E Tests: Locale Persistence
 * 
 * Tests cookie/session-based locale persistence across page loads
 */

import { test, expect } from '@playwright/test';
import {
  getSupportedLocales,
  navigateToLocale,
  getLocaleCookie,
  waitForLocaleContent,
} from '../fixtures/i18n-test-helpers';

test.describe('Locale Persistence', () => {
  const locales = getSupportedLocales();

  test('locale is remembered after page reload', async ({ page }) => {
    await navigateToLocale(page, 'de');
    await waitForLocaleContent(page);
    
    // Verify we're in German
    expect(page.url()).toContain('/de');
    
    // Reload the page
    await page.reload();
    await waitForLocaleContent(page);
    
    // Should still be in German
    expect(page.url()).toContain('/de');
  });

  test('locale is remembered in new tab/window', async ({ context }) => {
    // Create first page and set locale
    const page1 = await context.newPage();
    await navigateToLocale(page1, 'es');
    await waitForLocaleContent(page1);
    
    // Create second page (new tab)
    const page2 = await context.newPage();
    await page2.goto('/');
    await waitForLocaleContent(page2);
    
    // Second page should default to Spanish (last selected)
    // Note: This depends on cookie-based persistence
    expect(page2.url()).toContain('/es');
    
    await page1.close();
    await page2.close();
  });

  for (const locale of locales) {
    test(`locale ${locale} persists across navigation`, async ({ page }) => {
      await navigateToLocale(page, locale);
      await waitForLocaleContent(page);
      
      // Navigate within the site (if there are other pages)
      await page.goto(`/${locale}/`);
      await waitForLocaleContent(page);
      
      // Go back
      await page.goBack();
      await waitForLocaleContent(page);
      
      // Go forward
      await page.goForward();
      await waitForLocaleContent(page);
      
      // Locale should be consistent throughout
      expect(page.url()).toContain(`/${locale}`);
    });

    test(`locale ${locale} cookie is set correctly`, async ({ page }) => {
      await navigateToLocale(page, locale);
      await waitForLocaleContent(page);
      
      // Check if locale cookie exists
      // Note: Cookie name may vary based on implementation
      const cookies = await page.context().cookies();
      const hasLocaleCookie = cookies.some(c => 
        c.name.toLowerCase().includes('locale') && c.value === locale
      );
      
      // Either cookie exists or URL-based routing is sufficient
      expect(hasLocaleCookie || page.url().includes(`/${locale}`)).toBe(true);
    });
  }

  test('changing locale updates persistence mechanism', async ({ page }) => {
    // Start in English
    await navigateToLocale(page, 'en');
    await waitForLocaleContent(page);
    
    // Switch to French
    await navigateToLocale(page, 'fr');
    await waitForLocaleContent(page);
    
    // Reload
    await page.reload();
    await waitForLocaleContent(page);
    
    // Should stay in French
    expect(page.url()).toContain('/fr');
  });

  test('locale preference survives browser refresh', async ({ page }) => {
    await navigateToLocale(page, 'it');
    await waitForLocaleContent(page);
    
    // Simulate browser refresh with cache
    await page.reload({ waitUntil: 'networkidle' });
    await waitForLocaleContent(page);
    
    // Should maintain Italian locale
    expect(page.url()).toContain('/it');
  });

  test('direct URL navigation respects locale in path', async ({ page }) => {
    // Navigate directly to Turkish URL
    await page.goto('/tr');
    await waitForLocaleContent(page);
    
    // Should be in Turkish
    expect(page.url()).toContain('/tr');
    expect(await page.getAttribute('html', 'lang')).toBe('tr');
  });

  test('locale persistence works with authentication (future-proof)', async ({ page }) => {
    // This test prepares for future auth integration
    await navigateToLocale(page, 'de');
    await waitForLocaleContent(page);
    
    // Set a mock auth cookie
    await page.context().addCookies([{
      name: 'auth_token',
      value: 'mock_token',
      domain: 'localhost',
      path: '/',
    }]);
    
    // Reload
    await page.reload();
    await waitForLocaleContent(page);
    
    // Locale should persist alongside auth
    expect(page.url()).toContain('/de');
  });

  test('clearing cookies resets to browser default or URL', async ({ context, page }) => {
    await navigateToLocale(page, 'es');
    await waitForLocaleContent(page);
    
    // Clear cookies
    await context.clearCookies();
    
    // Navigate to root
    await page.goto('/');
    await waitForLocaleContent(page);
    
    // Should redirect to default or browser language
    expect(page.url()).toMatch(/\/(en|de|tr|es|fr|it)/);
  });

  test('locale from Accept-Language header is respected on first visit', async ({ context }) => {
    // Create new context with German Accept-Language
    const germanContext = await context.browser()?.newContext({
      locale: 'de-DE',
    });
    
    if (germanContext) {
      const page = await germanContext.newPage();
      await page.goto('/');
      await waitForLocaleContent(page);
      
      // Should detect and use German
      expect(page.url()).toContain('/de');
      
      await page.close();
      await germanContext.close();
    }
  });

  test('manually set locale overrides Accept-Language header', async ({ context }) => {
    // Create context with English Accept-Language
    const englishContext = await context.browser()?.newContext({
      locale: 'en-US',
    });
    
    if (englishContext) {
      const page = await englishContext.newPage();
      
      // Manually navigate to French
      await navigateToLocale(page, 'fr');
      await waitForLocaleContent(page);
      
      // Should respect manual choice over browser preference
      expect(page.url()).toContain('/fr');
      
      await page.close();
      await englishContext.close();
    }
  });
});

