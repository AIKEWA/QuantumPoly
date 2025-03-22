import { test, expect, Page } from '@playwright/test';
import { locales, defaultLocale } from '../src/i18n';

test.describe('Redirect Loop Fix Tests', () => {
  async function clearAllCookies(page: Page) {
    await page.context().clearCookies();
  }
  
  async function getCookieValue(page: Page, name: string): Promise<string | null> {
    const cookies = await page.context().cookies();
    const cookie = cookies.find(c => c.name === name);
    return cookie ? cookie.value : null;
  }

  async function collectRedirectLogs(page: Page, duration: number = 2000): Promise<string[]> {
    const logs: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('middleware') || text.includes('redirect')) {
        logs.push(text);
      }
    });
    
    // Wait for the specified duration to collect logs
    await page.waitForTimeout(duration);
    
    return logs;
  }

  // Test that root path doesn't enter a redirect loop
  test('should not enter redirect loop when visiting root path', async ({ page }) => {
    await clearAllCookies(page);
    
    // Start collecting logs
    const logs = await collectRedirectLogs(page, 0); // Start collecting but don't wait yet
    
    // Visit root path - this should trigger one redirect to the locale path
    await page.goto('/');
    
    // Wait for any potential redirects to happen
    await page.waitForTimeout(1000);
    
    // Get the current URL which should be a locale path
    const currentUrl = page.url();
    const urlPath = new URL(currentUrl).pathname;
    const segments = urlPath.split('/').filter(Boolean);
    
    // Check that we've been redirected to a locale path
    expect(locales).toContain(segments[0]);
    
    // Now navigate back to root
    await page.goto('/');
    
    // Wait to collect logs and potential redirects
    await page.waitForTimeout(1000);
    
    // Check if we were redirected again
    const finalUrl = page.url();
    
    // Check that we don't get a repeated redirect
    const justRedirectedCookie = await getCookieValue(page, 'just-redirected');
    const redirectLogs = (await collectRedirectLogs(page, 0)).filter(log => 
      log.includes('redirect') && !log.includes('no-redirect-needed')
    );
    
    // If just-redirected cookie is present, we shouldn't have multiple redirects
    if (justRedirectedCookie) {
      // If cookie is present, we should see the "skipping further redirects" message
      const skipRedirectMsg = redirectLogs.some(log => 
        log.includes('skipping further redirects')
      );
      expect(skipRedirectMsg).toBeTruthy();
    }
    
    // The final URL should be stable - if we visit it again, no more redirects
    const startUrl = page.url();
    await page.reload();
    await page.waitForTimeout(500);
    expect(page.url()).toBe(startUrl);
  });
  
  // Test that the fix doesn't break normal localization
  test('should still properly redirect to locale path after cookie expires', async ({ page }) => {
    await clearAllCookies(page);
    
    // Visit root path to get redirected to locale path
    await page.goto('/');
    
    // Wait for the just-redirected cookie to expire
    // Since we set it to expire after a few seconds, wait longer
    await page.waitForTimeout(6000);
    
    // Now visit root again
    await page.goto('/');
    
    // Ensure we get redirected to a locale path
    const urlPath = new URL(page.url()).pathname;
    const segments = urlPath.split('/').filter(Boolean);
    
    // Should be redirected to a locale path
    expect(locales).toContain(segments[0]);
  });
}); 