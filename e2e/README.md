# End-to-End Tests

## Overview

This directory contains Playwright-based end-to-end tests for the QuantumPoly platform, with comprehensive i18n testing coverage.

---

## Test Structure

```
e2e/
├── i18n/                          # i18n-specific tests
│   ├── locale-routing.spec.ts     # URL handling and redirects
│   ├── locale-switching.spec.ts   # Language switcher functionality
│   ├── locale-persistence.spec.ts # Cookie/session persistence
│   ├── content-verification.spec.ts # Translation verification
│   ├── seo-meta.spec.ts          # SEO meta tags and hreflang
│   └── rtl-layout.spec.ts        # RTL layout support
├── fixtures/
│   └── i18n-test-helpers.ts      # Shared test utilities
└── README.md                      # This file
```

---

## Running Tests

### All E2E Tests

```bash
npm run test:e2e
```

### i18n Tests Only

```bash
npm run test:e2e:i18n
```

### Interactive UI Mode

```bash
npm run test:e2e:ui
```

### Specific Test File

```bash
npx playwright test e2e/i18n/locale-routing.spec.ts
```

### Debug Mode

```bash
npx playwright test --debug
```

### Headed Mode (See Browser)

```bash
npx playwright test --headed
```

### Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

---

## Test Coverage

### Locale Routing (`locale-routing.spec.ts`)

Tests URL handling and navigation:

- ✅ Root path redirects to default locale
- ✅ Direct locale navigation
- ✅ Invalid locale handling
- ✅ Query parameter preservation
- ✅ Browser back/forward navigation
- ✅ Case-insensitive locale codes

### Locale Switching (`locale-switching.spec.ts`)

Tests language switcher behavior:

- ✅ Language switcher visibility
- ✅ All locales available in switcher
- ✅ Switching between all locale pairs
- ✅ Current locale indication
- ✅ Keyboard navigation
- ✅ ARIA labels and accessibility
- ✅ Content updates on switch

### Locale Persistence (`locale-persistence.spec.ts`)

Tests locale memory across sessions:

- ✅ Locale persists after reload
- ✅ Locale persists in new tabs
- ✅ Locale persists across navigation
- ✅ Cookie-based persistence
- ✅ Direct URL navigation
- ✅ Accept-Language header detection

### Content Verification (`content-verification.spec.ts`)

Tests translation quality and display:

- ✅ Correct content per locale
- ✅ No untranslated markers
- ✅ No hardcoded English text
- ✅ Consistent content structure
- ✅ Proper placeholder rendering
- ✅ Localized form labels
- ✅ Localized error messages

### SEO Meta Tags (`seo-meta.spec.ts`)

Tests SEO-related i18n features:

- ✅ Correct `lang` attribute
- ✅ Correct `dir` attribute
- ✅ Localized meta title
- ✅ Localized meta description
- ✅ Canonical URLs with locale
- ✅ hreflang tags for all locales
- ✅ Open Graph tags
- ✅ Twitter Card tags
- ✅ Robots meta tags

### RTL Layout (`rtl-layout.spec.ts`)

Tests RTL infrastructure readiness:

- ✅ LTR direction for current locales
- ✅ `dir` attribute set correctly
- ✅ Logical properties usage
- ✅ Layout doesn't break with RTL simulation
- ✅ Icons remain properly oriented
- ✅ Form layouts are correct
- ✅ No horizontal overflow

---

## Test Helpers

### Available Utilities

```typescript
import {
  getSupportedLocales,
  navigateToLocale,
  verifyLocaleInURL,
  getHTMLLang,
  getHTMLDir,
  switchLocale,
  verifyContentForLocale,
  getLocaleCookie,
  waitForLocaleContent,
  expectedContent,
} from '../fixtures/i18n-test-helpers';
```

### Usage Example

```typescript
import { test, expect } from '@playwright/test';
import { navigateToLocale, getHTMLLang } from '../fixtures/i18n-test-helpers';

test('navigates to German locale', async ({ page }) => {
  await navigateToLocale(page, 'de');
  
  const htmlLang = await getHTMLLang(page);
  expect(htmlLang).toBe('de');
});
```

---

## Configuration

### Playwright Config

Located at: `playwright.config.ts`

**Key settings:**
- Base URL: `http://localhost:3000`
- Browsers: Chromium, Firefox, WebKit
- Mobile: Pixel 5, iPhone 12
- Parallel execution: Enabled
- Retries on CI: 2
- Dev server: Starts automatically

