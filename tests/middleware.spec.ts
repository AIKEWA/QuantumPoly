import { test, expect, Page } from '@playwright/test';
import { locales, defaultLocale } from '../src/i18n';

test.describe('Middleware Behavior', () => {
  async function clearAllCookies(page: Page) {
    await page.context().clearCookies();
  }
  
  async function getCookieValue(page: Page, name: string): Promise<string | null> {
    const cookies = await page.context().cookies();
    const cookie = cookies.find(c => c.name === name);
    return cookie ? cookie.value : null;
  }

  // Test root-to-locale redirection
  test('should redirect from root to detected locale', async ({ page }) => {
    await clearAllCookies(page);
    
    // Go to root and expect redirection
    await page.goto('/');
    
    // Check that we were redirected (not the same URL)
    expect(page.url()).not.toEqual('http://localhost:3000/');
    
    // URL should contain a valid locale
    const currentPath = new URL(page.url()).pathname;
    const firstSegment = currentPath.split('/')[1];
    expect(locales).toContain(firstSegment);
    
    // Redirect count cookie should be set to 1
    const redirectCount = await getCookieValue(page, 'redirect-count');
    expect(redirectCount).toBe('1');
    
    // Preferred locale cookie should be set
    const preferredLocale = await getCookieValue(page, 'preferred-locale');
    expect(locales).toContain(preferredLocale);
  });
  
  // Test no redirect loop when accessing locale directly
  test('should NOT redirect when accessing a locale path directly', async ({ page }) => {
    await clearAllCookies(page);
    
    // Access locale path directly
    const targetLocale = locales[0];
    await page.goto(`/${targetLocale}`);
    
    // Store initial URL
    const initialUrl = page.url();
    
    // Wait a moment to see if any redirects happen
    await page.waitForTimeout(1000);
    
    // URL should remain unchanged
    expect(page.url()).toEqual(initialUrl);
    
    // Confirm we're still on the locale path
    const currentPath = new URL(page.url()).pathname;
    expect(currentPath).toBe(`/${targetLocale}`);
    
    // Redirect count should be reset to 0
    const redirectCount = await getCookieValue(page, 'redirect-count');
    expect(redirectCount).toBe('0');
    
    // Preferred locale cookie should be set
    const preferredLocale = await getCookieValue(page, 'preferred-locale');
    expect(preferredLocale).toBe(targetLocale);
  });
  
  // Test proper cookie handling during redirection
  test('should not get stuck in redirect loop', async ({ page }) => {
    await clearAllCookies(page);
    
    // Force a redirect loop by repeatedly requesting the root
    for (let i = 0; i < 5; i++) {
      await page.goto('/');
      // Wait a bit between requests
      await page.waitForTimeout(200);
    }
    
    // We should eventually land on a locale path with redirect-count reset to 0
    const finalUrl = page.url();
    const finalPath = new URL(finalUrl).pathname;
    const finalLocale = finalPath.split('/')[1];
    
    expect(locales).toContain(finalLocale);
    
    // After landing, redirect count should be 0 or reset
    const redirectCount = await getCookieValue(page, 'redirect-count');
    expect(parseInt(redirectCount || '999')).toBeLessThanOrEqual(3);
  });
  
  // Test forced default locale after MAX_REDIRECTS
  test('should force default locale after too many redirects', async ({ page }) => {
    await clearAllCookies(page);
    
    // Simulate redirect loop by setting redirect-count cookie to MAX_REDIRECTS
    await page.context().addCookies([
      {
        name: 'redirect-count',
        value: '2', // MAX_REDIRECTS in middleware.ts
        domain: 'localhost',
        path: '/',
      }
    ]);
    
    // Visit root page
    await page.goto('/');
    
    // Should redirect to default locale
    const finalUrl = page.url();
    expect(finalUrl).toEqual(`http://localhost:3000/${defaultLocale}`);
    
    // Redirect count should be reset
    const redirectCount = await getCookieValue(page, 'redirect-count');
    expect(redirectCount).toBe('0');
  });
  
  // Test non-root path without locale gets default locale added
  test('should add default locale to non-root paths without locale', async ({ page }) => {
    await clearAllCookies(page);
    
    // Go to a path without locale
    await page.goto('/about');
    
    // Should redirect to /en/about
    const finalUrl = page.url();
    expect(finalUrl).toEqual(`http://localhost:3000/${defaultLocale}/about`);
  });
  
  // Test query parameters are preserved
  test('should preserve query parameters during redirects', async ({ page }) => {
    await clearAllCookies(page);
    
    // Go to root with query params
    await page.goto('/?test=123&foo=bar');
    
    // Check URL contains locale and query params
    const url = new URL(page.url());
    const firstSegment = url.pathname.split('/')[1];
    
    expect(locales).toContain(firstSegment);
    expect(url.searchParams.get('test')).toBe('123');
    expect(url.searchParams.get('foo')).toBe('bar');
  });
});

