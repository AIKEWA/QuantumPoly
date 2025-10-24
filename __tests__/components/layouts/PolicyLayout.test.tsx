import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { PolicyLayout } from '@/components/layouts/PolicyLayout';
import type { TocItem } from '@/lib/policies/extract-toc';
import type { PolicyMetadata } from '@/lib/policies/policy-schema';

import { assertHeadingOrder } from '@/__tests__/utils/assert-heading-order';

describe('PolicyLayout', () => {
  const mockMetadata: PolicyMetadata = {
    title: 'Test Policy',
    summary: 'This is a test policy summary',
    status: 'published',
    owner: 'Test Team <test@example.com>',
    lastReviewed: '2025-10-13',
    nextReviewDue: '2026-01-13',
    version: 'v1.0.0',
  };

  const mockToc: TocItem[] = [
    { id: 'section-one', text: 'Section One', level: 2 },
    { id: 'section-two', text: 'Section Two', level: 2 },
    { id: 'subsection', text: 'Subsection', level: 3 },
  ];

  it('should render policy metadata', () => {
    render(
      <PolicyLayout metadata={mockMetadata}>
        <p>Policy content</p>
      </PolicyLayout>
    );

    expect(screen.getByText('Test Policy')).toBeInTheDocument();
    expect(screen.getByText('This is a test policy summary')).toBeInTheDocument();
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    expect(screen.getByText('Test Team <test@example.com>')).toBeInTheDocument();
  });

  it('should render children content', () => {
    render(
      <PolicyLayout metadata={mockMetadata}>
        <p>Test policy content here</p>
      </PolicyLayout>
    );

    expect(screen.getByText('Test policy content here')).toBeInTheDocument();
  });

  it('should render status badge', () => {
    render(
      <PolicyLayout metadata={mockMetadata}>
        <p>Content</p>
      </PolicyLayout>
    );

    expect(screen.getByText('Published')).toBeInTheDocument();
  });

  it('should render different status badges', () => {
    const statuses: Array<{ status: PolicyMetadata['status']; expected: string }> = [
      { status: 'draft', expected: 'Draft' },
      { status: 'in-progress', expected: 'In Progress' },
      { status: 'published', expected: 'Published' },
    ];

    statuses.forEach(({ status, expected }) => {
      const { unmount } = render(
        <PolicyLayout metadata={{ ...mockMetadata, status }}>
          <p>Content</p>
        </PolicyLayout>
      );

      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });

  it('should render version pill', () => {
    render(
      <PolicyLayout metadata={mockMetadata}>
        <p>Content</p>
      </PolicyLayout>
    );

    const versionElement = screen.getByText('v1.0.0');
    expect(versionElement).toBeInTheDocument();
    expect(versionElement).toHaveAttribute('aria-label', 'Version v1.0.0');
  });

  it('should render last reviewed date', () => {
    render(
      <PolicyLayout metadata={mockMetadata}>
        <p>Content</p>
      </PolicyLayout>
    );

    expect(screen.getByText('Last Reviewed')).toBeInTheDocument();
    // Date format uses Intl.DateTimeFormat with 'medium' style
    const dateElement = screen.getByText('Oct 13, 2025');
    expect(dateElement).toBeInTheDocument();
  });

  it('should render next review due date', () => {
    render(
      <PolicyLayout metadata={mockMetadata}>
        <p>Content</p>
      </PolicyLayout>
    );

    expect(screen.getByText('Next Review Due')).toBeInTheDocument();
    // Date format uses Intl.DateTimeFormat with 'medium' style
    const dateElement = screen.getByText('Jan 13, 2026');
    expect(dateElement).toBeInTheDocument();
  });

  it('should render fallback banner when isFallback is true', () => {
    render(
      <PolicyLayout metadata={mockMetadata} isFallback={true}>
        <p>Content</p>
      </PolicyLayout>
    );

    expect(screen.getByText(/Translation in progress/)).toBeInTheDocument();
    expect(screen.getByText(/Showing English content for now/)).toBeInTheDocument();
  });

  it('should not render fallback banner when isFallback is false', () => {
    render(
      <PolicyLayout metadata={mockMetadata} isFallback={false}>
        <p>Content</p>
      </PolicyLayout>
    );

    expect(screen.queryByText(/Translation in progress/)).not.toBeInTheDocument();
  });

  it('should not render fallback banner by default', () => {
    render(
      <PolicyLayout metadata={mockMetadata}>
        <p>Content</p>
      </PolicyLayout>
    );

    expect(screen.queryByText(/Translation in progress/)).not.toBeInTheDocument();
  });

  it('should render table of contents when provided', () => {
    render(
      <PolicyLayout metadata={mockMetadata} toc={mockToc}>
        <p>Content</p>
      </PolicyLayout>
    );

    expect(screen.getByText('On This Page')).toBeInTheDocument();
    expect(screen.getByText('Section One')).toBeInTheDocument();
    expect(screen.getByText('Section Two')).toBeInTheDocument();
    expect(screen.getByText('Subsection')).toBeInTheDocument();
  });

  it('should not render TOC when not provided', () => {
    render(
      <PolicyLayout metadata={mockMetadata}>
        <p>Content</p>
      </PolicyLayout>
    );

    expect(screen.queryByText('On This Page')).not.toBeInTheDocument();
  });

  it('should not render TOC when empty', () => {
    render(
      <PolicyLayout metadata={mockMetadata} toc={[]}>
        <p>Content</p>
      </PolicyLayout>
    );

    expect(screen.queryByText('On This Page')).not.toBeInTheDocument();
  });

  it('should render TOC links with correct hrefs', () => {
    render(
      <PolicyLayout metadata={mockMetadata} toc={mockToc}>
        <p>Content</p>
      </PolicyLayout>
    );

    const link1 = screen.getByText('Section One').closest('a');
    const link2 = screen.getByText('Section Two').closest('a');
    const link3 = screen.getByText('Subsection').closest('a');

    expect(link1).toHaveAttribute('href', '#section-one');
    expect(link2).toHaveAttribute('href', '#section-two');
    expect(link3).toHaveAttribute('href', '#subsection');
  });

  it('should have semantic HTML structure', () => {
    const { container } = render(
      <PolicyLayout metadata={mockMetadata}>
        <p>Content</p>
      </PolicyLayout>
    );

    expect(container.querySelector('header')).toBeInTheDocument();
    expect(container.querySelector('main')).toBeInTheDocument();
    expect(container.querySelector('footer')).toBeInTheDocument();
  });

  it('should have skip to main content link', () => {
    render(
      <PolicyLayout metadata={mockMetadata}>
        <p>Content</p>
      </PolicyLayout>
    );

    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('should have accessible ARIA labels', () => {
    render(
      <PolicyLayout metadata={mockMetadata} toc={mockToc}>
        <p>Content</p>
      </PolicyLayout>
    );

    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('aria-labelledby', 'page-title');

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Table of contents');
  });

  it('should render policy metadata in footer', () => {
    render(
      <PolicyLayout metadata={mockMetadata}>
        <p>Content</p>
      </PolicyLayout>
    );

    // Footer should show version and last reviewed date, not legal disclaimer
    expect(screen.getByText(/Policy version v1.0.0/)).toBeInTheDocument();
    expect(screen.queryByText(/informational purposes only/)).not.toBeInTheDocument();
    expect(screen.queryByText(/does not constitute legal advice/)).not.toBeInTheDocument();
  });

  it('should use proper heading hierarchy', () => {
    const { container } = render(
      <PolicyLayout metadata={mockMetadata}>
        <p>Content</p>
      </PolicyLayout>
    );

    const h1 = container.querySelector('h1');
    expect(h1).toBeInTheDocument();
    expect(h1).toHaveAttribute('id', 'page-title');
    expect(h1?.textContent).toBe('Test Policy');
  });

  it('should show review overdue badge when past due date', () => {
    const pastDue = new Date();
    pastDue.setDate(pastDue.getDate() - 30);
    const overdueMeta = {
      ...mockMetadata,
      nextReviewDue: pastDue.toISOString().split('T')[0],
    };

    render(
      <PolicyLayout metadata={overdueMeta}>
        <p>Content</p>
      </PolicyLayout>
    );

    expect(screen.getByText(/Review overdue/)).toBeInTheDocument();
    expect(screen.getByText(/please review this page/)).toBeInTheDocument();
  });

  it('should not show review overdue badge when date is in future', () => {
    render(
      <PolicyLayout metadata={mockMetadata}>
        <p>Content</p>
      </PolicyLayout>
    );

    expect(screen.queryByText(/Review overdue/)).not.toBeInTheDocument();
  });

  it('should format dates according to locale', () => {
    render(
      <PolicyLayout metadata={mockMetadata} locale="de">
        <p>Content</p>
      </PolicyLayout>
    );

    // German locale uses format like "13.10.2025" (appears in multiple places)
    const dateElements = screen.getAllByText(/13\.10\.2025/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('should default to English locale when not specified', () => {
    render(
      <PolicyLayout metadata={mockMetadata}>
        <p>Content</p>
      </PolicyLayout>
    );

    // English locale uses format like "Oct 13, 2025"
    expect(screen.getByText('Oct 13, 2025')).toBeInTheDocument();
  });
});

