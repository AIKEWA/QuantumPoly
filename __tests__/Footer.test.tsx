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

  describe('Policy Links', () => {
    const propsWithPolicyLinks = {
      ...defaultProps,
      policyLinks: [
        { label: 'Ethics & Transparency', href: '/en/ethics' },
        { label: 'Privacy Policy', href: '/en/privacy' },
        { label: 'Imprint', href: '/en/imprint' },
        { label: 'Gender Equality Plan', href: '/en/gep' },
      ],
      policyNavLabel: 'Trust and legal information',
    };

    it('renders all policy links with correct href', () => {
      render(<Footer {...propsWithPolicyLinks} />);

      propsWithPolicyLinks.policyLinks.forEach((link) => {
        const linkElement = screen.getByRole('link', { name: link.label });
        expect(linkElement).toBeInTheDocument();
        expect(linkElement).toHaveAttribute('href', link.href);
      });
    });

    it('policy links are within semantic nav with proper aria-label', () => {
      render(<Footer {...propsWithPolicyLinks} />);

      const policyNav = screen.getByRole('navigation', {
        name: propsWithPolicyLinks.policyNavLabel,
      });
      expect(policyNav).toBeInTheDocument();
      expect(policyNav.tagName).toBe('NAV');
    });

    it('uses default aria-label when policyNavLabel is not provided', () => {
      const propsWithoutNavLabel = {
        ...defaultProps,
        policyLinks: propsWithPolicyLinks.policyLinks,
      };

      render(<Footer {...propsWithoutNavLabel} />);

      const policyNav = screen.getByRole('navigation', { name: 'Trust and legal' });
      expect(policyNav).toBeInTheDocument();
    });

    it('handles missing policyLinks gracefully', () => {
      render(<Footer {...defaultProps} />);

      expect(
        screen.queryByRole('navigation', { name: /Trust and legal/ })
      ).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: defaultProps.brand })).toBeInTheDocument();
    });

    it('handles empty policyLinks array', () => {
      const propsWithEmptyPolicyLinks = {
        ...defaultProps,
        policyLinks: [],
      };

      render(<Footer {...propsWithEmptyPolicyLinks} />);

      expect(
        screen.queryByRole('navigation', { name: /Trust and legal/ })
      ).not.toBeInTheDocument();
    });

    it('policy links are keyboard accessible', () => {
      render(<Footer {...propsWithPolicyLinks} />);

      const policyNav = screen.getByRole('navigation', {
        name: propsWithPolicyLinks.policyNavLabel,
      });
      const policyLinks = policyNav.querySelectorAll('a');

      policyLinks.forEach((link) => {
        expect(link).not.toHaveAttribute('tabindex', '-1');
        expect(link).toHaveClass('focus:outline-none');
        expect(link).toHaveClass('focus:ring-2');
      });
    });

    it('policy links have proper hover and focus styles', () => {
      render(<Footer {...propsWithPolicyLinks} />);

      const ethicsLink = screen.getByRole('link', { name: 'Ethics & Transparency' });
      expect(ethicsLink).toHaveClass('hover:text-cyan-400');
      expect(ethicsLink).toHaveClass('focus:ring-cyan-400');
      expect(ethicsLink).toHaveClass('transition-colors');
    });

    it('policy links use internal routing (Next.js Link)', () => {
      render(<Footer {...propsWithPolicyLinks} />);

      const ethicsLink = screen.getByRole('link', { name: 'Ethics & Transparency' });
      // Next.js Link components don't have target="_blank" for internal routes
      expect(ethicsLink).not.toHaveAttribute('target', '_blank');
      expect(ethicsLink).not.toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders both social and policy links together', () => {
      render(<Footer {...propsWithPolicyLinks} />);

      // Social links should be present
      const socialNav = screen.getByRole('navigation', { name: 'Social links' });
      expect(socialNav).toBeInTheDocument();

      // Policy links should be present
      const policyNav = screen.getByRole('navigation', {
        name: propsWithPolicyLinks.policyNavLabel,
      });
      expect(policyNav).toBeInTheDocument();

      // Verify specific links from both categories
      expect(screen.getByRole('link', { name: /Twitter/ })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Privacy Policy' })).toBeInTheDocument();
    });
  });
});
