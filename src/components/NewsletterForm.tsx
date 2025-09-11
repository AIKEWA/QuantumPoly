/**
 * NewsletterForm.tsx – Subscribe component for QuantumPoly
 *
 * Purpose: Provide an accessible, prop-driven email subscription form that can be reused in any
 * page/section. Text copy is supplied through typed props enabling i18n. The component validates
 * basic email syntax on the client and exposes an optional `onSubmit` callback for integration
 * with real APIs.
 *
 * Accessibility & a11y decisions:
 * – Email input associated with `<label>` via `htmlFor`
 * – Validation errors announce through `aria-live="polite"` region
 * – `aria-invalid` toggled on the input when validation fails
 * – Visual focus styles rely on Tailwind focus ring utilities
 *
 * ADR: Chose local state & optimistic UI over uncontrolled form to keep UX responsive while
 * allowing easy replacement of the submission logic via `onSubmit` prop.
 */
'use client';

import clsx from 'clsx';
import React, { useState, FormEvent } from 'react';

/** Props for NewsletterForm */
export interface NewsletterFormProps {
  /** Heading text displayed above the form */
  title: string;
  /** Optional description displayed under the title */
  description?: string;
  /** Label text for the email input */
  emailLabel: string;
  /** Placeholder for the email input */
  emailPlaceholder: string;
  /** Label for the submit button */
  submitLabel: string;
  /** Message announced on successful subscription */
  successMessage: string;
  /** Message announced when submission fails */
  errorMessage: string;
  /** Optional external submit handler. Receives the email string and should resolve/reject */
  onSubscribe?: (email: string) => Promise<void>;
  /** Extra className for root section */
  className?: string;
  /** Optional custom email validation regex pattern */
  validationRegex?: RegExp;
}

export function NewsletterForm({
  title,
  description,
  emailLabel,
  emailPlaceholder,
  submitLabel,
  successMessage,
  errorMessage,
  onSubscribe,
  className,
  validationRegex,
}: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const validateEmail = (value: string) => {
    const pattern = validationRegex || /[^@\s]+@[^@\s]+\.[^@\s]+/;
    return pattern.test(value);
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError(errorMessage);
      return;
    }

    setStatus('submitting');
    try {
      if (onSubscribe) {
        await onSubscribe(email);
      } else {
        // Fallback: simulate network latency
        await new Promise((res) => setTimeout(res, 600));
      }
      setStatus('success');
      setEmail('');
    } catch {
      setError(errorMessage);
      setStatus('idle');
    }
  }

  const isInvalid = Boolean(error);

  return (
    <section
      className={clsx('mx-auto w-full max-w-xl', className)}
      aria-labelledby="newsletter-title"
      role="region"
    >
      <h2
        id="newsletter-title"
        className="mb-4 text-center text-2xl font-bold text-cyan-600 dark:text-cyan-400"
      >
        {title}
      </h2>
      {description && (
        <p className="mb-6 text-center text-gray-700 dark:text-gray-300">{description}</p>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
        role="form"
        aria-label="Newsletter subscription"
      >
        <div className="flex flex-col">
          <label htmlFor="newsletter-email" className="sr-only">
            {emailLabel}
          </label>
          <input
            id="newsletter-email"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            placeholder={emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={clsx(
              'rounded-md border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400',
              'bg-white/80 backdrop-blur-md dark:bg-black/40',
              isInvalid
                ? 'border-red-500 text-red-900 placeholder-red-300'
                : 'border-gray-300 dark:border-gray-600',
            )}
            required
            aria-invalid={isInvalid}
            aria-describedby={isInvalid ? 'newsletter-error' : undefined}
          />
        </div>

        <button
          type="submit"
          disabled={status === 'submitting' || status === 'success'}
          className="w-full rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-medium text-white hover:from-cyan-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
        >
          {status === 'success' ? successMessage : submitLabel}
        </button>

        <div
          id="newsletter-status"
          role="status"
          aria-live="polite"
          className="min-h-[1.25rem] text-center text-sm"
        >
          {isInvalid && (
            <p id="newsletter-error" className="text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
