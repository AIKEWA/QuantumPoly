'use client';

import React, { useState } from 'react';
import { NewsletterProps } from '../types/components';

/**
 * Newsletter Subscription Component
 *
 * A comprehensive newsletter signup form featuring:
 * - Full accessibility with ARIA labels and error handling
 * - Email validation and loading states
 * - Theme-aware styling with proper contrast
 * - Keyboard navigation and focus management
 * - Success and error state handling
 * - Screen reader optimized feedback
 * - Sanitized input handling for security
 *
 * @param props - Newsletter component props
 * @returns JSX.Element - Rendered newsletter subscription section
 */
export default function Newsletter({
  title = 'Stay Connected',
  description = 'Sign up for updates on our journey into the future.',
  emailPlaceholder = 'Enter your email',
  subscribeText = 'Subscribe',
  privacyText = 'We respect your privacy. Unsubscribe at any time.',
  onSubmit,
  isLoading = false,
  successMessage,
  errorMessage,
  className = '',
  id = 'newsletter-section',
  ...props
}: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [localSuccess, setLocalSuccess] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // REVIEW: Consider adding email format validation beyond HTML5
  // FEEDBACK: Should we add subscription preferences (frequency, topics)?

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const sanitizeInput = (input: string): string => {
    // Basic input sanitization to prevent XSS
    return input.trim().replace(/[<>]/g, '');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous messages
    setLocalError('');
    setLocalSuccess('');
    setIsSubmitted(true);

    const sanitizedEmail = sanitizeInput(email);

    // Validate email format
    if (!validateEmail(sanitizedEmail)) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    setLocalLoading(true);

    try {
      if (onSubmit) {
        await onSubmit(sanitizedEmail);
        setLocalSuccess(
          successMessage ||
            'Thank you for subscribing! Check your email for confirmation.'
        );
        setEmail(''); // Clear form on success
      } else {
        // Fallback success message when no handler provided
        setLocalSuccess(
          'Thank you for your interest! Subscription functionality will be available soon.'
        );
        setEmail('');
      }
    } catch (error) {
      setLocalError(
        errorMessage || 'Something went wrong. Please try again later.'
      );
    } finally {
      setLocalLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    // Clear error when user starts typing
    if (localError) {
      setLocalError('');
    }

    // Reset submitted state when user modifies email
    if (isSubmitted) {
      setIsSubmitted(false);
    }
  };

  const currentLoading = isLoading || localLoading;
  const currentSuccess = successMessage || localSuccess;
  const currentError = errorMessage || localError;

  return (
    <section
      id={id}
      className={`bg-gray-800 px-4 py-16 transition-colors duration-300 md:px-6 dark:bg-black dark:bg-opacity-90 ${className}`}
      aria-labelledby={`${id}-heading`}
      role="region"
      {...props}
    >
      <div className="mx-auto max-w-3xl">
        <div className="cyberpunk-border rounded-xl bg-gradient-to-br from-gray-700 to-gray-600 p-6 transition-colors duration-300 sm:p-8 dark:from-gray-900 dark:to-gray-800">
          <h2
            id={`${id}-heading`}
            className="cyberpunk-glow mb-4 rounded-lg text-center text-xl font-bold text-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 sm:text-2xl md:text-3xl"
            tabIndex={0}
          >
            {title}
          </h2>

          <p
            className="mb-8 text-center text-gray-300 transition-colors duration-300 dark:text-gray-400"
            id={`${id}-description`}
          >
            {description}
          </p>

          {/* Success Message */}
          {currentSuccess && (
            <div
              className="mb-6 rounded-lg border border-green-300 bg-green-100 p-4 text-center text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300"
              role="status"
              aria-live="polite"
            >
              {currentSuccess}
            </div>
          )}

          {/* Error Message */}
          {currentError && (
            <div
              className="mb-6 rounded-lg border border-red-300 bg-red-100 p-4 text-center text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300"
              role="alert"
              aria-live="assertive"
            >
              {currentError}
            </div>
          )}

          <form
            className="mx-auto max-w-md"
            onSubmit={handleSubmit}
            noValidate
            aria-describedby={`${id}-description`}
          >
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <label htmlFor={`${id}-email`} className="sr-only">
                  Email address for newsletter subscription
                </label>
                <input
                  id={`${id}-email`}
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder={emailPlaceholder}
                  className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-gray-900 placeholder-gray-500 transition-colors duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                  required
                  disabled={currentLoading}
                  aria-invalid={currentError ? 'true' : 'false'}
                  aria-describedby={currentError ? `${id}-error` : undefined}
                />
              </div>

              <button
                type="submit"
                disabled={currentLoading || !email.trim()}
                className="transform rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:scale-105 hover:from-cyan-400 hover:to-blue-500 focus:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 active:scale-95 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50 dark:from-cyan-400 dark:to-blue-500 dark:hover:from-cyan-300 dark:hover:to-blue-400"
                aria-describedby="subscribe-status"
              >
                {currentLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="opacity-25"
                      />
                      <path
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        className="opacity-75"
                      />
                    </svg>
                    <span className="sr-only">Loading...</span>
                    Subscribing...
                  </span>
                ) : (
                  subscribeText
                )}
              </button>
            </div>

            <p
              className="mt-4 text-center text-xs text-gray-400 transition-colors duration-300 dark:text-gray-500"
              id="privacy-notice"
            >
              {privacyText}
            </p>

            {/* Hidden status for screen readers */}
            <div id="subscribe-status" className="sr-only" aria-live="polite">
              {currentLoading
                ? 'Submitting subscription...'
                : currentSuccess
                  ? 'Subscription successful'
                  : currentError
                    ? 'Subscription failed'
                    : ''}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
