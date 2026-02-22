import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for QuantumPoly
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use */
  reporter: process.env.CI
    ? [['html'], ['github']]
    : [['html'], ['list']],
  
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',
    
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: isCI
      ? "bash -lc 'lsof -ti tcp:3000 | xargs -r kill -9 || true; npm run build && npx next start -p 3000'"
      : 'npm run dev -- --port 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: !isCI,
    timeout: 180_000,
  },
});
