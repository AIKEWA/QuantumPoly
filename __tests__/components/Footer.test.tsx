/**
 * @fileoverview Unit tests for Footer component
 * @module __tests__/components/Footer.test
 */

import React from 'react';
jest.mock('next-intl', () => ({
  useTranslations: () => ((ns?: string) => (key: string) => `${ns ? ns + '.' : ''}${key}`),
}));
import { render, screen, fireEvent } from '@testing-library/react';
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import Footer from '../../src/components/Footer';
import { FooterProps, SocialLink } from '../../src/types/components';

// Mock window.open for external link testing
const mockWindowOpen = jest.fn();
window.open = mockWindowOpen;

// Mock react-icons to avoid import issues in tests
jest.mock('react-icons/fa', () => ({
  FaTwitter: ({ size }: { size: number }) => (
    <div data-testid={`twitter-icon-${size}`}>Twitter</div>
  ),
  FaLinkedin: ({ size }: { size: number }) => (
    <div data-testid={`linkedin-icon-${size}`}>LinkedIn</div>
  ),
  FaGithub: ({ size }: { size: number }) => (
    <div data-testid={`github-icon-${size}`}>GitHub</div>
  ),
  FaDiscord: ({ size }: { size: number }) => (
    <div data-testid={`discord-icon-${size}`}>Discord</div>
  ),
}));

