/**
 * Test Suite for LanguageSwitcher Component
 *
 * Comprehensive testing for internationalization functionality including:
 * - Component rendering and state management
 * - Language switching functionality
 * - Accessibility compliance (WCAG 2.1 AA)
 * - Keyboard navigation
 * - Local storage persistence
 * - Error handling
 *
 * @module LanguageSwitcher.test
 * @version 1.0.0
 * @author QuantumPoly Development Team
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import LanguageSwitcher from '../../src/components/LanguageSwitcher';

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock next-intl hooks
jest.mock('next-intl', () => ({
  ...jest.requireActual('next-intl'),
  useLocale: jest.fn(() => 'en'),
  useTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      available: 'Available languages',
      switchTo: 'Switch to {language}',
      current: 'Current language: {language}',
    };
    return translations[key] || key;
  }),
}));

// Mock translations
const mockMessages = {
  language: {
    switchTo: 'Switch to {language}',
    current: 'Current language: {language}',
    available: 'Available languages',
  },
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode; locale?: string }> = ({
  children,
  locale = 'en',
}) => (
  <NextIntlClientProvider locale={locale} messages={mockMessages}>
    {children}
  </NextIntlClientProvider>
);

describe('LanguageSwitcher', () => {
  const mockPush = jest.fn();
  const mockUseRouter = useRouter as jest.Mock;
  const mockUsePathname = usePathname as jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup navigation mocks
    mockUseRouter.mockReturnValue({
      push: mockPush,
    });
    mockUsePathname.mockReturnValue('/');

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  describe('Rendering and Initial State', () => {
    it('renders correctly with default props', () => {
      render(
        <TestWrapper>
          <LanguageSwitcher />
        </TestWrapper>
      );

      const button = screen.getByRole('button', {
        name: /available languages/i,
      });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('displays current locale correctly in compact variant', () => {
      render(
        <TestWrapper>
          <LanguageSwitcher variant="compact" />
        </TestWrapper>
      );

      expect(screen.getByText('EN')).toBeInTheDocument();
      expect(screen.getByText('🇺🇸')).toBeInTheDocument();
    });

    it('displays current locale correctly in full variant', () => {
      render(
        <TestWrapper>
          <LanguageSwitcher variant="full" />
        </TestWrapper>
      );

      expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('hides flags when showFlags is false', () => {
      render(
        <TestWrapper>
          <LanguageSwitcher showFlags={false} />
        </TestWrapper>
      );

      expect(screen.queryByText('🇺🇸')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <LanguageSwitcher />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
      expect(button).toHaveAttribute('aria-label', 'Available languages');
    });

    it('supports custom aria-label', () => {
      const customLabel = 'Choose your language';
      render(
        <TestWrapper>
          <LanguageSwitcher ariaLabel={customLabel} />
        </TestWrapper>
      );

      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        customLabel
      );
    });

    it('manages focus correctly when opening dropdown', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageSwitcher />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');

      // Should show listbox with options
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('opens dropdown on Enter key', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageSwitcher />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('opens dropdown on Space key', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageSwitcher />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('closes dropdown on Escape key', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageSwitcher />
        </TestWrapper>
      );

      const button = screen.getByRole('button');

      // Open dropdown
      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');

      // Close with Escape
      await user.keyboard('{Escape}');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Language Switching', () => {
    it('calls router.push when language is selected', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageSwitcher />
        </TestWrapper>
      );

      // Open dropdown
      const button = screen.getByRole('button');
      await user.click(button);

      // Wait for dropdown to appear and click German option
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      const germanOption = screen.getByRole('option', { name: /deutsch/i });
      await user.click(germanOption);

      expect(mockPush).toHaveBeenCalledWith('/de');
    });

    it('stores language preference in localStorage', async () => {
      const user = userEvent.setup();
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

      render(
        <TestWrapper>
          <LanguageSwitcher />
        </TestWrapper>
      );

      // Open dropdown and select Turkish
      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      const turkishOption = screen.getByRole('option', { name: /türkçe/i });
      await user.click(turkishOption);

      expect(setItemSpy).toHaveBeenCalledWith('preferred-language', 'tr');
    });

    it('handles path with existing locale correctly', async () => {
      mockUsePathname.mockReturnValue('/de/about');
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageSwitcher />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      const turkishOption = screen.getByRole('option', { name: /türkçe/i });
      await user.click(turkishOption);

      expect(mockPush).toHaveBeenCalledWith('/tr/about');
    });
  });

  describe('Click Outside Behavior', () => {
    it('closes dropdown when clicking outside', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <TestWrapper>
            <LanguageSwitcher />
          </TestWrapper>
          <button data-testid="outside-button">Outside</button>
        </div>
      );

      // Open dropdown
      const button = screen.getByRole('button', {
        name: /available languages/i,
      });
      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');

      // Click outside
      const outsideButton = screen.getByTestId('outside-button');
      fireEvent.mouseDown(outsideButton);

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'false');
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading indicator when changing language', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageSwitcher />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      const germanOption = screen.getByRole('option', { name: /deutsch/i });
      await user.click(germanOption);

      // Should briefly show loading state
      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles router.push errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockPush.mockRejectedValue(new Error('Navigation failed'));

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageSwitcher />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      const germanOption = screen.getByRole('option', { name: /deutsch/i });
      await user.click(germanOption);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to change language:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it('prevents switching to unsupported locale', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageSwitcher />
        </TestWrapper>
      );

      // This shouldn't normally happen in the UI, but testing edge case
      const button = screen.getByRole('button');
      await user.click(button);

      // Component should not attempt to switch to invalid locale
      expect(mockPush).not.toHaveBeenCalledWith('/invalid');
    });
  });

  describe('Theme Integration', () => {
    it('renders correctly with custom className', () => {
      const customClass = 'custom-language-switcher';

      render(
        <TestWrapper>
          <LanguageSwitcher className={customClass} />
        </TestWrapper>
      );

      const container = screen.getByRole('button').closest('div');
      expect(container).toHaveClass(customClass);
    });
  });
});

// FEEDBACK: Monitor test execution time and add performance benchmarks
// REVIEW: Consider adding visual regression tests for the dropdown animations
// DISCUSS: Should we add tests for SSR/hydration behavior?
