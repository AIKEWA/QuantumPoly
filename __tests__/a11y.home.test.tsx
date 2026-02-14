/**
 * Accessibility Test: Home Page
 *
 * Tests the full Home page render tree for WCAG 2.2 AA compliance
 * using jest-axe automated accessibility checks.
 *
 * Scope: Full page including Hero, About, Vision, Newsletter, Footer
 * Evidence: Zero violations required for CI pass
 */

import { axe } from 'jest-axe';

import Home from '@/app/[locale]/page';

import { loadMessages, renderWithProviders } from '../test/utils/a11y-test-helpers';

jest.mock('next-intl/server', () => ({
  getRequestConfig: jest.fn(),
  getMessages: async () => ({}),
  getTranslations: async (namespace: string) => (key: string) => `${namespace}.${key}`,
}));

describe('A11y: Home Page', () => {
  it('has no axe violations with full render tree', async () => {
    // Load real translations for authentic render
    const messages = await loadMessages('en');

    const home = await Home({ params: Promise.resolve({ locale: 'en' }) });
    const { container } = await renderWithProviders(home, {
      locale: 'en',
      messages,
    });

    // Run axe accessibility audit
    const results = await axe(container, {
      rules: {
        // Ensure critical WCAG rules are enabled
        'color-contrast': { enabled: true },
        'heading-order': { enabled: true },
        'label': { enabled: true },
        'landmark-one-main': { enabled: true },
        'region': { enabled: true },
      },
    });

    expect(results).toHaveNoViolations();
  });

  it('maintains accessibility with different locales', async () => {
    const messages = await loadMessages('de');
    const home = await Home({ params: Promise.resolve({ locale: 'de' }) });
    const { container } = await renderWithProviders(home, {
      locale: 'de',
      messages,
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
