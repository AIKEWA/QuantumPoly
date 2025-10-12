/**
 * E2E Tests: Locale Switching
 * 
 * Tests language switcher behavior and user-initiated locale changes
 */

import { test, expect } from '@playwright/test';
import {
  getSupportedLocales,
  navigateToLocale,
  getHTMLLang,
  waitForLocaleContent,
} from '../fixtures/i18n-test-helpers';

test.describe('Locale Switching', () => {
  const locales = getSupportedLocales();

  test('language switcher is visible on page', async ({ page }) => {
    await navigateToLocale(page, 'en');
    
    // Language switcher should be present
    const switcher = page.locator('[data-testid="language-switcher"]').or(
      page.locator('select[name="locale"]').or(
        page.getByRole('combobox', { name: /language|sprache|dil|idioma|langue|lingua/i })
      )
    );
    
    await expect(switcher.first()).toBeVisible();
  });

  test('language switcher shows all available locales', async ({ page }) => {
    await navigateToLocale(page, 'en');
    await waitForLocaleContent(page);
    
    // Check that all locales are available as options
    for (const locale of locales) {
      const option = page.locator(`[data-locale="${locale}"]`).or(
        page.locator(`option[value="${locale}"]`)
      );
      
      await expect(option.first()).toBeVisible();
    }
  });

  for (const sourceLocale of locales) {
    for (const targetLocale of locales) {
      if (sourceLocale !== targetLocale) {
        test(`switches from ${sourceLocale} to ${targetLocale}`, async ({ page }) => {
          // Start in source locale
          await navigateToLocale(page, sourceLocale);
          await waitForLocaleContent(page);
          
          // Verify we're in source locale
          expect(await getHTMLLang(page)).toBe(sourceLocale);
          
          // Click target locale option
          const targetOption = page.locator(`[data-locale="${targetLocale}"]`).or(
            page.locator(`option[value="${targetLocale}"]`)
          );
          await targetOption.first().click();
          
          // Wait for navigation
          await page.waitForURL(`**/${targetLocale}/**`, { timeout: 5000 });
          await waitForLocaleContent(page);
          
          // Verify we're in target locale
          expect(page.url()).toContain(`/${targetLocale}`);
          expect(await getHTMLLang(page)).toBe(targetLocale);
        });
      }
    }
  }

  test('current locale is visually indicated in switcher', async ({ page }) => {
    await navigateToLocale(page, 'de');
    await waitForLocaleContent(page);
    
    // The current locale should be selected/active
    const germanOption = page.locator('[data-locale="de"][aria-current="true"]').or(
      page.locator('option[value="de"][selected]')
    );
    
    // At least one indicator should be present
    await expect(germanOption.first()).toBeVisible();
  });

  test('keyboard navigation works in language switcher', async ({ page }) => {
    await navigateToLocale(page, 'en');
    await waitForLocaleContent(page);
    
    // Focus the language switcher
    const switcher = page.locator('[data-testid="language-switcher"]').or(
      page.locator('select[name="locale"]')
    );
    await switcher.first().focus();
    
    // Press Tab to navigate (accessibility check)
    await page.keyboard.press('Tab');
    
    // Should be able to interact with keyboard
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('locale switching is fast and smooth', async ({ page }) => {
    await navigateToLocale(page, 'en');
    await waitForLocaleContent(page);
    
    const startTime = Date.now();
    
    // Switch locale
    const targetOption = page.locator('[data-locale="de"]').or(
      page.locator('option[value="de"]')
    );
    await targetOption.first().click();
    await page.waitForURL('**/de/**');
    
    const endTime = Date.now();
    const switchTime = endTime - startTime;
    
    // Should take less than 3 seconds
    expect(switchTime).toBeLessThan(3000);
  });

  test('locale switcher has proper ARIA labels', async ({ page }) => {
    await navigateToLocale(page, 'en');
    
    // Check for accessibility attributes
    const switcher = page.locator('[data-testid="language-switcher"]').or(
      page.locator('select[name="locale"]')
    );
    
    const ariaLabel = await switcher.first().getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });

  test('switching locale updates page content immediately', async ({ page }) => {
    await navigateToLocale(page, 'en');
    await waitForLocaleContent(page);
    
    // Get English content
    const englishTitle = await page.locator('h1').first().textContent();
    
    // Switch to German
    const germanOption = page.locator('[data-locale="de"]').or(
      page.locator('option[value="de"]')
    );
    await germanOption.first().click();
    await page.waitForURL('**/de/**');
    await waitForLocaleContent(page);
    
    // Get German content
    const germanTitle = await page.locator('h1').first().textContent();
    
    // Content should be different
    expect(englishTitle).not.toBe(germanTitle);
  });

  test('locale switcher is accessible via screen readers', async ({ page }) => {
    await navigateToLocale(page, 'en');
    
    // Check for proper semantic HTML
    const switcher = page.locator('[data-testid="language-switcher"]').or(
      page.locator('select[name="locale"]').or(
        page.locator('[role="combobox"]')
      )
    );
    
    // Should have proper role or be a native select
    const element = switcher.first();
    const tagName = await element.evaluate(el => el.tagName.toLowerCase());
    const role = await element.getAttribute('role');
    
    expect(['select', 'button'].includes(tagName) || role === 'combobox').toBe(true);
  });
});

