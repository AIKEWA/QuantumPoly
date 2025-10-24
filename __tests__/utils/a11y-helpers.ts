/**
 * Accessibility Testing Utilities
 * 
 * Helpers for consistent accessibility testing across the test suite.
 * Uses jest-axe for automated WCAG 2.2 AA compliance checks.
 */

import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import type { ReactElement } from 'react';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

/**
 * Render a component and run axe accessibility scan.
 * 
 * @param ui - React component to render
 * @returns Render result and axe scan results
 * 
 * @example
 * ```ts
 * const { container, axeResults } = await renderWithA11y(<MyComponent />);
 * expect(axeResults).toHaveNoViolations();
 * ```
 */
export async function renderWithA11y(ui: ReactElement) {
  const renderResult = render(ui);
  const axeResults = await axe(renderResult.container);
  
  return {
    ...renderResult,
    axeResults,
  };
}

/**
 * Assert that a container has no accessibility violations.
 * Wrapper around jest-axe's toHaveNoViolations for cleaner assertions.
 * 
 * Note: Disables color-contrast checks in JSDOM since it doesn't support canvas.
 * Color contrast should be validated in E2E tests or with Lighthouse.
 * 
 * @param container - DOM container to test
 * 
 * @example
 * ```ts
 * const { container } = render(<MyComponent />);
 * await assertNoViolations(container);
 * ```
 */
export async function assertNoViolations(container: HTMLElement): Promise<void> {
  const results = await axe(container, {
    rules: {
      // Disable color-contrast in JSDOM (no canvas support)
      'color-contrast': { enabled: false },
    },
  });
  expect(results).toHaveNoViolations();
}

/**
 * Extract all ARIA landmarks from a container.
 * Useful for validating landmark structure.
 * 
 * @param container - DOM container to search
 * @returns Array of landmark elements with their roles
 * 
 * @example
 * ```ts
 * const landmarks = getLandmarks(container);
 * expect(landmarks).toContainEqual({ role: 'main', element: expect.any(HTMLElement) });
 * ```
 */
export function getLandmarks(container: HTMLElement): Array<{
  role: string;
  element: HTMLElement;
  label?: string;
}> {
  const landmarkRoles = [
    'banner',
    'complementary',
    'contentinfo',
    'form',
    'main',
    'navigation',
    'region',
    'search',
  ];

  const landmarks: Array<{ role: string; element: HTMLElement; label?: string }> = [];

  landmarkRoles.forEach((role) => {
    const implicitSelector = getImplicitSelector(role);
    const selector = implicitSelector 
      ? `[role="${role}"], ${implicitSelector}`
      : `[role="${role}"]`;
    
    const elements = container.querySelectorAll(selector);
    elements.forEach((el) => {
      const element = el as HTMLElement;
      const label = element.getAttribute('aria-label') || element.getAttribute('aria-labelledby') || undefined;
      landmarks.push({ role, element, label });
    });
  });

  return landmarks;
}

/**
 * Get CSS selector for elements with implicit ARIA roles.
 */
function getImplicitSelector(role: string): string {
  const implicitSelectors: Record<string, string> = {
    banner: 'header:not([role])',
    contentinfo: 'footer:not([role])',
    main: 'main:not([role])',
    navigation: 'nav:not([role])',
    form: 'form:not([role])',
    search: '[type="search"]:not([role])',
  };

  return implicitSelectors[role] || '';
}

/**
 * Assert that all regions have accessible names (via aria-label or aria-labelledby).
 * WCAG requires regions to be distinguishable for screen reader users.
 * 
 * @param container - DOM container to test
 * 
 * @example
 * ```ts
 * const { container } = render(<MyComponent />);
 * assertRegionsHaveLabels(container);
 * ```
 */
export function assertRegionsHaveLabels(container: HTMLElement): void {
  const regions = container.querySelectorAll('[role="region"], section[role="region"]');
  
  regions.forEach((region) => {
    const hasLabel = 
      region.hasAttribute('aria-label') || 
      region.hasAttribute('aria-labelledby');
    
    expect(hasLabel).toBe(true);
    
    if (region.hasAttribute('aria-labelledby')) {
      const labelId = region.getAttribute('aria-labelledby');
      const labelElement = document.getElementById(labelId!);
      expect(labelElement).toBeTruthy();
    }
  });
}

/**
 * Get all interactive elements in a container.
 * Useful for testing keyboard navigation and focus management.
 * 
 * @param container - DOM container to search
 * @returns Array of interactive elements
 */
export function getInteractiveElements(container: HTMLElement): HTMLElement[] {
  const selector = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
  return Array.from(container.querySelectorAll<HTMLElement>(selector));
}

/**
 * Assert that all images have alt text.
 * 
 * @param container - DOM container to test
 */
export function assertImagesHaveAlt(container: HTMLElement): void {
  const images = container.querySelectorAll('img');
  
  images.forEach((img) => {
    expect(img.hasAttribute('alt')).toBe(true);
  });
}

/**
 * Run axe with custom configuration for specific WCAG levels.
 * 
 * @param container - DOM container to test
 * @param level - WCAG level to test ('A', 'AA', 'AAA')
 * @returns Axe scan results
 * 
 * @example
 * ```ts
 * const results = await runAxeWithLevel(container, 'AA');
 * expect(results).toHaveNoViolations();
 * ```
 */
export async function runAxeWithLevel(
  container: HTMLElement,
  level: 'A' | 'AA' | 'AAA' = 'AA'
) {
  return axe(container, {
    runOnly: {
      type: 'tag',
      values: [`wcag2${level.toLowerCase()}`, `wcag21${level.toLowerCase()}`, `wcag22${level.toLowerCase()}`],
    },
  });
}

