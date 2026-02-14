/**
 * PolicyLayout Accessibility Tests
 * 
 * Validates WCAG 2.2 AA compliance for policy page layouts:
 * - Semantic HTML structure with proper landmarks
 * - Heading hierarchy (no level jumps)
 * - ARIA attributes and live regions
 * - Keyboard navigation and focus management
 * - Automated axe-core scans
 */

import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { PolicyLayout } from '@/components/layouts/PolicyLayout';
import type { TocItem } from '@/lib/policies/extract-toc';
import type { PolicyMetadata } from '@/lib/policies/policy-schema';

import {
  assertNoViolations,
  getLandmarks,
} from '../../utils/a11y-helpers';
import { assertHeadingOrder } from '../../utils/assert-heading-order';

describe('PolicyLayout - Accessibility', () => {
  const nextReviewDue = new Date();
  nextReviewDue.setFullYear(nextReviewDue.getFullYear() + 1);

  const mockMetadata: PolicyMetadata = {
    title: 'Test Policy',
    summary: 'This is a test policy for accessibility validation',
    status: 'published',
    owner: 'Trust & Safety Team <trust@quantumpoly.ai>',
    lastReviewed: '2025-10-13',
    nextReviewDue: nextReviewDue.toISOString().split('T')[0],
    version: 'v1.0.0',
  };

  const mockToc: TocItem[] = [
    { id: 'section-one', text: 'Section One', level: 2 },
    { id: 'section-two', text: 'Section Two', level: 2 },
    { id: 'subsection', text: 'Subsection', level: 3 },
  ];

  describe('Semantic Landmarks', () => {
    it('should render all required ARIA landmarks', () => {
      const { container } = render(
        <PolicyLayout metadata={mockMetadata}>
          <p>Policy content</p>
        </PolicyLayout>
      );

      // Main content landmark
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
      expect(screen.getByRole('main')).toHaveAttribute('aria-labelledby', 'page-title');

      // Footer landmark
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();

      // Verify landmark structure
      const landmarks = getLandmarks(container);
      expect(landmarks.length).toBeGreaterThanOrEqual(2); // main + contentinfo
    });

    it('should render navigation landmark when TOC is provided', () => {
      render(
        <PolicyLayout metadata={mockMetadata} toc={mockToc}>
          <p>Policy content</p>
        </PolicyLayout>
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute('aria-label', 'Table of contents');
    });

    it('should not render navigation landmark when TOC is empty', () => {
      render(
        <PolicyLayout metadata={mockMetadata} toc={[]}>
          <p>Policy content</p>
        </PolicyLayout>
      );

      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });
  });

  describe('Heading Hierarchy', () => {
    it('should have proper heading hierarchy with no level jumps', () => {
      const { container } = render(
        <PolicyLayout metadata={mockMetadata} toc={mockToc}>
          <h2>Main Section</h2>
          <p>Content here</p>
          <h3>Subsection</h3>
          <p>More content</p>
        </PolicyLayout>
      );

      // Should not throw
      expect(() => assertHeadingOrder(container)).not.toThrow();
    });

    it('should have exactly one H1 heading', () => {
      const { container } = render(
        <PolicyLayout metadata={mockMetadata}>
          <h2>Section</h2>
        </PolicyLayout>
      );

      const h1Elements = container.querySelectorAll('h1');
      expect(h1Elements).toHaveLength(1);
      expect(h1Elements[0]).toHaveTextContent('Test Policy');
    });

    it('should have H1 with proper ID for aria-labelledby', () => {
      render(
        <PolicyLayout metadata={mockMetadata}>
          <p>Content</p>
        </PolicyLayout>
      );

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveAttribute('id', 'page-title');
    });

    it('should have H2 in TOC navigation', () => {
      render(
        <PolicyLayout metadata={mockMetadata} toc={mockToc}>
          <p>Content</p>
        </PolicyLayout>
      );

      const tocHeading = screen.getByRole('heading', { name: /on this page/i });
      expect(tocHeading.tagName.toLowerCase()).toBe('h2');
    });
  });

  describe('Fallback Notice', () => {
    it('should render fallback notice with proper ARIA attributes', () => {
      render(
        <PolicyLayout metadata={mockMetadata} isFallback={true}>
          <p>Content</p>
        </PolicyLayout>
      );

      const notice = screen.getByRole('status');
      expect(notice).toBeInTheDocument();
      expect(notice).toHaveAttribute('aria-live', 'polite');
      expect(notice).toHaveTextContent(/translation in progress/i);
      expect(notice).toHaveTextContent(/showing english content/i);
    });

    it('should not render fallback notice when isFallback is false', () => {
      render(
        <PolicyLayout metadata={mockMetadata} isFallback={false}>
          <p>Content</p>
        </PolicyLayout>
      );

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(screen.queryByText(/translation in progress/i)).not.toBeInTheDocument();
    });

    it('should not render fallback notice by default', () => {
      render(
        <PolicyLayout metadata={mockMetadata}>
          <p>Content</p>
        </PolicyLayout>
      );

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  describe('Status Badges and ARIA Labels', () => {
    it('should render status badge with accessible label', () => {
      render(
        <PolicyLayout metadata={mockMetadata}>
          <p>Content</p>
        </PolicyLayout>
      );

      const statusBadge = screen.getByLabelText(/status: published/i);
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveTextContent('Published');
    });

    it('should render version badge with accessible label', () => {
      render(
        <PolicyLayout metadata={mockMetadata}>
          <p>Content</p>
        </PolicyLayout>
      );

      const versionBadge = screen.getByLabelText(/version v1\.0\.0/i);
      expect(versionBadge).toBeInTheDocument();
      expect(versionBadge).toHaveTextContent('v1.0.0');
    });

    it('should render overdue notice with role=status when past due', () => {
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

      const overdueNotice = screen.getByText(/review overdue/i);
      const statusElement = overdueNotice.closest('[role="status"]');
      
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should have skip link for keyboard navigation', () => {
      render(
        <PolicyLayout metadata={mockMetadata}>
          <p>Content</p>
        </PolicyLayout>
      );

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should have accessible TOC links with proper focus targets', () => {
      render(
        <PolicyLayout metadata={mockMetadata} toc={mockToc}>
          <h2 id="section-one">Section One</h2>
          <h2 id="section-two">Section Two</h2>
          <h3 id="subsection">Subsection</h3>
        </PolicyLayout>
      );

      const tocLinks = screen.getAllByRole('link').filter((link) =>
        ['Section One', 'Section Two', 'Subsection'].includes(link.textContent || '')
      );

      expect(tocLinks).toHaveLength(3);
      
      tocLinks.forEach((link) => {
        const href = link.getAttribute('href');
        expect(href).toMatch(/^#/);
      });
    });
  });

  describe('Date Formatting and Accessibility', () => {
    it('should render dates with <time> element and datetime attribute', () => {
      const { container } = render(
        <PolicyLayout metadata={mockMetadata}>
          <p>Content</p>
        </PolicyLayout>
      );

      const timeElements = container.querySelectorAll('time');
      expect(timeElements.length).toBeGreaterThanOrEqual(2); // lastReviewed + nextReviewDue

      timeElements.forEach((timeEl) => {
        expect(timeEl).toHaveAttribute('dateTime');
        expect(timeEl.getAttribute('dateTime')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });
  });

  describe('WCAG Compliance - Automated Scans', () => {
    it('should have no axe violations in default state', async () => {
      const { container } = render(
        <PolicyLayout metadata={mockMetadata}>
          <h2>Section</h2>
          <p>Policy content goes here.</p>
        </PolicyLayout>
      );

      await assertNoViolations(container);
    });

    it('should have no axe violations with TOC', async () => {
      const { container } = render(
        <PolicyLayout metadata={mockMetadata} toc={mockToc}>
          <h2 id="section-one">Section One</h2>
          <p>Content for section one.</p>
          <h2 id="section-two">Section Two</h2>
          <p>Content for section two.</p>
          <h3 id="subsection">Subsection</h3>
          <p>Subsection content.</p>
        </PolicyLayout>
      );

      await assertNoViolations(container);
    });

    it('should have no axe violations with fallback notice', async () => {
      const { container } = render(
        <PolicyLayout metadata={mockMetadata} isFallback={true}>
          <h2>Section</h2>
          <p>Policy content.</p>
        </PolicyLayout>
      );

      await assertNoViolations(container);
    });

    it('should have no axe violations with overdue notice', async () => {
      const pastDue = new Date();
      pastDue.setDate(pastDue.getDate() - 30);
      
      const overdueMeta = {
        ...mockMetadata,
        nextReviewDue: pastDue.toISOString().split('T')[0],
      };

      const { container } = render(
        <PolicyLayout metadata={overdueMeta}>
          <h2>Section</h2>
          <p>Content</p>
        </PolicyLayout>
      );

      await assertNoViolations(container);
    });

    it('should have no axe violations with draft status', async () => {
      const { container } = render(
        <PolicyLayout metadata={{ ...mockMetadata, status: 'draft' }}>
          <h2>Section</h2>
          <p>Content</p>
        </PolicyLayout>
      );

      await assertNoViolations(container);
    });

    it('should have no axe violations with in-progress status', async () => {
      const { container } = render(
        <PolicyLayout metadata={{ ...mockMetadata, status: 'in-progress' }}>
          <h2>Section</h2>
          <p>Content</p>
        </PolicyLayout>
      );

      await assertNoViolations(container);
    });

    it('should have no axe violations with published status', async () => {
      const { container } = render(
        <PolicyLayout metadata={{ ...mockMetadata, status: 'published' }}>
          <h2>Section</h2>
          <p>Content</p>
        </PolicyLayout>
      );

      await assertNoViolations(container);
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('should use semantic color tokens', async () => {
      const { container } = render(
        <PolicyLayout metadata={mockMetadata}>
          <h2>Section</h2>
          <p>Content with sufficient contrast.</p>
        </PolicyLayout>
      );

      // Color contrast is validated in E2E tests and Lighthouse
      // JSDOM doesn't support canvas, so we just verify the structure is valid
      await assertNoViolations(container);
    });
  });

  describe('Metadata Display List', () => {
    it('should use description list for metadata', () => {
      const { container } = render(
        <PolicyLayout metadata={mockMetadata}>
          <p>Content</p>
        </PolicyLayout>
      );

      const dl = container.querySelector('dl');
      expect(dl).toBeInTheDocument();

      const dt = container.querySelectorAll('dt');
      const dd = container.querySelectorAll('dd');

      // Should have matching dt/dd pairs
      expect(dt.length).toBeGreaterThan(0);
      expect(dd.length).toBeGreaterThan(0);
      expect(dt.length).toBe(dd.length);
    });
  });
});
