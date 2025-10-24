/**
 * @fileoverview NewsletterForm API Integration Tests (Block 4.3)
 *
 * Tests the hybrid mode integration with /api/newsletter endpoint
 * Covers all server response scenarios, hybrid behavior, and accessibility
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { NewsletterForm } from '@/components/NewsletterForm';

import { defaultProps } from './utils/newsletter-form-helpers';

// Mock next-intl translations
jest.mock('next-intl', () => ({
  useTranslations: () => {
    const translations: Record<string, string> = {
      success: 'Successfully subscribed to our newsletter!',
      invalidEmail: 'Please provide a valid email address.',
      alreadySubscribed: 'This email is already subscribed.',
      rateLimitExceeded: 'Rate limit exceeded. Please wait before trying again.',
      serverError: 'An unexpected error occurred. Please try again.',
    };
    return (key: string) => translations[key] || key;
  },
}));

/**
 * Helper to render component in auto mode (no onSubscribe prop)
 */
function renderAutoMode() {
  const user = userEvent.setup();
  render(
    <NewsletterForm
      title="Test Newsletter"
      emailLabel="Email"
      emailPlaceholder="test@example.com"
      submitLabel="Subscribe"
      successMessage="Success!"
      errorMessage="Error!"
    />,
  );
  return { user };
}

/**
 * Helper to mock fetch responses
 */
function mockFetchResponse(status: number, messageKey: string, retryAfter?: string) {
  const headers = new Headers();
  if (retryAfter) {
    headers.set('Retry-After', retryAfter);
  }

  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve({ messageKey }),
      headers,
    } as Response),
  );
}

