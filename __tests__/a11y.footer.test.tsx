/**
 * Accessibility Test: Footer
 *
 * Tests the Footer component for WCAG 2.2 AA compliance
 * with navigation links, social links, and proper labeling.
 *
 * Scope: Footer navigation, branding, links, landmarks
 * Evidence: Zero violations required for CI pass
 */

import { axe } from 'jest-axe';

import { Footer } from '@/components/Footer';

import { renderWithProvidersSync } from '../test/utils/a11y-test-helpers';

describe('A11y: Footer', () => {
  const defaultProps = {
    brand: 'QuantumPoly',
    tagline: 'Advancing AI for humanity',
    copyright: '© 2024 QuantumPoly. All rights reserved.',
    socialLinks: [
      { label: 'GitHub', href: 'https://github.com/quantumpoly' },
      { label: 'Twitter', href: 'https://twitter.com/quantumpoly' },
      { label: 'LinkedIn', href: 'https://linkedin.com/company/quantumpoly' },
    ],
    policyLinks: [
      { label: 'Ethics', href: '/en/ethics' },
      { label: 'Privacy Policy', href: '/en/privacy' },
      { label: 'Imprint', href: '/en/imprint' },
      { label: 'Good Electronic Practices', href: '/en/gep' },
    ],
    policyNavLabel: 'Trust & Legal',
    headingLevel: 2 as const,
  };

  it('has no axe violations with complete props', async () => {
    const { container } = renderWithProvidersSync(<Footer {...defaultProps} />);

    const results = await axe(container, {
      rules: {
        // Ensure link accessibility
        'link-name': { enabled: true },
        'landmark-unique': { enabled: true },
        'region': { enabled: true },
      },
    });

    expect(results).toHaveNoViolations();
  });

  it('maintains accessibility with minimal props', async () => {
    const minimalProps = {
      brand: 'QuantumPoly',
      tagline: 'Advancing AI',
      copyright: '© 2024',
      socialLinks: [],
      policyLinks: [],
      policyNavLabel: 'Legal',
      headingLevel: 2 as const,
    };

    const { container } = renderWithProvidersSync(<Footer {...minimalProps} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper semantic structure and navigation', async () => {
    const { getByRole, getAllByRole } = renderWithProvidersSync(<Footer {...defaultProps} />);

    // Verify contentinfo landmark (footer)
    expect(getByRole('contentinfo')).toBeInTheDocument();

    // Verify navigation regions
    const navElements = getAllByRole('navigation');
    expect(navElements.length).toBeGreaterThanOrEqual(1);

    // Verify all links are accessible
    const links = getAllByRole('link');
    links.forEach((link) => {
      // Each link should have accessible name
      expect(link).toHaveAccessibleName();
      // Each link should have valid href
      expect(link).toHaveAttribute('href');
    });
  });

  it('social links have proper labels', async () => {
    const { getByRole } = renderWithProvidersSync(<Footer {...defaultProps} />);

    // Verify each social link is accessible by its label
    expect(getByRole('link', { name: /GitHub/i })).toBeInTheDocument();
    expect(getByRole('link', { name: /Twitter/i })).toBeInTheDocument();
    expect(getByRole('link', { name: /LinkedIn/i })).toBeInTheDocument();
  });

  it('policy links are properly grouped and labeled', async () => {
    const { getByRole } = renderWithProvidersSync(<Footer {...defaultProps} />);

    // Verify navigation with proper label
    expect(getByRole('navigation', { name: defaultProps.policyNavLabel })).toBeInTheDocument();

    // Verify policy links are accessible
    expect(getByRole('link', { name: 'Ethics' })).toBeInTheDocument();
    expect(getByRole('link', { name: 'Privacy Policy' })).toBeInTheDocument();
    expect(getByRole('link', { name: 'Imprint' })).toBeInTheDocument();
    expect(getByRole('link', { name: 'Good Electronic Practices' })).toBeInTheDocument();
  });

  it('maintains accessibility with different heading levels', async () => {
    const propsWithH3 = {
      ...defaultProps,
      headingLevel: 3 as const,
    };

    const { container } = renderWithProvidersSync(<Footer {...propsWithH3} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
