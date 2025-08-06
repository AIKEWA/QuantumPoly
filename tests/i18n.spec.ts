import { test, expect } from '@playwright/test';
import { locales, defaultLocale } from '../src/i18n';

test.describe('Internationalization routing', () => {
  test('should redirect from root to locale path', async ({ page }) => {
    // Start navigation and wait for redirect
    const response = await page.goto('/');
    
    // Verify redirect happened
    expect(response?.url()).toContain(`/${defaultLocale}`);
    
    // Expect URL to be /${defaultLocale}
    await expect(page).toHaveURL(new RegExp(`/${defaultLocale}$`));
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'test-results/redirect-from-root.png' });
  });
  
  test('should not redirect when accessing a locale path directly', async ({ page }) => {
    // Access the locale path directly
    const initialUrl = `/${defaultLocale}`;
    await page.goto(initialUrl);
    
    // Wait for any potential redirects
    await page.waitForTimeout(1000);
    
    // URL should remain the same
    await expect(page).toHaveURL(new RegExp(`${initialUrl}$`));
    
    // Log current URL to verify no redirect loop
    console.log(`Current URL: ${page.url()}`);
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'test-results/direct-locale-access.png' });
  });
  
  test('should have locale state in Zustand', async ({ page }) => {
    // Go to the default locale page
    await page.goto(`/${defaultLocale}`);
    
    // Add script to check Zustand store
    const localeState = await page.evaluate(() => {
      // @ts-ignore - window.__ZUSTAND__ would be added by us for testing
      return window.localStorage.getItem('locale-storage');
    });
    
    // Verify locale state exists and contains the right locale
    expect(localeState).toBeTruthy();
    
    if (localeState) {
      const parsedState = JSON.parse(localeState);
      expect(parsedState.state.locale).toBe(defaultLocale);
    }
  });
  
  test('should switch between locales without redirect loops', async ({ page }) => {
    // Start at the default locale
    await page.goto(`/${defaultLocale}`);
    
    // Find a locale switcher (assuming there's a button or link to switch locales)
    // This depends on your UI implementation
    // For example: const localeSwitch = await page.getByRole('button', { name: 'Change language' });
    
    // For the purpose of this test, we'll just navigate to another locale directly
    const alternateLocale = locales.find(locale => locale !== defaultLocale) || locales[1];
    await page.goto(`/${alternateLocale}`);
    
    // Wait for any potential redirects
    await page.waitForTimeout(1000);
    
    // URL should be the new locale
    await expect(page).toHaveURL(new RegExp(`/${alternateLocale}$`));
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'test-results/locale-switch.png' });
  });
}); 