describe('Footer Component', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    mockWindowOpen.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Footer />);

      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      expect(screen.getByText('QuantumPoly')).toBeInTheDocument();
      expect(
        screen.getByText(/© \d{4} QuantumPoly\. All rights reserved\./)
      ).toBeInTheDocument();
      expect(
        screen.getByText('Building the future, responsibly.')
      ).toBeInTheDocument();
    });

    it('renders with custom props', () => {
      const customProps: FooterProps = {
        brandName: 'Custom Brand',
        copyrightText: '© 2024 Custom Brand. All rights reserved.',
        tagline: 'Custom tagline here.',
        id: 'custom-footer',
      };

      render(<Footer {...customProps} />);

      expect(screen.getByText('Custom Brand')).toBeInTheDocument();
      expect(
        screen.getByText('© 2024 Custom Brand. All rights reserved.')
      ).toBeInTheDocument();
      expect(screen.getByText('Custom tagline here.')).toBeInTheDocument();
    });

    it('renders without tagline when not provided', () => {
      render(<Footer tagline={undefined} />);

      expect(screen.getByText('QuantumPoly')).toBeInTheDocument();
      expect(
        screen.getByText(/© \d{4} QuantumPoly\. All rights reserved\./)
      ).toBeInTheDocument();
      expect(
        screen.queryByText('Building the future, responsibly.')
      ).not.toBeInTheDocument();
    });
  });

  describe('Social Media Links', () => {
    it('renders default social media links', () => {
      render(<Footer />);

      expect(screen.getByLabelText('Follow us on Twitter')).toBeInTheDocument();
      expect(
        screen.getByLabelText('Connect with us on LinkedIn')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('View our code on GitHub')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Join our Discord community')
      ).toBeInTheDocument();
    });

    it('renders custom social media links', () => {
      const customSocialLinks: SocialLink[] = [
        {
          icon: <span>📘</span>,
          label: 'Follow us on Facebook',
          href: 'https://facebook.com/quantumpoly',
          platform: 'Facebook',
        },
        {
          icon: <span>📸</span>,
          label: 'Follow us on Instagram',
          href: 'https://instagram.com/quantumpoly',
          platform: 'Instagram',
        },
      ];

      render(<Footer socialLinks={customSocialLinks} />);

      expect(
        screen.getByLabelText('Follow us on Facebook')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Follow us on Instagram')
      ).toBeInTheDocument();
      expect(
        screen.queryByLabelText('Follow us on Twitter')
      ).not.toBeInTheDocument();
    });

    it('handles social media link clicks', () => {
      const customSocialLinks: SocialLink[] = [
        {
          icon: <span>Test</span>,
          label: 'Test Platform',
          href: 'https://test.com',
          platform: 'Test',
        },
      ];

      render(<Footer socialLinks={customSocialLinks} />);

      const link = screen.getByLabelText('Test Platform');
      fireEvent.click(link);

      // Since href is not '#', it should not prevent default
      expect(link).toHaveAttribute('href', 'https://test.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('prevents default for placeholder links', () => {
      render(<Footer />);

      const twitterLink = screen.getByLabelText('Follow us on Twitter');
      const clickEvent = new MouseEvent('click', { bubbles: true });
      const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');

      fireEvent(twitterLink, clickEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('supports keyboard navigation', () => {
      const customSocialLinks: SocialLink[] = [
        {
          icon: <span>Test</span>,
          label: 'Test Keyboard',
          href: 'https://test.com',
          platform: 'Test',
        },
      ];

      render(<Footer socialLinks={customSocialLinks} />);

      const link = screen.getByLabelText('Test Keyboard');

      fireEvent.keyDown(link, { key: 'Enter' });
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://test.com',
        '_blank',
        'noopener noreferrer'
      );

      mockWindowOpen.mockClear();
      fireEvent.keyDown(link, { key: ' ' });
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://test.com',
        '_blank',
        'noopener noreferrer'
      );
    });
  });

  describe('Footer Links', () => {
    it('renders additional footer links when provided', () => {
      const footerLinks = [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Contact', href: 'mailto:contact@quantumpoly.com' },
      ];

      render(<Footer footerLinks={footerLinks} />);

      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();

      const privacyLink = screen.getByText('Privacy Policy').closest('a');
      expect(privacyLink).toHaveAttribute('href', '/privacy');
    });

    it('handles external footer links correctly', () => {
      const footerLinks = [
        { label: 'External Link', href: 'https://external.com' },
      ];

      render(<Footer footerLinks={footerLinks} />);

      const externalLink = screen.getByText('External Link').closest('a');
      expect(externalLink).toHaveAttribute('target', '_blank');
      expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('handles internal footer links correctly', () => {
      const footerLinks = [{ label: 'Internal Link', href: '/internal' }];

      render(<Footer footerLinks={footerLinks} />);

      const internalLink = screen.getByText('Internal Link').closest('a');
      expect(internalLink).toHaveAttribute('target', '_self');
      expect(internalLink).not.toHaveAttribute('rel');
    });

    it('does not render footer navigation when no links provided', () => {
      render(<Footer footerLinks={[]} />);

      expect(
        screen.queryByRole('navigation', { name: 'Footer navigation' })
      ).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveAttribute('aria-labelledby', 'footer-section-brand');

      const brandHeading = screen.getByRole('heading', { level: 2 });
      expect(brandHeading).toHaveAttribute('id', 'footer-section-brand');
      expect(brandHeading).toHaveAttribute('tabIndex', '0');
    });

    it('provides proper navigation landmarks', () => {
      const footerLinks = [{ label: 'Test Link', href: '/test' }];

      render(<Footer footerLinks={footerLinks} />);

      expect(
        screen.getByRole('navigation', { name: 'Footer navigation' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('navigation', { name: 'Social media links' })
      ).toBeInTheDocument();
    });

    it('includes screen reader only content', () => {
      render(<Footer />);

      // Check for skip link
      expect(screen.getByText('Back to top')).toBeInTheDocument();

      // Check for social link screen reader text
      const socialLinks = screen.getAllByText(
        /Follow us on|Connect with us on|View our|Join our/
      );
      socialLinks.forEach(link => {
        expect(link.closest('a')).toHaveClass('sr-only');
      });
    });

    it('supports keyboard navigation for brand', () => {
      render(<Footer />);

      const brandHeading = screen.getByRole('heading', { level: 2 });
      expect(brandHeading).toHaveAttribute('tabIndex', '0');

      brandHeading.focus();
      expect(document.activeElement).toBe(brandHeading);
    });

    it('provides proper ARIA labels for icons', () => {
      render(<Footer />);

      const socialIcons = screen.getAllByRole('link', {
        name: /Follow us on|Connect with us on|View our|Join our/,
      });
      socialIcons.forEach(icon => {
        const iconElement = icon.querySelector('div[aria-hidden="true"]');
        expect(iconElement).toBeInTheDocument();
      });
    });
  });

  describe('Theming and Styling', () => {
    it('applies custom className', () => {
      render(<Footer className="custom-footer-class" />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('custom-footer-class');
    });

    it('applies custom id', () => {
      render(<Footer id="custom-footer" />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveAttribute('id', 'custom-footer');

      const brandHeading = screen.getByRole('heading', { level: 2 });
      expect(brandHeading).toHaveAttribute('id', 'custom-footer-brand');
    });

    it('includes theme-aware styling', () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      expect(footer.className).toMatch(/dark:/);

      const brandHeading = screen.getByRole('heading', { level: 2 });
      expect(brandHeading.className).toMatch(/text-cyan-400/);
    });

    it('has responsive design classes', () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('py-12', 'px-4', 'md:px-6');
    });
  });

  describe('Skip Link Functionality', () => {
    it('includes back to top skip link', () => {
      render(<Footer />);

      const skipLink = screen.getByText('Back to top').closest('a');
      expect(skipLink).toHaveAttribute('href', '#hero-section');
      expect(skipLink).toHaveClass('sr-only');
    });
  });

  describe('Props Validation', () => {
    it('spreads additional props to footer element', () => {
      render(<Footer data-testid="footer-section" />);

      const footer = screen.getByTestId('footer-section');
      expect(footer).toBeInTheDocument();
    });

    it('handles empty social links array', () => {
      render(<Footer socialLinks={[]} />);

      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      expect(
        screen.queryByRole('navigation', { name: 'Social media links' })
      ).toBeInTheDocument();
    });
  });

  describe('Dynamic Copyright Year', () => {
    it('displays current year in copyright', () => {
      render(<Footer />);

      const currentYear = new Date().getFullYear();
      expect(
        screen.getByText(new RegExp(`© ${currentYear} QuantumPoly`))
      ).toBeInTheDocument();
    });
  });
});