test.describe('Middleware i18n redirects', () => {
  test('should redirect root path to user\'s preferred locale', async ({ page }) => {
    // Visit the root path
    await page.goto('/');
    
    // Verify we get redirected to a locale path
    const url = page.url();
    expect(url).toMatch(/\/(en|de|tr)$/);
    
    // Add a console log to confirm we're not stuck in a redirect loop
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('middleware')) {
        consoleMessages.push(msg.text());
      }
    });
    
    // Reload page to check if redirect loop is fixed
    await page.reload();
    
    // Wait a moment to ensure page stabilizes 
    await page.waitForTimeout(1000);
    
    // We shouldn't see repeated middleware redirects in the console
    const redirectMessages = consoleMessages.filter(msg => 
      msg.includes('redirect') && !msg.includes('no-redirect-needed')
    );
    
    // Shouldn't have more than 1 redirect after reload
    expect(redirectMessages.length).toBeLessThanOrEqual(1);
  });
  
  test('should not redirect paths that already have valid locale', async ({ page }) => {
    // Visit a page with a locale prefix
    await page.goto('/en/dashboard');
    
    // Get initial URL to compare
    const initialUrl = page.url();
    
    // Add middleware console logging listener
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('middleware')) {
        consoleMessages.push(msg.text());
      }
    });
    
    // Reload to see if middleware handles correctly
    await page.reload();
    
    // Wait a moment to ensure page stabilizes
    await page.waitForTimeout(1000);
    
    // URL should remain the same
    expect(page.url()).toBe(initialUrl);
    
    // We should not see any redirects in console logs
    const redirectMessages = consoleMessages.filter(msg => 
      msg.includes('redirect') && !msg.includes('no-redirect-needed')
    );
    
    // Should be 0 redirects for already-localized paths
    expect(redirectMessages.length).toBe(0);
  });
  
  test('should not infinitely redirect', async ({ page, context }) => {
    // Clear cookies to start fresh
    await context.clearCookies();
    
    // Set up logging
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('middleware')) {
        consoleMessages.push(msg.text());
      }
    });
    
    // Visit a complex nested path without locale prefix
    await page.goto('/products/category/123');
    
    // Wait a moment to ensure page stabilizes
    await page.waitForTimeout(2000);
    
    // Check final URL has locale prefix
    const url = page.url();
    expect(url).toMatch(/\/(en|de|tr)\/products\/category\/123$/);
    
    // Shouldn't see evidence of redirect loops in console
    const redirectCountMessages = consoleMessages.filter(msg => 
      msg.includes('redirect-count')
    );
    
    // Extract redirect counts to verify they don't exceed our threshold
    const redirectCounts = redirectCountMessages.map(msg => {
      const match = msg.match(/Redirect count: (\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    
    // Maximum redirect count should be 1 (initial redirect)
    expect(Math.max(...redirectCounts, 0)).toBeLessThanOrEqual(1);
  });
}); 