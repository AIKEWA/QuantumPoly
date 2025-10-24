# Accessibility Testing Guide

## Overview

This guide documents the accessibility testing strategy for QuantumPoly. Our testing suite ensures WCAG 2.2 AA compliance through automated unit tests, E2E tests, and Lighthouse CI scans with enforced thresholds.

## Accessibility as Ethical Verification

**Accessibility is not a feature—it's a human right encoded in CI.**

At QuantumPoly, accessibility testing serves as **quantifiable moral compliance**. Our automated accessibility enforcement represents a commitment to inclusive design principles that extends beyond legal requirements into ethical territory.

### Why Automated A11y Testing = Ethical Governance

1. **Universal Access as Core Value**
   - WCAG 2.2 AA standards map directly to inclusive design principles
   - Lighthouse score ≥95 demonstrates commitment to universal access
   - Performance ≥90 ensures accessibility for users on slow connections or limited devices

2. **Quantifiable Accountability**
   - JSON artifacts provide auditable evidence of accessibility commitment
   - Reports feed Block 6.5 Public Governance Dashboard for transparency
   - CI enforcement prevents accessibility regressions at code level

3. **Ethical Parity with Business Requirements**
   - Accessibility thresholds enforced with same rigor as SEO (both ≥95)
   - This parity signals that user inclusion equals business priority
   - Failed accessibility checks block deploys—not optional, not negotiable

4. **Evidence Chain for Public Trust**
   - `reports/lighthouse/accessibility.json` persists as ethical evidence
   - Timestamped audits create accountability trail
   - Public dashboard exposes scores—transparency builds trust

### The Four Pillars of Automated Accessibility

| Layer           | Tool                     | Threshold             | Ethical Guarantee                                        |
| --------------- | ------------------------ | --------------------- | -------------------------------------------------------- |
| **Linting**     | `eslint-plugin-jsx-a11y` | Zero violations       | Prevents accessible anti-patterns at authoring time      |
| **Unit Tests**  | `jest-axe`               | Zero violations       | Validates components in isolation with full render trees |
| **E2E Tests**   | `@axe-core/playwright`   | Zero critical/serious | Ensures real-world browser accessibility                 |
| **Performance** | Lighthouse               | A11y ≥95, Perf ≥90    | Confirms inclusive experience at scale                   |

### Accessibility = Inclusive Performance

Performance is an accessibility concern:

- Slow page loads exclude users on 3G connections
- Large JavaScript bundles exclude users on low-end devices
- Poor Core Web Vitals create barriers for users with motor impairments

Our dual threshold (A11y ≥95, Perf ≥90) ensures **performant accessibility**—not just compliant, but usable for all.

## Table of Contents

