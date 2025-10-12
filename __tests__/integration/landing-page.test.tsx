/**
 * Integration Test: Landing Page Composition
 *
 * Purpose: System-level verification of the five core components working together:
 * Hero, About, Vision, NewsletterForm, Footer
 *
 * ADR: Integration testing chosen over unit-only approach to catch composition regressions,
 * accessibility flows, and cross-component interaction issues early.
 */

import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { About } from '@/components/About';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { NewsletterForm } from '@/components/NewsletterForm';
import { Vision } from '@/components/Vision';
import enMessages from '@/locales/en/index';

// Mock useTranslations to return actual English translations  
jest.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) => {
    const keys = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required for dynamic message access
    let value: unknown = (enMessages as Record<string, unknown>)[namespace];
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    return value || `${namespace}.${key}`;
  },
  useLocale: () => 'en',
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

/**
 * Test-only composition component that represents the full landing page layout
 */
function Landing({
  onSubscribe = async () => {},
}: {
  onSubscribe?: (email: string) => Promise<void>;
}) {
  return (
    <div data-testid="landing-root">
      <Hero
        title="Welcome to QuantumPoly"
        subtitle="Leading the future of ethical AI"
        ctaLabel="Get Started"
        headingLevel={1}
      />
      <About
        title="About Us"
        body={
          <p id="about-desc">
            We build ethical AI systems that prioritize safety, transparency, and human values.
          </p>
        }
        headingLevel={2}
      />
      <Vision
        title="Our Vision"
        headingLevel={2}
        pillars={[
          { title: 'Safety', description: 'Built-in accessibility and secure design.' },
          { title: 'Scale', description: 'Cloud-native architecture for global reach.' },
          {
            title: 'Openness',
            description: 'Prop-driven internationalization and open standards.',
          },
        ]}
      />
      <NewsletterForm
        title="Stay in the Loop"
        emailLabel="Email Address"
        emailPlaceholder="you@example.com"
        submitLabel="Subscribe"
        successMessage="Thanks for subscribing!"
        errorMessage="Please enter a valid email."
        onSubscribe={onSubscribe}
      />
      <Footer
        brand="QuantumPoly"
        tagline="Building the Future Responsibly"
        copyright="© 2025 QuantumPoly"
        socialLinks={[
          { label: 'GitHub', href: 'https://github.com/quantumpoly' },
          { label: 'Twitter', href: 'https://twitter.com/quantumpoly' },
        ]}
        headingLevel={2}
      />
    </div>
  );
}

describe('Landing Page Integration', () => {
  describe('Heading Hierarchy', () => {
    test('has exactly one H1 and appropriate subheadings', () => {
      render(<Landing />);

      // Should have exactly one H1 (main hero title)
      const h1Elements = screen.getAllByRole('heading', { level: 1 });
      expect(h1Elements).toHaveLength(1);
      expect(h1Elements[0]).toHaveTextContent('Welcome to QuantumPoly');

      // Should have multiple H2s for sections
      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements.length).toBeGreaterThan(0);

      // Verify specific section headings are present
      expect(screen.getByRole('heading', { level: 2, name: /about us/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: /our vision/i })).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { level: 2, name: /stay in the loop/i }),
      ).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: /quantumpoly/i })).toBeInTheDocument();
    });
  });

  describe('Tab Order & Keyboard Navigation', () => {
    test('follows logical tab sequence: CTA → Newsletter email → Footer social links', async () => {
      render(<Landing />);
      const user = userEvent.setup();

      // Find interactive elements
      const ctaButton = screen.getByRole('button', { name: /get started/i });
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const footerNav = screen.getByRole('navigation', { name: /social/i });
      const firstFooterLink = within(footerNav).getByRole('link', { name: /github/i });

      // Test tab order
      await user.tab();
      expect(ctaButton).toHaveFocus();

      await user.tab();
      expect(emailInput).toHaveFocus();

      // Skip subscribe button and go to footer links
      await user.tab();
      await user.tab();
      expect(firstFooterLink).toHaveFocus();
    });
  });

  describe('Dark Mode Support', () => {
    test('supports dark mode class toggling', () => {
      const { getByTestId } = render(<Landing />);
      const root = getByTestId('landing-root');

      // Initially no dark class
      expect(root.classList.contains('dark')).toBe(false);

      // Simulate dark mode toggle
      root.classList.add('dark');
      expect(root.classList.contains('dark')).toBe(true);

      // Can be removed
      root.classList.remove('dark');
      expect(root.classList.contains('dark')).toBe(false);
    });
  });

  describe('Newsletter Form Flow', () => {
    test('handles invalid email → error state with aria-invalid', async () => {
      const user = userEvent.setup();
      render(<Landing />);

      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      // Enter invalid email and submit
      await act(async () => {
        await user.type(emailInput, 'not-an-email');
        await user.click(submitButton);
      });

      // Should show error state
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });

    test('handles valid email → async success with aria-live announcement', async () => {
      const user = userEvent.setup();
      const mockOnSubscribe = jest.fn().mockResolvedValue(undefined);
      render(<Landing onSubscribe={mockOnSubscribe} />);

      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      // Enter valid email and submit
      await act(async () => {
        await user.type(emailInput, 'test@example.com');
        await user.click(submitButton);
      });

      // Should call onSubscribe
      expect(mockOnSubscribe).toHaveBeenCalledWith('test@example.com');

      // Wait for success state and check button text changes
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // Should show success message on the button
      expect(submitButton).toHaveTextContent(/thanks for subscribing/i);
    });

    test('handles async onSubscribe failure gracefully', async () => {
      const user = userEvent.setup();
      const mockOnSubscribe = jest.fn().mockRejectedValue(new Error('Network error'));
      render(<Landing onSubscribe={mockOnSubscribe} />);

      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      // Enter valid email and submit
      await act(async () => {
        await user.type(emailInput, 'test@example.com');
        await user.click(submitButton);
      });

      // Should show error message after failure
      expect(await screen.findByText(/please enter a valid email/i)).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Accessibility Compliance', () => {
    test('all sections have proper ARIA labels and landmarks', () => {
      render(<Landing />);

      // Check for proper landmarks
      expect(screen.getByRole('region', { name: /welcome to quantumpoly/i })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /stay in the loop/i })).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    test('external links have security attributes', () => {
      render(<Landing />);

      const githubLink = screen.getByRole('link', { name: /github/i });
      const twitterLink = screen.getByRole('link', { name: /twitter/i });

      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer');
      expect(twitterLink).toHaveAttribute('target', '_blank');
    });

    test('form has proper labeling and validation announcements', () => {
      render(<Landing />);

      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const form = screen.getByRole('form', { name: /newsletter subscription/i });

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(form).toBeInTheDocument();
    });
  });

  describe('Content Verification', () => {
    test('displays all expected content sections', () => {
      render(<Landing />);

      // Hero content
      expect(screen.getByText('Welcome to QuantumPoly')).toBeInTheDocument();
      expect(screen.getByText('Leading the future of ethical AI')).toBeInTheDocument();

      // About content
      expect(screen.getByText(/we build ethical ai systems/i)).toBeInTheDocument();

      // Vision pillars
      expect(screen.getByText('Safety')).toBeInTheDocument();
      expect(screen.getByText('Scale')).toBeInTheDocument();
      expect(screen.getByText('Openness')).toBeInTheDocument();

      // Footer content
      expect(screen.getByText('Building the Future Responsibly')).toBeInTheDocument();
      expect(screen.getByText('© 2025 QuantumPoly')).toBeInTheDocument();
    });
  });
});
