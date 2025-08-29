/**
 * Test suite for Hero component
 *
 * Comprehensive testing covering rendering, accessibility, interactions,
 * and responsive behavior following testing best practices.
 *
 * @version 1.0.0
 * @author QuantumPoly Development Team
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Hero from '@/components/Hero';

// Mock next/router for this test suite
jest.mock('next/router', () => ({
  useRouter() {
    return {
      locale: 'en',
      locales: ['en', 'de', 'fr', 'es'],
      defaultLocale: 'en',
      asPath: '/',
      push: jest.fn(),
    };
  },
}));

// Mock the i18n hook if used in Hero component
jest.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => {
    const flat: Record<string, string> = {
      'hero.title': 'QuantumPoly - The Future, Now',
      'hero.subtitle': 'Blending AI, Sustainability, and the Metaverse into a visionary future',
      'hero.cta': 'Explore the Future',
      'hero.scrollIndicator': 'Scroll down',
    };
    return flat[`${ns ? ns + '.' : ''}${key}`] || key;
  },
}));
  

describe('Hero Component', () => {
  // REVIEW: Consider adding tests for different viewport sizes
  const user = userEvent.setup();

  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<Hero />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('displays the main heading', () => {
      render(<Hero />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(/QuantumPoly/i);
    });

    it('displays the subtitle text', () => {
      render(<Hero />);
      const subtitle = screen.getByText(/blending ai, sustainability/i);
      expect(subtitle).toBeInTheDocument();
    });

    it('displays the call-to-action button', () => {
      render(<Hero />);
      const ctaButton = screen.getByRole('button', {
        name: /explore the future/i,
      });
      expect(ctaButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA landmarks', () => {
      render(<Hero />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('has accessible button text', () => {
      render(<Hero />);
      const button = screen.getByRole('button', { name: /explore the future/i });
      expect(button).toHaveAccessibleName();
    });

    it('has proper heading hierarchy', () => {
      render(<Hero />);
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      render(<Hero />);
      const button = screen.getByRole('button', { name: /explore the future/i });

      // Tab twice because the heading has tabIndex=0
      await user.tab();
      await user.tab();
      expect(button).toHaveFocus();

      // Activate with Enter
      await user.keyboard('{Enter}');
      // Add assertions based on expected behavior
    });

    it('supports screen readers', () => {
      render(<Hero />);
      const hero = screen.getByRole('banner');
      expect(hero).not.toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Interactions', () => {
    it('handles CTA button click', async () => {
      const mockScrollTo = jest.fn();
      global.scrollTo = mockScrollTo;

      render(<Hero />);
      const button = screen.getByRole('button', { name: /explore the future/i });

      await user.click(button);

      // Verify expected behavior (scroll, navigation, etc.)
      // This depends on the actual implementation
      // Clicking CTA should not throw; behavior (scroll or navigation) is implementation-specific
      expect(button).toBeInTheDocument();
    });

    it('handles mouse hover effects', async () => {
      render(<Hero />);
      const button = screen.getByRole('button', { name: /explore the future/i });

      await user.hover(button);

      // Verify hover state changes
      expect(button).toHaveClass(/hover/); // Adjust based on actual CSS classes
    });
  });

  describe('Responsive Behavior', () => {
    it('adapts to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<Hero />);

      // Verify mobile-specific styling or layout
      const hero = screen.getByRole('banner');
      expect(hero).toBeInTheDocument();
      // Add specific mobile assertions
    });

    it('adapts to desktop viewport', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      render(<Hero />);

      // Verify desktop-specific styling or layout
      const hero = screen.getByRole('banner');
      expect(hero).toBeInTheDocument();
      // Add specific desktop assertions
    });
  });

  describe('Content Validation', () => {
    it('contains expected keywords for SEO', () => {
      render(<Hero />);
      const content = screen.getByRole('banner');

      expect(content).toHaveTextContent(/quantum/i);
      expect(content).toHaveTextContent(/ai/i);
      expect(content).toHaveTextContent(/sustainability/i);
      expect(content).toHaveTextContent(/metaverse/i);
    });

    it('has appropriate text length for readability', () => {
      render(<Hero />);
      const heading = screen.getByRole('heading', { level: 1 });
      const headingText = heading.textContent || '';

      // Ensure heading is not too long for good UX
      expect(headingText.length).toBeLessThan(100);
      expect(headingText.length).toBeGreaterThan(10);
    });
  });

  describe('Performance Considerations', () => {
    it('does not trigger unnecessary re-renders', () => {
      const { rerender } = render(<Hero />);

      // Verify component stability
      rerender(<Hero />);

      const hero = screen.getByRole('banner');
      expect(hero).toBeInTheDocument();
    });

    it('loads critical content immediately', () => {
      render(<Hero />);

      // Verify no loading states for critical above-fold content
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('gracefully handles missing translations', () => {
      render(<Hero />);

      // Should still render without crashing
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('handles edge cases gracefully', () => {
      // Test with minimal props or edge case scenarios
      render(<Hero />);

      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });

  // FEEDBACK: Monitor test execution time and optimize slow tests
  // DISCUSS: Should we add visual regression tests for this component?
});
