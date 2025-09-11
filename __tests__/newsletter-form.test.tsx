import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { NewsletterForm } from '@/components/NewsletterForm';

import { act } from '../test/utils/act';

/**
 * NewsletterForm Component Tests
 *
 * REVIEW: These tests follow RTL best practices with async userEvent patterns
 * and comprehensive accessibility assertions to eliminate act() warnings
 * and ensure production-grade a11y compliance.
 */
describe('NewsletterForm Component', () => {
  const defaultProps = {
    title: 'Subscribe to Updates',
    description: 'Get the latest news from QuantumPoly',
    emailLabel: 'Email address',
    emailPlaceholder: 'Enter your email',
    submitLabel: 'Subscribe',
    successMessage: 'Successfully subscribed!',
    errorMessage: 'Please enter a valid email address',
  };

  // FEEDBACK: Helper function reduces test setup duplication and ensures consistent mock behavior
  function setup(overrides: Partial<React.ComponentProps<typeof NewsletterForm>> = {}) {
    const onSubscribe = jest.fn(async () => {
      // Simulate realistic async behavior with small delay
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    render(<NewsletterForm {...defaultProps} onSubscribe={onSubscribe} {...overrides} />);
    return { onSubscribe };
  }

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
    const user = userEvent.setup();
    setup();

    const emailInput = screen.getByRole('textbox', { name: defaultProps.emailLabel });
    const submitButton = screen.getByRole('button', { name: defaultProps.submitLabel });

    // Test invalid email path - should use role="status" for non-critical validation
    await act(async () => {
      await user.clear(emailInput);
      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      expect(emailInput).toHaveAttribute('aria-describedby', 'newsletter-error');
    });

    // Verify error is announced via status region (aria-live=polite), NOT alert
    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toHaveAttribute('aria-live', 'polite');
    expect(statusRegion).not.toHaveAttribute('role', 'alert');

    const errorElement = within(statusRegion).getByText(defaultProps.errorMessage);
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveAttribute('id', 'newsletter-error');

    // Test valid email path - success should also use role="status"
    await act(async () => {
      await user.clear(emailInput);
      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);
    });

    await waitFor(() => {
      const statusAfterSuccess = screen.getByRole('status');
      expect(statusAfterSuccess).toHaveAttribute('aria-live', 'polite');
      expect(submitButton).toHaveTextContent(defaultProps.successMessage);
      expect(emailInput).not.toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('uses custom validationRegex when provided', async () => {
    const user = userEvent.setup();
    const customRegex = /^[a-zA-Z0-9._%+-]+@example\.com$/; // Only example.com emails
    const { onSubscribe } = setup({ validationRegex: customRegex });

    const emailInput = screen.getByRole('textbox', { name: defaultProps.emailLabel });
    const submitButton = screen.getByRole('button', { name: defaultProps.submitLabel });

    // Test invalid email (not @example.com)
    await act(async () => {
      await user.clear(emailInput);
      await user.type(emailInput, 'test@gmail.com');
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    });
    expect(screen.getByText(defaultProps.errorMessage)).toBeInTheDocument();

    // Clear and test valid email with custom regex
    await act(async () => {
      await user.clear(emailInput);
      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);
    });

    // FEEDBACK: Verify custom validation passes and submission occurs
    expect(onSubscribe).toHaveBeenCalledWith('test@example.com');
    await waitFor(() => {
      expect(screen.queryByText(defaultProps.errorMessage)).not.toBeInTheDocument();
      expect(emailInput).not.toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('calls onSubscribe with valid email and shows success message', async () => {
    const user = userEvent.setup();
    const { onSubscribe } = setup();

    const emailInput = screen.getByRole('textbox', { name: defaultProps.emailLabel });
    const submitButton = screen.getByRole('button', { name: defaultProps.submitLabel });

    await act(async () => {
      await user.clear(emailInput);
      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);
    });

    // FEEDBACK: Verify async submission call
    expect(onSubscribe).toHaveBeenCalledWith('test@example.com');

    // REVIEW: Wait for async success state updates
    await waitFor(() => {
      expect(submitButton).toHaveTextContent(defaultProps.successMessage);
      expect(submitButton).toBeDisabled(); // Success state disables button
    });

    // DISCUSS: Verify input cleared and aria-invalid reset
    expect(emailInput).toHaveValue('');
    expect(emailInput).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('handles onSubscribe rejection and shows error', async () => {
    const user = userEvent.setup();
    const rejectedOnSubscribe = jest.fn().mockRejectedValue(new Error('Network error'));
    setup({ onSubscribe: rejectedOnSubscribe });

    const emailInput = screen.getByRole('textbox', { name: defaultProps.emailLabel });
    const submitButton = screen.getByRole('button', { name: defaultProps.submitLabel });

    await act(async () => {
      await user.clear(emailInput);
      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);
    });

    expect(rejectedOnSubscribe).toHaveBeenCalledWith('test@example.com');

    // REVIEW: Wait for async error handling and a11y state updates
    await waitFor(() => {
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    });

    const statusRegion = screen.getByRole('status');
    const errorElement = within(statusRegion).getByText(defaultProps.errorMessage);
    expect(errorElement).toBeInTheDocument();
  });

  it('success message appears and is announced to screen readers', async () => {
    const user = userEvent.setup();
    const { onSubscribe } = setup();

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
    const user = userEvent.setup();
    let resolveSubmission: () => void;
    const slowOnSubscribe = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmission = resolve;
        }),
    );
    setup({ onSubscribe: slowOnSubscribe });

    const emailInput = screen.getByRole('textbox', { name: defaultProps.emailLabel });
    const submitButton = screen.getByRole('button', { name: defaultProps.submitLabel });

    await act(async () => {
      await user.clear(emailInput);
      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);
    });

    // REVIEW: Button should be disabled during async submission
    expect(submitButton).toBeDisabled();

    // Resolve the async submission
    await act(async () => {
      resolveSubmission!();
    });

    await waitFor(() => {
      // FEEDBACK: Button remains disabled in success state with updated text
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent(defaultProps.successMessage);
    });
  });

  it('falls back to default behavior when no onSubscribe is provided', async () => {
    const user = userEvent.setup();
    render(<NewsletterForm {...defaultProps} />); // No onSubscribe prop

    const emailInput = screen.getByRole('textbox', { name: defaultProps.emailLabel });
    const submitButton = screen.getByRole('button', { name: defaultProps.submitLabel });

    await act(async () => {
      await user.clear(emailInput);
      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);
    });

    // REVIEW: Wait for async fallback simulation (600ms timeout in component)
    await waitFor(
      () => {
        expect(submitButton).toHaveTextContent(defaultProps.successMessage);
        expect(submitButton).toBeDisabled();
      },
      { timeout: 1000 },
    );

    // Verify email is cleared in success state
    expect(emailInput).toHaveValue('');
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
    const user = userEvent.setup();
    const { onSubscribe } = setup();

    const emailInput = screen.getByRole('textbox', { name: defaultProps.emailLabel });

    await act(async () => {
      await user.clear(emailInput);
      await user.type(emailInput, 'test@example.com');
      await user.keyboard('{Enter}');
    });

    // FEEDBACK: Verify Enter key triggers async form submission
    expect(onSubscribe).toHaveBeenCalledWith('test@example.com');

    await waitFor(() => {
      const submitButton = screen.getByRole('button');
      expect(submitButton).toHaveTextContent(defaultProps.successMessage);
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
