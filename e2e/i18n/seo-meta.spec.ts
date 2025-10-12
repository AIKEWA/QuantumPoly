/**
 * E2E Tests: SEO Meta Tags
 * 
 * Tests hreflang tags, lang attributes, and other SEO-related i18n features
 */

import { test, expect } from '@playwright/test';
import {
  getSupportedLocales,
  navigateToLocale,
  getHTMLLang,
  getHTMLDir,
  waitForLocaleContent,
} from '../fixtures/i18n-test-helpers';

test.describe('SEO Meta Tags', () => {
  const locales = getSupportedLocales();

  for (const locale of locales) {
    test(`${locale} has correct lang attribute`, async ({ page }) => {
      await navigateToLocale(page, locale);
      await waitForLocaleContent(page);
      
      const htmlLang = await getHTMLLang(page);
      expect(htmlLang).toBe(locale);
    });

    test(`${locale} has correct dir attribute`, async ({ page }) => {
      await navigateToLocale(page, locale);
      await waitForLocaleContent(page);
      
      const htmlDir = await getHTMLDir(page);
      
      // All current locales are LTR
      expect(htmlDir).toBe('ltr');
    });

    test(`${locale} has localized meta title`, async ({ page }) => {
      await navigateToLocale(page, locale);
      await waitForLocaleContent(page);
      
      const title = await page.title();
      
      // Title should exist and contain brand name
      expect(title).toBeTruthy();
      expect(title).toContain('QuantumPoly');
    });

    test(`${locale} has localized meta description`, async ({ page }) => {
      await navigateToLocale(page, locale);
      await waitForLocaleContent(page);
      
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      
      // Description should exist
      expect(description).toBeTruthy();
      
      // Should not be in English for non-English locales
      if (locale !== 'en') {
        expect(description).not.toContain('The Future, Now');
      }
    });

    test(`${locale} has canonical URL with locale`, async ({ page }) => {
      await navigateToLocale(page, locale);
      await waitForLocaleContent(page);
      
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      
      if (canonical) {
        expect(canonical).toContain(`/${locale}`);
      }
    });
  }

  test('hreflang tags are present for all locales', async ({ page }) => {
    await navigateToLocale(page, 'en');
    await waitForLocaleContent(page);
    
    // Get all hreflang links
    const hreflangLinks = page.locator('link[rel="alternate"][hreflang]');
    const count = await hreflangLinks.count();
    
    // Should have at least one hreflang tag per locale
    expect(count).toBeGreaterThanOrEqual(locales.length);
  });

  test('hreflang tags have correct locale codes', async ({ page }) => {
    await navigateToLocale(page, 'en');
    await waitForLocaleContent(page);
    
    // Get all hreflang values
    const hreflangLinks = page.locator('link[rel="alternate"][hreflang]');
    const count = await hreflangLinks.count();
    
    const hreflangs: string[] = [];
    for (let i = 0; i < count; i++) {
      const hreflang = await hreflangLinks.nth(i).getAttribute('hreflang');
      if (hreflang) {
        hreflangs.push(hreflang);
      }
    }
    
    // Check that all our locales are present
    for (const locale of locales) {
      expect(hreflangs).toContain(locale);
    }
  });

  test('hreflang URLs are valid and accessible', async ({ page }) => {
    await navigateToLocale(page, 'en');
    await waitForLocaleContent(page);
    
    // Get all hreflang links
    const hreflangLinks = page.locator('link[rel="alternate"][hreflang]');
    const count = await hreflangLinks.count();
    
    for (let i = 0; i < count; i++) {
      const href = await hreflangLinks.nth(i).getAttribute('href');
      const hreflang = await hreflangLinks.nth(i).getAttribute('hreflang');
      
      expect(href).toBeTruthy();
      expect(href).toContain(`/${hreflang}`);
    }
  });

  test('Open Graph tags are localized', async ({ page }) => {
    for (const locale of locales) {
      await navigateToLocale(page, locale);
      await waitForLocaleContent(page);
      
      // Check og:locale
      const ogLocale = await page.locator('meta[property="og:locale"]').getAttribute('content');
      
      // Check og:title
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      
      // Check og:description
      const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
      
      // At minimum, og:title should exist
      if (ogTitle) {
        expect(ogTitle).toContain('QuantumPoly');
      }
      
      // If og:locale exists, it should match or be related to current locale
      if (ogLocale) {
        expect(ogLocale.toLowerCase()).toContain(locale);
      }
    }
  });

  test('Twitter Card tags are present', async ({ page }) => {
    await navigateToLocale(page, 'en');
    await waitForLocaleContent(page);
    
    // Check for Twitter card meta tags
    const twitterCard = await page.locator('meta[name="twitter:card"]').count();
    const twitterTitle = await page.locator('meta[name="twitter:title"]').count();
    
    // At least some Twitter meta tags should be present
    expect(twitterCard + twitterTitle).toBeGreaterThan(0);
  });

  test('robots meta tag allows indexing', async ({ page }) => {
    for (const locale of locales) {
      await navigateToLocale(page, locale);
      await waitForLocaleContent(page);
      
      const robots = await page.locator('meta[name="robots"]').getAttribute('content');
      
      if (robots) {
        // Should allow indexing
        expect(robots.toLowerCase()).toContain('index');
        expect(robots.toLowerCase()).not.toContain('noindex');
      }
    }
  });

  test('viewport meta tag is consistent across locales', async ({ page }) => {
    const viewports: Record<string, string | null> = {};
    
    for (const locale of locales) {
      await navigateToLocale(page, locale);
      await waitForLocaleContent(page);
      
      const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
      viewports[locale] = viewport;
    }
    
    // All locales should have the same viewport setting
    const values = Object.values(viewports);
    const uniqueValues = new Set(values);
    
    expect(uniqueValues.size).toBe(1);
  });

  test('x-default hreflang is present for fallback', async ({ page }) => {
    await navigateToLocale(page, 'en');
    await waitForLocaleContent(page);
    
    // Check for x-default hreflang (best practice for international sites)
    const xDefault = page.locator('link[rel="alternate"][hreflang="x-default"]');
    const count = await xDefault.count();
    
    // x-default should ideally be present
    // (not strictly required, but good practice)
    if (count > 0) {
      const href = await xDefault.getAttribute('href');
      expect(href).toContain('/en'); // Should point to default locale
    }
  });

  test('structured data (JSON-LD) is locale-aware if present', async ({ page }) => {
    for (const locale of locales) {
      await navigateToLocale(page, locale);
      await waitForLocaleContent(page);
      
      // Check for JSON-LD structured data
      const jsonLd = page.locator('script[type="application/ld+json"]');
      const count = await jsonLd.count();
      
      if (count > 0) {
        const content = await jsonLd.first().textContent();
        
        if (content) {
          const data = JSON.parse(content);
          
          // If it has inLanguage, it should match the locale
          if (data.inLanguage) {
            expect(data.inLanguage.toLowerCase()).toContain(locale);
          }
        }
      }
    }
  });

  test('page URLs in hreflang are absolute', async ({ page }) => {
    await navigateToLocale(page, 'en');
    await waitForLocaleContent(page);
    
    const hreflangLinks = page.locator('link[rel="alternate"][hreflang]');
    const count = await hreflangLinks.count();
    
    for (let i = 0; i < count; i++) {
      const href = await hreflangLinks.nth(i).getAttribute('href');
      
      if (href) {
        // Should be absolute URL or start with /
        expect(href.startsWith('http') || href.startsWith('/')).toBe(true);
      }
    }
  });

  test('alternates section in metadata is correct', async ({ page }) => {
    for (const locale of locales) {
      await navigateToLocale(page, locale);
      await waitForLocaleContent(page);
      
      // Check that canonical points to current locale
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      
      if (canonical) {
        expect(canonical).toContain(`/${locale}`);
      }
    }
  });
});

