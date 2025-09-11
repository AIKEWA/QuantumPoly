import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { NewsletterForm } from '@/components/NewsletterForm';

/**
 * NewsletterForm Test Helpers
 *
 * Modular helper functions to reduce test duplication and ensure consistent
 * testing patterns across NewsletterForm test suites.
 */

export const defaultProps = {
  title: 'Subscribe to Updates',
  description: 'Get the latest news from QuantumPoly',
  emailLabel: 'Email address',
  emailPlaceholder: 'Enter your email',
  submitLabel: 'Subscribe',
  successMessage: 'Successfully subscribed!',
  errorMessage: 'Please enter a valid email address',
};

/**
 * Setup helper that renders NewsletterForm with consistent mock behavior
 * @param overrides - Props to override defaults
 * @returns Mock functions and user event instance
 */
export function setupNewsletterForm(
  overrides: Partial<React.ComponentProps<typeof NewsletterForm>> = {},
) {
  const onSubscribe = jest.fn(async () => {
    // Simulate realistic async behavior with small delay
    await new Promise((resolve) => setTimeout(resolve, 10));
  });

  const user = userEvent.setup();

  render(<NewsletterForm {...defaultProps} onSubscribe={onSubscribe} {...overrides} />);

  return {
    onSubscribe,
    user,
    elements: {
      heading: () => screen.getByRole('heading', { name: defaultProps.title }),
      emailInput: () => screen.getByRole('textbox', { name: defaultProps.emailLabel }),
      submitButton: () => screen.getByRole('button', { name: defaultProps.submitLabel }),
      statusRegion: () => screen.getByRole('status'),
      form: () => screen.getByRole('form'),
      section: () => screen.getByRole('region'),
    },
  };
}

/**
 * Creates a mock onSubscribe function that rejects with an error
 */
export function createRejectingOnSubscribe() {
  return jest.fn().mockRejectedValue(new Error('Network error'));
}

/**
 * Creates a mock onSubscribe function with controllable async behavior
 * @returns Object with mock function and resolver
 */
export function createSlowOnSubscribe() {
  let resolveSubmission: () => void;
  const slowOnSubscribe = jest.fn(
    () =>
      new Promise<void>((resolve) => {
        resolveSubmission = resolve;
      }),
  );

  return {
    slowOnSubscribe,
    resolveSubmission: () => resolveSubmission!(),
  };
}

/**
 * Common email validation test cases
 */
export const testEmails = {
  valid: 'test@example.com',
  invalid: 'invalid-email',
  customValid: 'test@example.com',
  customInvalid: 'test@gmail.com', // For custom regex testing
  errorTrigger: 'test-error@example.com',
} as const;

/**
 * Common async test patterns
 */
export const testPatterns = {
  /**
   * Types an email and submits the form
   */
  async typeAndSubmit(user: ReturnType<typeof userEvent.setup>, email: string) {
    const emailInput = screen.getByRole('textbox', { name: defaultProps.emailLabel });
    const submitButton = screen.getByRole('button', { name: defaultProps.submitLabel });

    await user.clear(emailInput);
    await user.type(emailInput, email);
    await user.click(submitButton);
  },

  /**
   * Types an email and submits via Enter key
   */
  async typeAndSubmitWithEnter(user: ReturnType<typeof userEvent.setup>, email: string) {
    const emailInput = screen.getByRole('textbox', { name: defaultProps.emailLabel });

    await user.clear(emailInput);
    await user.type(emailInput, email);
    await user.keyboard('{Enter}');
  },
} as const;