- [Accessibility as Ethical Verification](#accessibility-as-ethical-verification)
- [Test Coverage](#test-coverage)
- [Running Tests Locally](#running-tests-locally)
- [Understanding Test Results](#understanding-test-results)
- [Common WCAG Violations](#common-wcag-violations)
- [CI Gates and Requirements](#ci-gates-and-requirements)
- [Troubleshooting](#troubleshooting)

## Test Coverage

### 1. Unit Tests (Jest + jest-axe)

**Location:** `__tests__/components/**/*.a11y.test.tsx`

**What's tested:**

- Semantic HTML structure (landmarks: `main`, `header`, `footer`, `nav`)
- Heading hierarchy (no level jumps, single H1)
- ARIA attributes (`aria-expanded`, `aria-labelledby`, `aria-live`)
- Keyboard navigation (tab order, skip links, accordion controls)
- Focus management
- Status announcements for screen readers
- Color contrast (via axe-core)

**Key files:**

- `__tests__/components/layouts/PolicyLayout.a11y.test.tsx` - Policy page layout compliance
- `__tests__/components/faq.a11y.test.tsx` - FAQ accordion accessibility

### 2. E2E Tests (Playwright)

**Location:** `e2e/policies/accessibility.spec.ts`

**What's tested:**

- Policy-specific content (disclaimers on privacy/imprint pages)
- Translation fallback notices (when content unavailable in requested locale)
- Robots meta tags (noindex for draft/in-progress, index for published)
- Rendered landmark structure in real browser
- Heading hierarchy in fully hydrated pages
- Skip link functionality
- Cross-locale consistency

### 3. Lighthouse CI

**Location:** `lighthouserc.json`

**What's tested:**

- Automated WCAG AA rule checking across multiple routes
- Performance impact of accessibility features
- Color contrast at scale
- SEO metadata

**Tested routes:**

- `/en` (landing page)
- `/en/privacy`, `/en/ethics`, `/en/gep` (policy pages)
- `/de/privacy`, `/de/ethics` (localized policy pages)

**Threshold:** Accessibility score ≥ 95%

## Running Tests Locally

### Prerequisites

```bash
npm install
```

### Run All Accessibility Tests

```bash
# 1. ESLint jsx-a11y checks
npm run lint

# 2. Jest-axe unit tests (Home, PolicyLayout, Footer)
npm run test:a11y

# 3. Playwright axe E2E tests (requires production build)
npm run build
npm run start &
npm run test:e2e:a11y

# 4. Lighthouse audit (A11y ≥95, Perf ≥90)
npm run lh:a11y
```

### Quick Validation (Pre-commit)

Run all checks in sequence:

```bash
npm run lint && \
npm run test:a11y && \
npm run build && \
npm run start & \
sleep 5 && \
npm run lh:a11y && \
npm run test:e2e:a11y
```

### Run Individual Test Suites

```bash
# PolicyLayout accessibility tests
npm test -- PolicyLayout.a11y.test.tsx

# FAQ accessibility tests
npm test -- faq.a11y.test.tsx

# E2E policy tests
npx playwright test e2e/policies/accessibility.spec.ts

# Lighthouse with UI
npx lhci autorun --config=lighthouserc.json
```

### Debug Mode

```bash
# Jest with watch mode
npm run test:a11y -- --watch

# Playwright with UI
npx playwright test e2e/policies --ui

# Playwright debug mode
PWDEBUG=1 npx playwright test e2e/policies
```

## Understanding Test Results

### Jest-axe Violations

When jest-axe detects violations, you'll see output like:

```
Expected the HTML found at $('button') to have no violations:

<button>Click me</button>

Received:

button-name (serious)
  Ensures buttons have discernible text
  Help: https://dequeuniversity.com/rules/axe/4.4/button-name

Fix any of the following:
  Element does not have inner text that is visible to screen readers
  aria-label attribute does not exist or is empty
```

**How to fix:**

1. Add descriptive text inside the button
2. Or add `aria-label="descriptive text"`
3. Or use `aria-labelledby` to reference another element

### Playwright Test Failures

E2E test failures typically indicate:

```
Error: expect(received).toContain(expected)

Expected substring: "informational"
Received string: "..."
```

**How to fix:**

1. Verify the expected content exists in the markdown source
2. Check if content is being stripped during rendering
3. Ensure the page has fully loaded before assertion

### Lighthouse Score Below Threshold

```
Assertion failed. Expected a score of at least 0.95, got 0.92.
```

**Common causes:**

- Missing alt text on images
- Insufficient color contrast
- Missing ARIA labels on interactive elements
- Improper heading hierarchy

**How to investigate:**

1. Open `lighthouse-reports/` directory
2. Find the `.html` report for the failing route
3. Review specific violations listed
4. Fix issues in source code
5. Re-run `npm run lh:a11y`

## Common WCAG Violations

### 1. Missing Heading Hierarchy

❌ **Bad:**

```tsx
<h1>Page Title</h1>
<h3>Section</h3>  {/* Skipped h2 */}
```

✅ **Good:**

```tsx
<h1>Page Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>
```

### 2. Unlabeled Regions

❌ **Bad:**

```tsx
<section role="region">
  <h2>Content</h2>
</section>
```

✅ **Good:**

```tsx
<section role="region" aria-labelledby="section-heading">
  <h2 id="section-heading">Content</h2>
</section>
```

### 3. Missing ARIA on Interactive Elements

❌ **Bad:**

```tsx
<button onClick={toggle}>
  Show More
</button>
<div>{content}</div>
```

✅ **Good:**

```tsx
<button
  onClick={toggle}
  aria-expanded={isOpen}
  aria-controls="content-panel"
>
  Show More
</button>
<div id="content-panel" hidden={!isOpen}>
  {content}
</div>
```

### 4. Insufficient Color Contrast

❌ **Bad:**

```tsx
<p className="text-gray-400">Important text</p>
```

✅ **Good:**

```tsx
<p className="text-text">Important text</p>
```

Use semantic color tokens from `tailwind.config.js` that guarantee WCAG AA contrast.

### 5. Missing Alt Text

❌ **Bad:**

```tsx
<img src="/logo.png" />
```

✅ **Good:**

```tsx
<img src="/logo.png" alt="QuantumPoly logo" />
```

## CI Gates and Requirements

### Pull Request Checks

All PRs must pass the **Accessibility Compliance** workflow:

1. ✅ Unit tests with jest-axe (no violations)
2. ✅ E2E tests for policy pages (disclaimers, fallbacks, robots meta)
3. ✅ Lighthouse CI (all routes ≥ 95% accessibility score)

### Viewing CI Results

**On GitHub:**

1. Navigate to your PR
2. Check the "Checks" tab
3. Click "Accessibility Compliance"
4. Download artifacts for detailed reports:
   - `lighthouse-reports/` - HTML reports with scores and violations
   - `playwright-report/` - E2E test results with screenshots

### Local Pre-commit Validation

Before pushing, run:

```bash
npm run test:a11y && npm run build && npm run start & npm run lh:a11y
```

This mirrors the CI checks and catches issues early.

## Troubleshooting

### Issue: jest-axe times out

**Symptom:** Tests hang or timeout after 5 seconds.

**Fix:**

```tsx
it('should have no violations', async () => {
  const { container } = render(<MyComponent />);
  await waitFor(
    async () => {
      await assertNoViolations(container);
    },
    { timeout: 10000 },
  );
});
```

### Issue: Playwright can't find element

**Symptom:** `Error: locator.click: Target closed`

**Fix:**

- Add explicit waits: `await page.waitForLoadState('networkidle')`
- Increase timeout: `await expect(element).toBeVisible({ timeout: 10000 })`
- Check if element is behind modal or offscreen

### Issue: Lighthouse score varies between runs

**Symptom:** Score is 96% locally but 94% in CI.

**Fix:**

- Lighthouse scores can vary ±2% due to timing
- Run multiple iterations: `numberOfRuns: 3` in `lighthouserc.json`
- Use median score for stability
- Set threshold slightly below target (0.95 instead of 0.97)

### Issue: False positive for color contrast

**Symptom:** Axe reports contrast violation on white text with transparent background.

**Fix:**

```tsx
// Explicitly set background color
<div className="bg-surface text-text">Content with proper contrast</div>
```

### Issue: Nested interactive elements

**Symptom:** `nested-interactive` violation for button inside link.

**Fix:**

```tsx
// ❌ Bad
<a href="/page">
  <button>Click</button>
</a>

// ✅ Good - Use one interactive element
<a href="/page" className="button-style">
  Click
</a>
```

## Best Practices

### 1. Test at Component Level

Write accessibility tests alongside functional tests:

```tsx
describe('MyComponent', () => {
  it('should render correctly', () => {
    /* ... */
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<MyComponent />);
    await assertNoViolations(container);
  });
});
```

### 2. Use Semantic HTML First

Prefer native HTML elements over ARIA when possible:

```tsx
// ✅ Better - native semantics
<button onClick={...}>Click</button>

// ⚠️ Acceptable but unnecessary
<div role="button" onClick={...}>Click</div>
```

### 3. Provide Context for Screen Readers

```tsx
<button aria-label="Close navigation menu">
  <svg>...</svg> {/* Visual X icon */}
</button>
```

### 4. Test with Real Assistive Technology

While automated tests catch ~40% of issues:

- Test with NVDA/JAWS (Windows)
- Test with VoiceOver (macOS/iOS)
- Test with keyboard only (no mouse)

### 5. Document Accessibility Decisions

When implementing complex patterns:

```tsx
/**
 * Custom disclosure widget following WAI-ARIA Authoring Practices.
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 */
```

## Resources

- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [jest-axe Documentation](https://github.com/nickcolley/jest-axe)
- [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
- [Lighthouse Accessibility Audits](https://developer.chrome.com/docs/lighthouse/accessibility/)
- [Deque axe DevTools](https://www.deque.com/axe/devtools/)

## Contributing

When adding new components or pages:

1. Write accessibility tests first (TDD approach)
2. Use semantic HTML and ARIA landmarks
3. Ensure keyboard navigation works
4. Run `npm run test:a11y` before committing
5. Add to Lighthouse test routes if user-facing

For questions or issues, contact the Trust & Safety team or open a GitHub issue with the `accessibility` label.
