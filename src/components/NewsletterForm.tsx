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
 *
 * BLOCK 4.3 INTEGRATION NOTES
 *
 * Architecture Decision: Hybrid Mode
 * - When onSubscribe prop is provided → use prop (backward compatible)
 * - When onSubscribe is undefined → auto-fetch /api/newsletter (new behavior)
 *
 * Key Mapping Strategy:
 * - Server returns messageKey (e.g., "newsletter.success")
 * - We map directly to translation keys since they match 1:1
 * - Unknown keys fall back to "serverError" for safety
 *
 * Race Condition Prevention:
 * - inFlight guard prevents double submissions
 * - Button disabled during submission
 * - AbortController prevents zombie requests
 *
 * Future Enhancements:
 * - Add Retry-After countdown UI for 429 responses
 * - Add telemetry for error tracking
 * - Consider optimistic UI for instant feedback
 */
'use client';

import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import React, { useState, useRef, FormEvent } from 'react';

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
  const [messageKey, setMessageKey] = useState<string | null>(null);
  const [inFlight, setInFlight] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null);

  // i18n translations for auto mode (when onSubscribe is not provided)
  const t = useTranslations('newsletter');

  const validateEmail = (value: string) => {
    const pattern = validationRegex || /[^@\s]+@[^@\s]+\.[^@\s]+/;
    return pattern.test(value);
  };

  /**
   * Maps server messageKey to UI translation key
   * Server returns keys like "newsletter.success", we need just "success"
   * Falls back to "serverError" for unknown keys
   */
  const mapServerKeyToUiKey = (serverKey?: string): string => {
    if (!serverKey) return 'serverError';

    // Direct mapping since translation keys match server keys
    const validKeys = [
      'success',
      'invalidEmail',
      'alreadySubscribed',
      'rateLimitExceeded',
      'serverError',
    ];

    // Remove "newsletter." prefix if present
    const cleanKey = serverKey.replace('newsletter.', '');

    if (validKeys.includes(cleanKey)) {
      return cleanKey;
    }

    // Fallback for unknown keys
    return 'serverError';
  };

  /**
   * Handles API submission with timeout and error handling
   * Called when onSubscribe prop is not provided (auto mode)
   */
  async function handleApiSubmit(emailValue: string) {
    if (inFlight) return;

    setInFlight(true);
    setStatus('submitting');
    setMessageKey(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue }),
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));
      const uiKey = mapServerKeyToUiKey(data?.messageKey);

      if (res.ok) {
        setStatus('success');
        setMessageKey(uiKey);
        setEmail(''); // Clear input on success
      } else {
        setStatus('idle');
        setError(t(uiKey));
        setMessageKey(uiKey);
      }
    } catch (err) {
      setStatus('idle');
      const errorKey = 'serverError';
      setError(t(errorKey));
      setMessageKey(errorKey);
    } finally {
      clearTimeout(timeout);
      setInFlight(false);

      // Focus live region for screen reader announcement
      queueMicrotask(() => liveRef.current?.focus?.());
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError(errorMessage || t('invalidEmail'));
      return;
    }

    if (onSubscribe) {
      // Existing prop-based mode (backward compatible)
      setStatus('submitting');
      try {
        await onSubscribe(email);
        setStatus('success');
        setEmail('');
      } catch {
        setError(errorMessage || t('serverError'));
        setStatus('idle');
      }
    } else {
      // New auto mode with API integration
      await handleApiSubmit(email);
    }
  }

  const isInvalid = Boolean(error);

  return (
    <section
      className={clsx('mx-auto w-full max-w-xl px-4 py-20', className)}
      aria-labelledby="newsletter-title"
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
          disabled={status === 'submitting' || status === 'success' || inFlight}
          className="w-full rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-medium text-white hover:from-cyan-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
        >
          {status === 'success' ? successMessage : submitLabel}
        </button>

        <div
          ref={liveRef}
          id="newsletter-status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="min-h-[1.25rem] text-center text-sm"
          tabIndex={-1}
        >
          {isInvalid && (
            <p id="newsletter-error" className="text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {status === 'success' && messageKey && !onSubscribe && (
            <p className="text-green-600 dark:text-green-400">{t(messageKey)}</p>
          )}
        </div>
      </form>
    </section>
  );
}