### Supported Locales

Tests automatically adapt to locales defined in `src/i18n.ts`:

```typescript
export const locales = ['en', 'de', 'tr', 'es', 'fr', 'it'] as const;
```

---

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { navigateToLocale } from '../fixtures/i18n-test-helpers';

test.describe('Feature Name', () => {
  test('specific behavior', async ({ page }) => {
    await navigateToLocale(page, 'en');
    
    // Your test assertions
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

### Testing All Locales

```typescript
import { getSupportedLocales } from '../fixtures/i18n-test-helpers';

const locales = getSupportedLocales();

for (const locale of locales) {
  test(`feature works in ${locale}`, async ({ page }) => {
    await navigateToLocale(page, locale);
    // Test assertions
  });
}
```

### Locale Switching Test

```typescript
test('switches from en to de', async ({ page }) => {
  await navigateToLocale(page, 'en');
  
  // Click German option
  await page.locator('option[value="de"]').click();
  await page.waitForURL('**/de/**');
  
  expect(page.url()).toContain('/de');
});
```

---

## CI/CD Integration

### GitHub Actions

Tests run automatically in CI via `.github/workflows/e2e-tests.yml`:

- ✅ Runs on PR and push to main/develop
- ✅ Tests across 3 browsers (sharded)
- ✅ Dedicated i18n test job
- ✅ Mobile device testing
- ✅ Artifacts uploaded on failure

### Running Locally Like CI

```bash
CI=true npm run test:e2e
```

---

## Debugging

### Visual Debug Mode

```bash
npx playwright test --debug
```

Opens Playwright Inspector with:
- Step-by-step execution
- Console logs
- Network requests
- Screenshots
- DOM snapshots

### Screenshots on Failure

Automatically captured and saved to `test-results/`

### Trace Viewer

```bash
npx playwright show-trace test-results/trace.zip
```

---

## Performance

### Test Execution Time

- Full suite: ~10-15 minutes (parallel)
- i18n tests only: ~3-5 minutes
- Single locale test: ~30 seconds

### Optimization Tips

1. **Run in headed mode sparingly** - Slows down tests
2. **Use test.describe.serial** - For dependent tests
3. **Parallelize when possible** - Independent tests
4. **Reuse authentication** - Share auth state
5. **Mock external APIs** - Faster and more reliable

---

## Troubleshooting

### Test Timeout

```
Error: Test timeout of 30000ms exceeded
```

**Solution:** Increase timeout or optimize test

```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ...
});
```

---

### Element Not Found

```
Error: locator.click: Target closed
```

**Solution:** Add wait conditions

```typescript
await page.waitForLoadState('networkidle');
await page.waitForSelector('button', { state: 'visible' });
```

---

### Flaky Tests

**Solutions:**
1. Add explicit waits
2. Use `waitForLocaleContent()` helper
3. Check network requests
4. Increase retries in config

---

## Best Practices

### 1. Use Test Helpers

```typescript
// ❌ Bad
await page.goto('/en');

// ✅ Good
await navigateToLocale(page, 'en');
await waitForLocaleContent(page);
```

### 2. Descriptive Test Names

```typescript
// ❌ Bad
test('test locale', async ({ page }) => { ... });

// ✅ Good
test('locale persists after page reload', async ({ page }) => { ... });
```

### 3. Independent Tests

```typescript
// ❌ Bad - Tests depend on each other
test('step 1', () => { /* sets up state */ });
test('step 2', () => { /* depends on step 1 */ });

// ✅ Good - Each test is independent
test('complete scenario', () => {
  // Setup, execute, assert all in one test
});
```

### 4. Clean Assertions

```typescript
// ❌ Bad
expect(await page.locator('h1').textContent()).toBe('Title');

// ✅ Good
await expect(page.locator('h1')).toHaveText('Title');
```

---

## Resources

### Documentation

- [Playwright Docs](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)

### Internal Guides

- [Translation Workflow](../docs/TRANSLATION_WORKFLOW.md)
- [i18n Guide](../docs/I18N_GUIDE.md)
- [RTL Implementation](../docs/RTL_IMPLEMENTATION_GUIDE.md)

---

**Last Updated:** 2025-10-12
**Maintained By:** Frontend Architecture Team