describe('NewsletterForm API Integration (Block 4.3)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Auto Mode (No onSubscribe Prop)', () => {
    it('calls /api/newsletter when form is submitted without onSubscribe prop', async () => {
      mockFetchResponse(201, 'newsletter.success');
      const { user } = renderAutoMode();

      const emailInput = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/newsletter',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com' }),
          }),
        );
      });
    });

    it('handles 201 success response correctly', async () => {
      mockFetchResponse(201, 'newsletter.success');
      const { user } = renderAutoMode();

      const emailInput = screen.getByRole('textbox');
      await user.type(emailInput, 'success@example.com');
      await user.click(screen.getByRole('button', { name: /subscribe/i }));

      await waitFor(() => {
        expect(screen.getByText('Successfully subscribed to our newsletter!')).toBeInTheDocument();
      });

      // Verify input cleared on success
      expect(emailInput).toHaveValue('');
    });

    it('handles 409 duplicate subscription response', async () => {
      mockFetchResponse(409, 'newsletter.alreadySubscribed');
      const { user } = renderAutoMode();

      await user.type(screen.getByRole('textbox'), 'duplicate@example.com');
      await user.click(screen.getByRole('button', { name: /subscribe/i }));

      await waitFor(() => {
        expect(screen.getByText('This email is already subscribed.')).toBeInTheDocument();
      });
    });

    it('handles 429 rate limit response', async () => {
      mockFetchResponse(429, 'newsletter.rateLimitExceeded', '10');
      const { user } = renderAutoMode();

      await user.type(screen.getByRole('textbox'), 'ratelimit@example.com');
      await user.click(screen.getByRole('button', { name: /subscribe/i }));

      await waitFor(() => {
        expect(
          screen.getByText('Rate limit exceeded. Please wait before trying again.'),
        ).toBeInTheDocument();
      });
    });

    it('handles 400 validation error response', async () => {
      mockFetchResponse(400, 'newsletter.invalidEmail');
      const { user } = renderAutoMode();

      await user.type(screen.getByRole('textbox'), 'invalid@example.com');
      await user.click(screen.getByRole('button', { name: /subscribe/i }));

      await waitFor(() => {
        expect(screen.getByText('Please provide a valid email address.')).toBeInTheDocument();
      });
    });

    it('handles 500 server error response', async () => {
      mockFetchResponse(500, 'newsletter.serverError');
      const { user } = renderAutoMode();

      await user.type(screen.getByRole('textbox'), 'servererror@example.com');
      await user.click(screen.getByRole('button', { name: /subscribe/i }));

      await waitFor(() => {
        expect(
          screen.getByText('An unexpected error occurred. Please try again.'),
        ).toBeInTheDocument();
      });
    });

    it('handles network timeout gracefully', async () => {
      // Mock a timeout by making fetch hang longer than the 10s timeout
      global.fetch = jest.fn(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('AbortError')), 100);
          }),
      );

      const { user } = renderAutoMode();

      await user.type(screen.getByRole('textbox'), 'timeout@example.com');
      await user.click(screen.getByRole('button', { name: /subscribe/i }));

      await waitFor(
        () => {
          expect(
            screen.getByText('An unexpected error occurred. Please try again.'),
          ).toBeInTheDocument();
        },
        { timeout: 2000 },
      );
    });

    it('handles unknown messageKey with fallback to serverError', async () => {
      mockFetchResponse(200, 'newsletter.unknownKey');
      const { user } = renderAutoMode();

      await user.type(screen.getByRole('textbox'), 'unknown@example.com');
      await user.click(screen.getByRole('button', { name: /subscribe/i }));

      await waitFor(() => {
        // Should map unknown key to serverError
        expect(
          screen.getByText('An unexpected error occurred. Please try again.'),
        ).toBeInTheDocument();
      });
    });

    it('handles malformed JSON response gracefully', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          status: 201,
          json: () => Promise.reject(new Error('Invalid JSON')),
          headers: new Headers(),
        } as Response),
      );

      const { user } = renderAutoMode();

      await user.type(screen.getByRole('textbox'), 'malformed@example.com');
      await user.click(screen.getByRole('button', { name: /subscribe/i }));

      await waitFor(() => {
        // Should handle gracefully with fallback
        expect(
          screen.getByText('An unexpected error occurred. Please try again.'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Hybrid Mode Behavior', () => {
    it('uses onSubscribe prop when provided (backward compatibility)', async () => {
      const mockOnSubscribe = jest.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(<NewsletterForm {...defaultProps} onSubscribe={mockOnSubscribe} />);

      await user.type(screen.getByRole('textbox'), 'propmode@example.com');
      await user.click(screen.getByRole('button', { name: defaultProps.submitLabel }));

      await waitFor(() => {
        expect(mockOnSubscribe).toHaveBeenCalledWith('propmode@example.com');
      });

      // Should NOT call fetch when onSubscribe is provided
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('switches to auto mode when onSubscribe is undefined', async () => {
      mockFetchResponse(201, 'newsletter.success');
      const { user } = renderAutoMode();

      await user.type(screen.getByRole('textbox'), 'automode@example.com');
      await user.click(screen.getByRole('button', { name: /subscribe/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('UI State Management', () => {
    it('disables button during API call', async () => {
      // Mock slow response
      global.fetch = jest.fn(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  status: 201,
                  json: () => Promise.resolve({ messageKey: 'newsletter.success' }),
                  headers: new Headers(),
                } as Response),
              200,
            );
          }),
      );

      const { user } = renderAutoMode();
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(screen.getByRole('textbox'), 'slow@example.com');
      await user.click(submitButton);

      // Button should be disabled immediately
      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByText('Successfully subscribed to our newsletter!')).toBeInTheDocument();
      });
    });

    it('prevents double submission with inFlight guard', async () => {
      global.fetch = jest.fn(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                status: 201,
                json: () => Promise.resolve({ messageKey: 'newsletter.success' }),
                headers: new Headers(),
              } as Response);
            }, 100);
          }),
      );

      const { user } = renderAutoMode();
      const submitButton = screen.getByRole('button', { name: /subscribe/i });
      const emailInput = screen.getByRole('textbox');

      await user.type(emailInput, 'double@example.com');

      // Try to click multiple times rapidly
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Successfully subscribed to our newsletter!')).toBeInTheDocument();
      });

      // Should only call fetch once despite multiple clicks
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('clears input on successful submission', async () => {
      mockFetchResponse(201, 'newsletter.success');
      const { user } = renderAutoMode();

      const emailInput = screen.getByRole('textbox');
      await user.type(emailInput, 'clear@example.com');

      expect(emailInput).toHaveValue('clear@example.com');

      await user.click(screen.getByRole('button', { name: /subscribe/i }));

      await waitFor(() => {
        expect(emailInput).toHaveValue('');
      });
    });

    it('does not clear input on error', async () => {
      mockFetchResponse(500, 'newsletter.serverError');
      const { user } = renderAutoMode();

      const emailInput = screen.getByRole('textbox');
      await user.type(emailInput, 'error@example.com');

      await user.click(screen.getByRole('button', { name: /subscribe/i }));

      await waitFor(() => {
        expect(
          screen.getByText('An unexpected error occurred. Please try again.'),
        ).toBeInTheDocument();
      });

      // Input should retain value for easy retry
      expect(emailInput).toHaveValue('error@example.com');
    });
  });

  describe('Accessibility', () => {
    it('announces success message to screen readers', async () => {
      mockFetchResponse(201, 'newsletter.success');
      const { user } = renderAutoMode();

      await user.type(screen.getByRole('textbox'), 'a11y@example.com');
      await user.click(screen.getByRole('button', { name: /subscribe/i }));

      await waitFor(() => {
        const statusRegion = screen.getByRole('status');
        expect(statusRegion).toHaveAttribute('aria-live', 'polite');
        expect(statusRegion).toHaveAttribute('aria-atomic', 'true');
        expect(statusRegion).toHaveTextContent('Successfully subscribed to our newsletter!');
      });
    });

    it('announces error message to screen readers', async () => {
      mockFetchResponse(409, 'newsletter.alreadySubscribed');
      const { user } = renderAutoMode();

      await user.type(screen.getByRole('textbox'), 'a11yerror@example.com');
      await user.click(screen.getByRole('button', { name: /subscribe/i }));

      await waitFor(() => {
        const statusRegion = screen.getByRole('status');
        expect(statusRegion).toHaveTextContent('This email is already subscribed.');
      });
    });

    it('marks input as invalid on validation errors', async () => {
      mockFetchResponse(400, 'newsletter.invalidEmail');
      const { user } = renderAutoMode();

      const emailInput = screen.getByRole('textbox');
      await user.type(emailInput, 'invalid@example.com');
      await user.click(screen.getByRole('button', { name: /subscribe/i }));

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
        expect(emailInput).toHaveAttribute('aria-describedby', 'newsletter-error');
      });
    });
  });

  describe('Server Key Mapping', () => {
    it('correctly maps server keys with newsletter prefix', async () => {
      mockFetchResponse(201, 'newsletter.success');
      const { user } = renderAutoMode();

      await user.type(screen.getByRole('textbox'), 'prefix@example.com');
      await user.click(screen.getByRole('button', { name: /subscribe/i }));

      await waitFor(() => {
        expect(screen.getByText('Successfully subscribed to our newsletter!')).toBeInTheDocument();
      });
    });

    it('correctly maps server keys without newsletter prefix', async () => {
      mockFetchResponse(201, 'success');
      const { user } = renderAutoMode();

      await user.type(screen.getByRole('textbox'), 'noprefix@example.com');
      await user.click(screen.getByRole('button', { name: /subscribe/i }));

      await waitFor(() => {
        expect(screen.getByText('Successfully subscribed to our newsletter!')).toBeInTheDocument();
      });
    });

    it('maps all expected server response keys correctly', async () => {
      const testCases = [
        {
          messageKey: 'newsletter.success',
          status: 201,
          expectedText: 'Successfully subscribed to our newsletter!',
        },
        {
          messageKey: 'newsletter.alreadySubscribed',
          status: 409,
          expectedText: 'This email is already subscribed.',
        },
        {
          messageKey: 'newsletter.rateLimitExceeded',
          status: 429,
          expectedText: 'Rate limit exceeded. Please wait before trying again.',
        },
        {
          messageKey: 'newsletter.invalidEmail',
          status: 400,
          expectedText: 'Please provide a valid email address.',
        },
        {
          messageKey: 'newsletter.serverError',
          status: 500,
          expectedText: 'An unexpected error occurred. Please try again.',
        },
      ];

      // Test each case in its own describe block to ensure proper isolation
      for (const { messageKey, status, expectedText } of testCases) {
        mockFetchResponse(status, messageKey);

        const { user } = renderAutoMode();
        const emailInput = screen.getAllByRole('textbox').slice(-1)[0]; // Get the last rendered textbox
        const submitButton = screen.getAllByRole('button', { name: /subscribe/i }).slice(-1)[0];

        await user.type(emailInput, `test-${messageKey.replace(/\./g, '-')}@example.com`);
        await user.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText(expectedText)).toBeInTheDocument();
        });
      }
    });
  });
});

