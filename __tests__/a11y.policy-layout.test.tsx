/**
 * Accessibility Test: PolicyLayout
 *
 * Tests the PolicyLayout component for WCAG 2.2 AA compliance
 * with table of contents, metadata, and content hierarchy.
 *
 * Scope: Full layout including header, main content, TOC sidebar, footer
 * Evidence: Zero violations required for CI pass
 */

import { axe } from 'jest-axe';

import { PolicyLayout } from '@/components/layouts/PolicyLayout';
import type { TocItem } from '@/lib/policies/extract-toc';
import type { PolicyMetadata } from '@/lib/policies/policy-schema';

import { renderWithProvidersSync } from '../test/utils/a11y-test-helpers';

describe('A11y: PolicyLayout', () => {
  const mockMetadata: PolicyMetadata = {
    title: 'Privacy Policy',
    summary: 'How we handle your data with care and transparency',
    status: 'published',
    owner: 'Legal Team',
    lastReviewed: '2024-01-15',
    nextReviewDue: '2025-01-15',
    version: 'v2.1.0',
  };

  const mockToc: TocItem[] = [
    { id: 'section-1', text: 'Introduction', level: 2 },
    { id: 'section-2', text: 'Data Collection', level: 2 },
    { id: 'section-2-1', text: 'Personal Information', level: 3 },
    { id: 'section-3', text: 'Your Rights', level: 2 },
  ];

  const mockContent = (
    <>
      <h2 id="section-1">Introduction</h2>
      <p>
        This privacy policy explains how QuantumPoly collects, uses, and protects your personal
        data.
      </p>

      <h2 id="section-2">Data Collection</h2>
      <p>We collect data to provide you with better services.</p>

      <h3 id="section-2-1">Personal Information</h3>
      <p>We may collect your name, email address, and usage patterns.</p>

      <h2 id="section-3">Your Rights</h2>
      <p>You have the right to access, modify, or delete your data at any time.</p>
    </>
  );

  it('has no axe violations with full layout and TOC', async () => {
    const { container } = renderWithProvidersSync(
      <PolicyLayout metadata={mockMetadata} toc={mockToc}>
        {mockContent}
      </PolicyLayout>,
    );

    const results = await axe(container, {
      rules: {
        // Ensure critical WCAG rules are enabled
        'heading-order': { enabled: true },
        'landmark-one-main': { enabled: true },
        'region': { enabled: true },
        'skip-link': { enabled: true },
      },
    });

    expect(results).toHaveNoViolations();
  });

  it('maintains accessibility without TOC', async () => {
    const { container } = renderWithProvidersSync(
      <PolicyLayout metadata={mockMetadata}>{mockContent}</PolicyLayout>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('maintains accessibility with fallback notice', async () => {
    const { container } = renderWithProvidersSync(
      <PolicyLayout metadata={mockMetadata} toc={mockToc} isFallback={true}>
        {mockContent}
      </PolicyLayout>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('maintains accessibility with overdue review status', async () => {
    const overdueMetadata: PolicyMetadata = {
      ...mockMetadata,
      nextReviewDue: '2020-01-01', // Past date
    };

    const { container } = renderWithProvidersSync(
      <PolicyLayout metadata={overdueMetadata} toc={mockToc}>
        {mockContent}
      </PolicyLayout>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper semantic structure', async () => {
    const { getByRole } = renderWithProvidersSync(
      <PolicyLayout metadata={mockMetadata} toc={mockToc}>
        {mockContent}
      </PolicyLayout>,
    );

    // Verify semantic landmarks
    expect(getByRole('main')).toBeInTheDocument();
    expect(getByRole('navigation', { name: /table of contents/i })).toBeInTheDocument();

    // Verify skip link
    expect(getByRole('link', { name: /skip to main content/i })).toBeInTheDocument();

    // Verify heading hierarchy
    expect(getByRole('heading', { level: 1, name: mockMetadata.title })).toBeInTheDocument();
    expect(getByRole('heading', { level: 2, name: /on this page/i })).toBeInTheDocument();
  });
});

