# Accessibility CI/CD Instructions (FPP-04.2)

## Overview

To ensure continuous compliance with WCAG 2.1 AA standards, the following automated tests must be executed in the Continuous Integration (CI) pipeline for every Pull Request (PR) and Merge to main.

## Required Pipeline Steps

### 1. E2E Accessibility Suite

**Command:** `npm run test:e2e:a11y`
**Goal:** Verify critical user flows (Review Dashboard, Sign-Off, Policies) are accessible via Playwright + Axe.
**Failure Condition:** Any violation of `critical` or `serious` impact.

```yaml
# Example CI Step
- name: Run E2E Accessibility Tests
  run: npm run test:e2e:a11y
  env:
    CI: true
```

### 2. Unit & component Tests

**Command:** `npm run test:a11y`
**Goal:** Check individual components (using `jest-axe`) for semantic validity and ARIA correctness isolated from the full app context.

### 3. Linter Enforcement (FPP-14)

**Command:** `npm run lint`
**Goal:** Static analysis via `eslint-plugin-jsx-a11y` to catch authoring errors (e.g., missing labels, invalid aria attributes) before build.

## Artifacts & Reporting

- **Playwright Reports:** Ensure `playwright-report/` is uploaded as a CI artifact to debug failures.
- **Lighthouse Scores:** If running `npm run lh:ci`, accessibility scores must remain ≥ 95.

## Reference

- Full testing strategy: [ACCESSIBILITY_TESTING.md](../ACCESSIBILITY_TESTING.md)
- Implementation spec: [FPP-04_ACCESSIBILITY_SPEC.md](./FPP-04_ACCESSIBILITY_SPEC.md)
