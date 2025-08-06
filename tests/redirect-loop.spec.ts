import { test, expect, Page } from '@playwright/test';
import { locales } from '../src/i18n';

test.describe('Redirect Loop Prevention Tests', () => {
  const REDIRECT_COUNT_COOKIE = 'redirect-count';
  const PREFERRED_LOCALE_COOKIE = 'preferred-locale';
  
  async function clearAllCookies(page: Page) {
    await page.context().clearCookies();
  }
  
  async function getCookieValue(page: Page, name: string): Promise<string | null> {
    const cookies = await page.context().cookies();
    const cookie = cookies.find(c => c.name === name);
    return cookie ? cookie.value : null;
  }

  async function countRedirects(page: Page, startUrl: string, timeout = 3000): Promise<number> {
    let redirectCount = 0;
    const navigationPromise = page.goto(startUrl);
    
    // Set up a listener to count redirects
    page.on('request', request => {
      if (request.isNavigationRequest() && request.url() !== startUrl) {
        redirectCount++;
      }
    });
    
    // Wait for navigation to complete with timeout
    await Promise.race([
      navigationPromise,
      new Promise(resolve => setTimeout(resolve, timeout))
    ]);
    
    return redirectCount;
  }

  test('should not get stuck in an infinite redirect loop', async ({ page }) => {
    await clearAllCookies(page);
    
    // Navigate to the root multiple times
    for (let i = 0; i < 5; i++) {
      await page.goto('/');
      await page.waitForTimeout(200);
    }
    
    // Check that we ended up at a valid locale path
    const finalUrl = page.url();
    const finalPath = new URL(finalUrl).pathname;
    const finalLocale = finalPath.split('/')[1];
    
    expect(locales).toContain(finalLocale);
    
    // Redirect count should be reasonable (not indicative of a loop)
    const redirectCount = await getCookieValue(page, REDIRECT_COUNT_COOKIE);
    const count = parseInt(redirectCount || '0');
    
    // Should never exceed our MAX_REDIRECTS + 1 (defined as 2 in middleware)
    expect(count).toBeLessThanOrEqual(3);
  });

  test('should detect and break redirect loops with MAX_REDIRECTS safety mechanism', async ({ page }) => {
    await clearAllCookies(page);
    
    // Simulate a potential loop by setting a high redirect count
    await page.context().addCookies([
      {
        name: REDIRECT_COUNT_COOKIE,
        value: '10', // Well beyond MAX_REDIRECTS
        domain: 'localhost',
        path: '/',
      }
    ]);
    
    // Navigate to root
    const redirects = await countRedirects(page, '/');
    
    // Should only redirect once to the default locale
    expect(redirects).toBeLessThanOrEqual(1);
    
    // Should have reset the redirect count
    const finalRedirectCount = await getCookieValue(page, REDIRECT_COUNT_COOKIE);
    expect(finalRedirectCount).toBe('0');
  });
  
  test('should not run middleware on already localized paths', async ({ page }) => {
    await clearAllCookies(page);
    
    // Go directly to a localized path
    const locale = locales[0];
    await page.goto(`/${locale}/about`);
    
    // Set up a flag for middleware detection using our debug headers
    let middlewareRan = false;
    page.on('response', response => {
      const headers = response.headers();
      if (headers['x-middleware-debug-path']) {
        middlewareRan = true;
      }
    });
    
    // Navigate to another localized path
    await page.goto(`/${locale}/contact`);
    
    // Middleware should not run again for an already localized path
    // This expectation depends on our debug overlay implementation
    // In a real test, check for the absence of redirection
    expect(middlewareRan).toBe(false);
    
    // Confirm URL has not been changed unexpectedly 
    expect(page.url()).toContain(`/${locale}/contact`);
  });
  
  test('should preserve locale preference during navigation', async ({ page }) => {
    await clearAllCookies(page);
    
    // Visit root to get a locale assigned
    await page.goto('/');
    
    // Get the assigned locale
    const preferredLocale = await getCookieValue(page, PREFERRED_LOCALE_COOKIE);
    expect(locales).toContain(preferredLocale);
    
    // Visit a non-localized path
    await page.goto('/products');
    
    // Should redirect to the same locale path
    const finalUrl = page.url();
    expect(finalUrl).toContain(`/${preferredLocale}/products`);
  });
}); 