import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { NewsletterForm } from '@/components/NewsletterForm';

import {
  createRejectingOnSubscribe,
  createSlowOnSubscribe,
  defaultProps,
  setupNewsletterForm,
  testEmails,
  testPatterns,
} from './utils/newsletter-form-helpers';
import { act } from '../test/utils/act';

/**
 * NewsletterForm Component Tests
 *
 * REVIEW: These tests follow RTL best practices with async userEvent patterns
 * and comprehensive accessibility assertions to eliminate act() warnings
 * and ensure production-grade a11y compliance.
 */
describe('NewsletterForm Component', () => {
  it('renders all user-visible text from props', () => {
    render(<NewsletterForm {...defaultProps} />);

    expect(screen.getByRole('heading', { name: defaultProps.title })).toBeInTheDocument();
    expect(screen.getByText(defaultProps.description)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: defaultProps.emailLabel })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: defaultProps.submitLabel })).toBeInTheDocument();
  });

  it('email input is properly labeled and accessible', () => {
    render(<NewsletterForm {...defaultProps} />);

    const emailInput = screen.getByRole('textbox', { name: defaultProps.emailLabel });
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('placeholder', defaultProps.emailPlaceholder);
    expect(emailInput).toHaveAttribute('required');
    expect(emailInput).toHaveAttribute('id', 'newsletter-email');
  });

  it('non-critical errors and success use role=status (aria-live=polite)', async () => {
    const { user, elements } = setupNewsletterForm();

    // Test invalid email path - should use role="status" for non-critical validation
    await act(async () => {
      await testPatterns.typeAndSubmit(user, testEmails.invalid);
    });

    await waitFor(() => {
      expect(elements.emailInput()).toHaveAttribute('aria-invalid', 'true');
      expect(elements.emailInput()).toHaveAttribute('aria-describedby', 'newsletter-error');
    });

    // Verify error is announced via status region (aria-live=polite), NOT alert
    const statusRegion = elements.statusRegion();
    expect(statusRegion).toHaveAttribute('aria-live', 'polite');
    expect(statusRegion).not.toHaveAttribute('role', 'alert');

    const errorElement = within(statusRegion).getByText(defaultProps.errorMessage);
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveAttribute('id', 'newsletter-error');

    // Test valid email path - success should also use role="status"
    await act(async () => {
      await testPatterns.typeAndSubmit(user, testEmails.valid);
    });

    await waitFor(() => {
      const statusAfterSuccess = elements.statusRegion();
      expect(statusAfterSuccess).toHaveAttribute('aria-live', 'polite');
      expect(elements.submitButton()).toHaveTextContent(defaultProps.successMessage);
      expect(elements.emailInput()).not.toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('uses custom validationRegex when provided', async () => {
    const customRegex = /^[a-zA-Z0-9._%+-]+@example\.com$/; // Only example.com emails
    const { onSubscribe, user, elements } = setupNewsletterForm({ validationRegex: customRegex });

    // Test invalid email (not @example.com)
    await act(async () => {
      await testPatterns.typeAndSubmit(user, testEmails.customInvalid);
    });

    await waitFor(() => {
      expect(elements.emailInput()).toHaveAttribute('aria-invalid', 'true');
    });
    expect(screen.getByText(defaultProps.errorMessage)).toBeInTheDocument();

    // Clear and test valid email with custom regex
    await act(async () => {
      await testPatterns.typeAndSubmit(user, testEmails.customValid);
    });

    // FEEDBACK: Verify custom validation passes and submission occurs
    expect(onSubscribe).toHaveBeenCalledWith(testEmails.customValid);
    await waitFor(() => {
      expect(screen.queryByText(defaultProps.errorMessage)).not.toBeInTheDocument();
      expect(elements.emailInput()).not.toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('calls onSubscribe with valid email and shows success message', async () => {
    const { onSubscribe, user, elements } = setupNewsletterForm();

    await act(async () => {
      await testPatterns.typeAndSubmit(user, testEmails.valid);
    });

    // FEEDBACK: Verify async submission call
    expect(onSubscribe).toHaveBeenCalledWith(testEmails.valid);

    // REVIEW: Wait for async success state updates
    await waitFor(() => {
      expect(elements.submitButton()).toHaveTextContent(defaultProps.successMessage);
      expect(elements.submitButton()).toBeDisabled(); // Success state disables button
    });

    // DISCUSS: Verify input cleared and aria-invalid reset
    expect(elements.emailInput()).toHaveValue('');
    expect(elements.emailInput()).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('handles onSubscribe rejection and shows error', async () => {
    const rejectedOnSubscribe = createRejectingOnSubscribe();
    const { user, elements } = setupNewsletterForm({ onSubscribe: rejectedOnSubscribe });

    await act(async () => {
      await testPatterns.typeAndSubmit(user, testEmails.valid);
    });

    expect(rejectedOnSubscribe).toHaveBeenCalledWith(testEmails.valid);

    // REVIEW: Wait for async error handling and a11y state updates
    await waitFor(() => {
      expect(elements.emailInput()).toHaveAttribute('aria-invalid', 'true');
    });

    const statusRegion = elements.statusRegion();
    const errorElement = within(statusRegion).getByText(defaultProps.errorMessage);
    expect(errorElement).toBeInTheDocument();
  });

  it('success message appears and is announced to screen readers', async () => {
    const user = userEvent.setup();
    const { onSubscribe } = setupNewsletterForm();

    const emailInput = screen.getByRole('textbox', { name: defaultProps.emailLabel });
    const submitButton = screen.getByRole('button', { name: defaultProps.submitLabel });

    await act(async () => {
      await user.clear(emailInput);
      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);
    });

    expect(onSubscribe).toHaveBeenCalledWith('test@example.com');

    // DISCUSS: Verify aria-live region exists and success is properly announced
    await waitFor(() => {
      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveAttribute('aria-live', 'polite');
      expect(submitButton).toHaveTextContent(defaultProps.successMessage);
      expect(submitButton).toBeDisabled(); // Success state
    });
  });

  it('disables submit button during submission and success states', async () => {
    const { slowOnSubscribe, resolveSubmission } = createSlowOnSubscribe();
    const { user, elements } = setupNewsletterForm({ onSubscribe: slowOnSubscribe });

    await act(async () => {
      await testPatterns.typeAndSubmit(user, testEmails.valid);
    });

    // REVIEW: Button should be disabled during async submission
    expect(elements.submitButton()).toBeDisabled();

    // Resolve the async submission
    await act(async () => {
      resolveSubmission();
    });

    await waitFor(() => {
      // FEEDBACK: Button remains disabled in success state with updated text
      expect(elements.submitButton()).toBeDisabled();
      expect(elements.submitButton()).toHaveTextContent(defaultProps.successMessage);
    });
  });

  it('uses API integration in auto mode when no onSubscribe is provided', async () => {
    // Mock successful API response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ messageKey: 'newsletter.success' }),
        headers: new Headers(),
      } as Response),
    );

    const user = userEvent.setup();
    render(<NewsletterForm {...defaultProps} />); // No onSubscribe prop

    const emailInput = screen.getByRole('textbox', { name: defaultProps.emailLabel });
    const submitButton = screen.getByRole('button', { name: defaultProps.submitLabel });

    await act(async () => {
      await user.clear(emailInput);
      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);
    });

    // REVIEW: Wait for async API call to complete
    await waitFor(
      () => {
        expect(submitButton).toHaveTextContent(defaultProps.successMessage);
        expect(submitButton).toBeDisabled();
      },
      { timeout: 1000 },
    );

    // Verify API was called
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/newsletter',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      }),
    );

    // Verify email is cleared in success state
    expect(emailInput).toHaveValue('');

    // Clean up mock
    jest.restoreAllMocks();
  });

  it('form has proper semantic structure', () => {
    render(<NewsletterForm {...defaultProps} />);

    expect(screen.getByRole('region')).toBeInTheDocument(); // section
    expect(screen.getByRole('form')).toBeInTheDocument(); // form
    expect(screen.getByRole('textbox')).toBeInTheDocument(); // input
    expect(screen.getByRole('button')).toBeInTheDocument(); // submit button
  });

  it('applies custom className to root section', () => {
    const customClass = 'custom-newsletter-class';
    render(<NewsletterForm {...defaultProps} className={customClass} />);

    const section = screen.getByRole('region');
    expect(section).toHaveClass(customClass);
  });

  it('handles form submission via Enter key', async () => {
    const { onSubscribe, user, elements } = setupNewsletterForm();

    await act(async () => {
      await testPatterns.typeAndSubmitWithEnter(user, testEmails.valid);
    });

    // FEEDBACK: Verify Enter key triggers async form submission
    expect(onSubscribe).toHaveBeenCalledWith(testEmails.valid);

    await waitFor(() => {
      expect(elements.submitButton()).toHaveTextContent(defaultProps.successMessage);
    });
  });

  it('does not render description when not provided', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { description, ...propsWithoutDescription } = defaultProps;

    render(<NewsletterForm {...propsWithoutDescription} />);

    expect(screen.getByRole('heading', { name: defaultProps.title })).toBeInTheDocument();
    expect(screen.queryByText(defaultProps.description)).not.toBeInTheDocument();
  });
});
