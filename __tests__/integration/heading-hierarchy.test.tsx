/**
 * Integration Test: Heading Hierarchy and Landmark Validation
 *
 * Purpose: Ensures proper accessibility compliance across the landing page by validating:
 * - Single H1 per page (WCAG requirement)
 * - Proper landmark labeling with aria-labelledby
 * - All regions have accessible names pointing to valid headings
 *
 * REVIEW: This test validates the complete accessibility semantics as specified by
 * Professor Doctor Julius Prompto's requirements for enterprise-level a11y compliance.
 */

import { render, screen } from '@testing-library/react';
import React from 'react';

import Home from '@/app/page';

describe('Landing Page - Heading Hierarchy & Landmarks', () => {
  it('has exactly one H1 heading on the page', () => {
    const { container } = render(<Home />);

    const h1Elements = container.querySelectorAll('h1');
    expect(h1Elements).toHaveLength(1);

    // Verify the H1 is the main Hero title
    expect(h1Elements[0]).toHaveTextContent('Welcome to QuantumPoly');
  });

  it('all regions have valid aria-labelledby pointing to visible headings', () => {
    const { container } = render(<Home />);

    const regions = screen.getAllByRole('region');
    expect(regions.length).toBeGreaterThan(0);

    regions.forEach((region, index) => {
      const labelledBy = region.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();

      // Verify the referenced heading exists and is visible
      const headingElement = container.querySelector(`#${labelledBy}`);
      expect(headingElement).toBeTruthy();
      expect(headingElement).toBeVisible();

      // DISCUSS: Log for debugging which regions we're validating
      console.log(`Region ${index + 1}: ${labelledBy} -> "${headingElement?.textContent}"`);
    });
  });

  it('Footer has proper contentinfo landmark with labeled brand heading', () => {
    render(<Home />);

    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();

    const labelledBy = footer.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(labelledBy).toMatch(/footer-brand-/);

    // Verify the brand heading exists and is accessible
    const brandElement = document.getElementById(labelledBy!);
    expect(brandElement).toBeTruthy();
    expect(brandElement).toBeVisible();
  });

  it('Newsletter section uses role=region with proper labeling', () => {
    render(<Home />);

    const newsletterRegion = screen.getByRole('region', { name: /stay in the loop/i });
    expect(newsletterRegion).toBeInTheDocument();

    const labelledBy = newsletterRegion.getAttribute('aria-labelledby');
    expect(labelledBy).toBe('newsletter-title');

    const titleElement = document.getElementById('newsletter-title');
    expect(titleElement).toHaveTextContent('Stay in the Loop');
  });

  it('main sections follow proper heading hierarchy (H1 > H2 > H3)', () => {
    const { container } = render(<Home />);

    // Get all headings in document order
    const allHeadings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingLevels = Array.from(allHeadings).map((h) => parseInt(h.tagName.charAt(1)));

    // FEEDBACK: Verify we start with H1 and don't skip levels inappropriately
    expect(headingLevels[0]).toBe(1); // First heading should be H1

    // Check that we don't skip levels (e.g., H1 -> H3)
    for (let i = 1; i < headingLevels.length; i++) {
      const current = headingLevels[i];
      const previous = headingLevels[i - 1];

      // Allow same level (H2 -> H2) or one level down (H2 -> H3) or going back up (H3 -> H2, H3 -> H1)
      const levelDifference = current - previous;
      expect(levelDifference).toBeLessThanOrEqual(1);
    }
  });

  it('Hero section has proper region role and labeling', () => {
    render(<Home />);

    const heroRegion = screen.getByRole('region', { name: /welcome to quantumpoly/i });
    expect(heroRegion).toBeInTheDocument();

    const labelledBy = heroRegion.getAttribute('aria-labelledby');
    expect(labelledBy).toMatch(/hero-title-welcome-to-quantumpoly/);

    const heroTitle = document.getElementById(labelledBy!);
    expect(heroTitle).toHaveTextContent('Welcome to QuantumPoly');
    expect(heroTitle?.tagName.toLowerCase()).toBe('h1');
  });

  it('About and Vision sections have proper H2 headings and region labeling', () => {
    render(<Home />);

    // Test About section
    const aboutRegion = screen.getByRole('region', { name: /about us/i });
    expect(aboutRegion).toBeInTheDocument();

    const aboutLabelledBy = aboutRegion.getAttribute('aria-labelledby');
    const aboutTitle = document.getElementById(aboutLabelledBy!);
    expect(aboutTitle?.tagName.toLowerCase()).toBe('h2');
    expect(aboutTitle).toHaveTextContent('About Us');

    // Test Vision section
    const visionRegion = screen.getByRole('region', { name: /our vision/i });
    expect(visionRegion).toBeInTheDocument();

    const visionLabelledBy = visionRegion.getAttribute('aria-labelledby');
    const visionTitle = document.getElementById(visionLabelledBy!);
    expect(visionTitle?.tagName.toLowerCase()).toBe('h2');
    expect(visionTitle).toHaveTextContent('Our Vision');
  });

  it('Vision pillars use H3 headings under the main H2', () => {
    render(<Home />);

    // Find all H3 elements within the Vision section
    const visionSection = screen.getByRole('region', { name: /our vision/i });
    const h3Elements = visionSection.querySelectorAll('h3');

    expect(h3Elements.length).toBe(3); // Safety, Scale, Openness

    // Verify they have the expected pillar content
    const pillarTitles = Array.from(h3Elements).map((h3) => h3.textContent);
    expect(pillarTitles).toEqual(['Safety', 'Scale', 'Openness']);
  });

  it('provides comprehensive landmark coverage for screen reader navigation', () => {
    render(<Home />);

    // Verify key landmarks exist for screen reader users
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // Footer

    const regions = screen.getAllByRole('region');
    expect(regions.length).toBeGreaterThanOrEqual(4); // Hero, About, Vision, Newsletter

    // REVIEW: All landmarks should be properly labeled for navigation
    regions.forEach((region) => {
      const labelledBy = region.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();
    });
  });
});
