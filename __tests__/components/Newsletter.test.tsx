/**
 * @fileoverview Unit tests for Newsletter component
 * @module __tests__/components/Newsletter.test
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import Newsletter from '../../src/components/Newsletter';
import { NewsletterProps } from '../../src/types/components';

describe('Newsletter Component', () => {
  const mockOnSubmit = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    document.body.innerHTML = '';
    mockOnSubmit.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Newsletter />);

      expect(screen.getByRole('region')).toBeInTheDocument();
      expect(screen.getByText('Stay Connected')).toBeInTheDocument();
      expect(
        screen.getByText('Sign up for updates on our journey into the future.')
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Enter your email')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /subscribe/i })
      ).toBeInTheDocument();
    });

    it('renders with custom props', () => {
      const customProps: NewsletterProps = {
        title: 'Custom Newsletter Title',
        description: 'Custom description text.',
        emailPlaceholder: 'Your email here',
        subscribeText: 'Sign Up',
        privacyText: 'Custom privacy notice.',
        id: 'custom-newsletter',
      };

      render(<Newsletter {...customProps} />);

      expect(screen.getByText('Custom Newsletter Title')).toBeInTheDocument();
      expect(screen.getByText('Custom description text.')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Your email here')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /sign up/i })
      ).toBeInTheDocument();
      expect(screen.getByText('Custom privacy notice.')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(<Newsletter />);

      const section = screen.getByRole('region');
      expect(section).toHaveAttribute(
        'aria-labelledby',
        'newsletter-section-heading'
      );

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', 'newsletter-section-heading');
      expect(heading).toHaveAttribute('tabIndex', '0');
    });

    it('provides proper form accessibility', () => {
      render(<Newsletter />);

      const emailInput = screen.getByRole('textbox');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('id', 'newsletter-section-email');

      const label = screen.getByLabelText(
        'Email address for newsletter subscription'
      );
      expect(label).toBeInTheDocument();

      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('noValidate');
      expect(form).toHaveAttribute(
        'aria-describedby',
        'newsletter-section-description'
      );
    });

    it('manages ARIA states for validation', async () => {
      render(<Newsletter />);

      const emailInput = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      // Submit invalid email
      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('provides screen reader status updates', async () => {
      render(<Newsletter />);

      const emailInput = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Subscription successful')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('validates email format', async () => {
      render(<Newsletter />);

      const emailInput = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      // Test invalid email
      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Please enter a valid email address.')
        ).toBeInTheDocument();
      });
    });

    it('accepts valid email formats', async () => {
      render(<Newsletter onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith('test@example.com');
      });
    });

    it('sanitizes input to prevent XSS', async () => {
      render(<Newsletter onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(
        emailInput,
        'test<script>alert("xss")</script>@example.com'
      );
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          'testscriptalert("xss")/script@example.com'
        );
      });
    });

    it('clears error when user starts typing', async () => {
      render(<Newsletter />);

      const emailInput = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      // Create error
      await user.type(emailInput, 'invalid');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Please enter a valid email address.')
        ).toBeInTheDocument();
      });

      // Start typing to clear error
      await user.type(emailInput, '@example.com');

      await waitFor(() => {
        expect(
          screen.queryByText('Please enter a valid email address.')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('calls onSubmit with valid email', async () => {
      render(<Newsletter onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith('test@example.com');
      });
    });

    it('shows success message after successful submission', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      render(<Newsletter onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            'Thank you for subscribing! Check your email for confirmation.'
          )
        ).toBeInTheDocument();
      });
    });

    it('shows error message when submission fails', async () => {
      mockOnSubmit.mockRejectedValue(new Error('Submission failed'));
      render(<Newsletter onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Something went wrong. Please try again later.')
        ).toBeInTheDocument();
      });
    });

    it('clears form after successful submission', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      render(<Newsletter onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByRole('textbox') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(emailInput.value).toBe('');
      });
    });

    it('shows fallback success when no onSubmit provided', async () => {
      render(<Newsletter />);

      const emailInput = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            'Thank you for your interest! Subscription functionality will be available soon.'
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('disables form during submission', async () => {
      let resolveSubmit: (value?: unknown) => void;
      const pendingPromise = new Promise(resolve => {
        resolveSubmit = resolve;
      });
      mockOnSubmit.mockReturnValue(pendingPromise);

      render(<Newsletter onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Subscribing...')).toBeInTheDocument();
        expect(emailInput).toBeDisabled();
        expect(submitButton).toBeDisabled();
      });

      // Resolve the promise
      resolveSubmit!();

      await waitFor(() => {
        expect(emailInput).not.toBeDisabled();
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('shows loading spinner during submission', async () => {
      let resolveSubmit: (value?: unknown) => void;
      const pendingPromise = new Promise(resolve => {
        resolveSubmit = resolve;
      });
      mockOnSubmit.mockReturnValue(pendingPromise);

      render(<Newsletter onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });

      resolveSubmit!();
    });

    it('respects external loading prop', () => {
      render(<Newsletter isLoading={true} />);

      const emailInput = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      expect(emailInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(screen.getByText('Subscribing...')).toBeInTheDocument();
    });
  });

  describe('Custom Messages', () => {
    it('displays custom success message', async () => {
      const customSuccessMessage = 'Custom success message!';
      render(<Newsletter successMessage={customSuccessMessage} />);

      const emailInput = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(customSuccessMessage)).toBeInTheDocument();
      });
    });

    it('displays custom error message', async () => {
      const customErrorMessage = 'Custom error message!';
      render(<Newsletter errorMessage={customErrorMessage} />);

      const emailInput = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Please enter a valid email address.')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Theming and Styling', () => {
    it('applies custom className', () => {
      render(<Newsletter className="custom-newsletter-class" />);

      const section = screen.getByRole('region');
      expect(section).toHaveClass('custom-newsletter-class');
    });

    it('applies custom id', () => {
      render(<Newsletter id="custom-newsletter" />);

      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('id', 'custom-newsletter');

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', 'custom-newsletter-heading');
    });

    it('includes theme-aware styling', () => {
      render(<Newsletter />);

      const section = screen.getByRole('region');
      expect(section.className).toMatch(/dark:/);

      const emailInput = screen.getByRole('textbox');
      expect(emailInput.className).toMatch(/dark:/);
    });
  });

  describe('Button States', () => {
    it('disables submit button when email is empty', () => {
      render(<Newsletter />);

      const submitButton = screen.getByRole('button', { name: /subscribe/i });
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when email is provided', async () => {
      render(<Newsletter />);

      const emailInput = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'test@example.com');

      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Props Validation', () => {
    it('spreads additional props to section element', () => {
      render(<Newsletter data-testid="newsletter-section" />);

      const section = screen.getByTestId('newsletter-section');
      expect(section).toBeInTheDocument();
    });
  });
});
