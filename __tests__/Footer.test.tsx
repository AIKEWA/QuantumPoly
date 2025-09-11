import { render, screen } from '@testing-library/react';
import React from 'react';

import { Footer } from '@/components/Footer';

describe('Footer Component', () => {
  const defaultProps = {
    brand: 'QuantumPoly',
    tagline: 'Shaping the quantum future',
    copyright: '© 2024 QuantumPoly. All rights reserved.',
    socialLinks: [
      { label: 'Twitter', href: 'https://twitter.com/quantumpoly' },
      { label: 'LinkedIn', href: 'https://linkedin.com/company/quantumpoly' },
      { label: 'GitHub', href: 'https://github.com/quantumpoly' },
    ],
  };

  it('renders all user-visible text from props', () => {
    render(<Footer {...defaultProps} />);

    expect(screen.getByRole('heading', { name: defaultProps.brand })).toBeInTheDocument();
    expect(screen.getByText(defaultProps.tagline)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.copyright)).toBeInTheDocument();
  });

  it('respects headingLevel prop for brand', () => {
    render(<Footer {...defaultProps} headingLevel={3} />);

    const heading = screen.getByRole('heading', { name: defaultProps.brand });
    expect(heading.tagName).toBe('H3');
  });

  it('defaults to h2 for brand when headingLevel is not provided', () => {
    render(<Footer {...defaultProps} />);

    const heading = screen.getByRole('heading', { name: defaultProps.brand });
    expect(heading.tagName).toBe('H2');
  });

  it('has semantic footer with proper aria-labelledby', () => {
    render(<Footer {...defaultProps} />);

    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveAttribute('aria-labelledby', 'footer-brand-quantumpoly');
    expect(footer.tagName).toBe('FOOTER');

    // Verify the labelledby target exists
    const brandElement = document.getElementById('footer-brand-quantumpoly');
    expect(brandElement).toBeTruthy();
  });

  it('social links are within semantic nav with proper aria-label', () => {
    render(<Footer {...defaultProps} />);

    const socialNav = screen.getByRole('navigation', { name: 'Social links' });
    expect(socialNav).toBeInTheDocument();
    expect(socialNav.tagName).toBe('NAV');
  });

  it('renders all social links with correct attributes', () => {
    render(<Footer {...defaultProps} />);

    defaultProps.socialLinks.forEach((link) => {
      const linkElement = screen.getByRole('link', { name: new RegExp(link.label) });
      expect(linkElement).toHaveAttribute('href', link.href);
      expect(linkElement).toHaveAttribute('target', '_blank');
      expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer');
      expect(linkElement).toHaveAttribute('aria-label', `${link.label} (opens in new tab)`);
    });
  });

  it('external links include security attributes', () => {
    render(<Footer {...defaultProps} />);

    const twitterLink = screen.getByRole('link', { name: /Twitter/ });
    expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(twitterLink).toHaveAttribute('target', '_blank');
  });

  it('handles missing socialLinks gracefully', () => {
    const propsWithoutSocialLinks = { ...defaultProps, socialLinks: undefined };

    render(<Footer {...propsWithoutSocialLinks} />);

    expect(screen.queryByRole('navigation', { name: 'Social links' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: defaultProps.brand })).toBeInTheDocument();
    expect(screen.getByText(defaultProps.copyright)).toBeInTheDocument();
  });

  it('handles empty socialLinks array', () => {
    render(<Footer {...defaultProps} socialLinks={[]} />);

    expect(screen.queryByRole('navigation', { name: 'Social links' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: defaultProps.brand })).toBeInTheDocument();
  });

  it('uses socialSlot when provided, overriding socialLinks', () => {
    const customSocialSlot = (
      <div data-testid="custom-social">
        <p>Custom social content</p>
      </div>
    );

    render(<Footer {...defaultProps} socialSlot={customSocialSlot} />);

    expect(screen.getByTestId('custom-social')).toBeInTheDocument();
    expect(screen.getByText('Custom social content')).toBeInTheDocument();

    // Regular social links should not be rendered
    expect(screen.queryByRole('navigation', { name: 'Social links' })).not.toBeInTheDocument();
  });

  it('does not render tagline when not provided', () => {
    const propsWithoutTagline = { ...defaultProps, tagline: undefined };

    render(<Footer {...propsWithoutTagline} />);

    expect(screen.getByRole('heading', { name: defaultProps.brand })).toBeInTheDocument();
    expect(screen.queryByText(defaultProps.tagline)).not.toBeInTheDocument();
    expect(screen.getByText(defaultProps.copyright)).toBeInTheDocument();
  });

  it('applies custom className to root footer', () => {
    const customClass = 'custom-footer-class';
    render(<Footer {...defaultProps} className={customClass} />);

    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass(customClass);
  });

  it('social links are keyboard accessible', () => {
    render(<Footer {...defaultProps} />);

    const socialLinks = screen.getAllByRole('link');
    socialLinks.forEach((link) => {
      expect(link).not.toHaveAttribute('tabindex', '-1');
      expect(link).toHaveClass('focus:outline-none');
      expect(link).toHaveClass('focus:ring-2');
    });
  });

  it('maintains proper content hierarchy', () => {
    render(<Footer {...defaultProps} />);

    const footer = screen.getByRole('contentinfo');
    const heading = screen.getByRole('heading', { name: defaultProps.brand });
    const nav = screen.getByRole('navigation', { name: 'Social links' });

    expect(footer).toContainElement(heading);
    expect(footer).toContainElement(nav);
  });

  it('social links have proper hover and focus styles', () => {
    render(<Footer {...defaultProps} />);

    const twitterLink = screen.getByRole('link', { name: /Twitter/ });
    expect(twitterLink).toHaveClass('hover:text-cyan-400');
    expect(twitterLink).toHaveClass('focus:ring-cyan-400');
    expect(twitterLink).toHaveClass('transition-colors');
  });
});
