/**
 * @fileoverview Public Feedback Form Component
 * @see BLOCK10.6_FEEDBACK_AND_TRUST.md
 *
 * WCAG 2.2 AA compliant feedback submission form with:
 * - Topic selection chips
 * - Character counter
 * - Optional email consent
 * - Trust scoring opt-in
 * - Clear privacy notices
 * - Keyboard navigation
 * - Screen reader support
 */

'use client';

import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect } from 'react';

type FeedbackTopic = 'governance' | 'ethics' | 'safety' | 'ux' | 'bug' | 'other';

type SubmissionState = 'idle' | 'validating' | 'submitting' | 'success' | 'error';

interface SubmissionResult {
  id?: string;
  trust_score?: number;
  error?: string;
  retryAfter?: number;
}

export function FeedbackForm() {
  const t = useTranslations('feedback');

  // Form state
  const [topic, setTopic] = useState<FeedbackTopic | ''>('');
  const [message, setMessage] = useState('');
  const [consentContact, setConsentContact] = useState(false);
  const [email, setEmail] = useState('');
  const [trustOptIn, setTrustOptIn] = useState(true);

  // UI state
  const [state, setState] = useState<SubmissionState>('idle');
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Refs for accessibility
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const topicFieldRef = useRef<HTMLFieldSetElement>(null);

  // Character count
  const charCount = message.length;
  const maxChars = 2000;
  const charCountColor =
    charCount > maxChars
      ? 'text-red-600'
      : charCount > maxChars * 0.9
        ? 'text-yellow-600'
        : 'text-gray-600';

  // Focus management for errors/success
  useEffect(() => {
    if (state === 'error' && errorSummaryRef.current) {
      errorSummaryRef.current.focus();
    } else if (state === 'success' && successRef.current) {
      successRef.current.focus();
    }
  }, [state]);

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!topic) {
      newErrors.topic = t('requiredField');
    }

    if (message.trim().length === 0) {
      newErrors.message = t('messageTooShort');
    } else if (message.length > maxChars) {
      newErrors.message = t('messageTooLong');
    }

    if (consentContact && !email) {
      newErrors.email = t('emailRequired');
    } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('invalidEmail');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setState('validating');

    if (!validate()) {
      setState('error');
      return;
    }

    setState('submitting');
    setErrors({});

    try {
      const response = await fetch('/api/feedback/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          message: message.trim(),
          consent_contact: consentContact,
          email: consentContact ? email : undefined,
          context: {
            path: '/feedback',
            locale: document.documentElement.lang || 'en',
          },
          metadata: {
            trust_opt_in: trustOptIn,
            signals: {},
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResult({
          error: data.code || 'UNKNOWN_ERROR',
          retryAfter: data.retryAfter,
        });
        setState('error');
        return;
      }

      setResult({
        id: data.id,
        trust_score: data.trust_score,
      });
      setState('success');

      // Reset form
      setTopic('');
      setMessage('');
      setConsentContact(false);
      setEmail('');
      setTrustOptIn(true);
    } catch (error) {
      setResult({
        error: 'NETWORK_ERROR',
      });
      setState('error');
    }
  };

  // Cancel handler (Escape key)
  const handleCancel = () => {
    if (state === 'success' || state === 'error') {
      setState('idle');
      setResult(null);
      setErrors({});
    }
  };

  // Keyboard handler for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state]);

  const topics: FeedbackTopic[] = ['governance', 'ethics', 'safety', 'ux', 'bug', 'other'];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{t('description')}</p>
      </div>

      {/* Error Summary (WCAG 2.2 AA) */}
      {state === 'error' && Object.keys(errors).length > 0 && (
        <div
          ref={errorSummaryRef}
          tabIndex={-1}
          role="alert"
          aria-labelledby="error-summary-title"
          className="mb-6 rounded-md border border-red-300 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20"
        >
          <h2
            id="error-summary-title"
            className="text-sm font-semibold text-red-800 dark:text-red-200"
          >
            {t('validationError')}
          </h2>
          <ul className="mt-2 list-inside list-disc text-sm text-red-700 dark:text-red-300">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>
                <a
                  href={`#${field}`}
                  className="underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  {error}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* API Error */}
      {state === 'error' && result?.error && (
        <div
          ref={errorSummaryRef}
          tabIndex={-1}
          role="alert"
          className="mb-6 rounded-md border border-red-300 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20"
        >
          <h2 className="text-sm font-semibold text-red-800 dark:text-red-200">
            {t('errorTitle')}
          </h2>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            {result.error === '429_RATE_LIMIT' && result.retryAfter
              ? t('rateLimitError', { seconds: result.retryAfter })
              : result.error === 'NETWORK_ERROR'
                ? t('networkError')
                : t('serverError')}
          </p>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">{t('errorRetry')}</p>
        </div>
      )}

      {/* Success Message */}
      {state === 'success' && result?.id && (
        <div
          ref={successRef}
          tabIndex={-1}
          role="status"
          aria-live="polite"
          className="mb-6 rounded-md border border-green-300 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/20"
        >
          <h2 className="text-sm font-semibold text-green-800 dark:text-green-200">
            {t('successTitle')}
          </h2>
          <p className="mt-2 text-sm text-green-700 dark:text-green-300">{t('successMessage')}</p>
          <p className="mt-1 font-mono text-xs text-green-600 dark:text-green-400">
            {t('referenceId', { id: result.id })}
          </p>
          {result.trust_score !== undefined && (
            <p className="mt-2 text-sm text-green-700 dark:text-green-300">
              {t('trustScore', { score: result.trust_score.toFixed(2) })}
            </p>
          )}
          {trustOptIn && (
            <p className="mt-2 text-sm italic text-green-600 dark:text-green-400">
              {t('trustIndicator')}
            </p>
          )}
          <p className="mt-4 text-sm text-green-700 dark:text-green-300">
            {t('nextSteps')}{' '}
            <a
              href="mailto:governance@quantumpoly.ai"
              className="font-semibold underline hover:no-underline"
            >
              governance@quantumpoly.ai
            </a>
          </p>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="mb-6 rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <p className="text-sm text-blue-800 dark:text-blue-200">ℹ️ {t('privacyNotice')}</p>
      </div>

      {/* Feedback Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Topic Selection */}
        <fieldset
          ref={topicFieldRef}
          id="topic"
          className={errors.topic ? 'rounded-md border-2 border-red-500 p-4' : ''}
        >
          <legend className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {t('topicLabel')}{' '}
            <span className="text-red-600" aria-label="required">
              *
            </span>
          </legend>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {topics.map((topicOption) => (
              <button
                key={topicOption}
                type="button"
                onClick={() => setTopic(topicOption)}
                className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  topic === topicOption
                    ? 'border-blue-600 bg-blue-100 text-blue-800 dark:border-blue-400 dark:bg-blue-900 dark:text-blue-100'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
                aria-pressed={topic === topicOption}
              >
                {t(`topics.${topicOption}`)}
              </button>
            ))}
          </div>
          {errors.topic && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.topic}
            </p>
          )}
        </fieldset>

        {/* Message */}
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            {t('messageLabel')}{' '}
            <span className="text-red-600" aria-label="required">
              *
            </span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={8}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('messagePlaceholder')}
            aria-describedby="message-description message-counter"
            aria-invalid={!!errors.message}
            className={`mt-2 block w-full rounded-md border px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-100 ${
              errors.message
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 dark:border-gray-600'
            }`}
          />
          <div className="mt-1 flex items-center justify-between">
            <span id="message-description" className="text-xs text-gray-500 dark:text-gray-400">
              {errors.message || t('requiredField')}
            </span>
            <span id="message-counter" className={`text-xs ${charCountColor}`} aria-live="polite">
              {t('characterCount', { current: charCount, max: maxChars })}
            </span>
          </div>
        </div>

        {/* Email Consent */}
        <div className="space-y-3">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="consent-contact"
              checked={consentContact}
              onChange={(e) => setConsentContact(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800"
            />
            <label
              htmlFor="consent-contact"
              className="ml-2 text-sm text-gray-700 dark:text-gray-300"
            >
              {t('consentLabel')}
            </label>
          </div>

          {consentContact && (
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('emailLabel')}{' '}
                <span className="text-red-600" aria-label="required">
                  *
                </span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                aria-invalid={!!errors.email}
                className={`mt-1 block w-full rounded-md border px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-100 ${
                  errors.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 dark:border-gray-600'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                  {errors.email}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Trust Opt-In */}
        <div className="flex items-start">
          <input
            type="checkbox"
            id="trust-opt-in"
            checked={trustOptIn}
            onChange={(e) => setTrustOptIn(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800"
          />
          <label htmlFor="trust-opt-in" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            {t('trustOptIn')}
          </label>
        </div>

        {/* Submit/Cancel Buttons */}
        <div className="flex items-center justify-end space-x-4">
          {(state === 'success' || state === 'error') && (
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {t('cancelButton')}
            </button>
          )}
          <button
            type="submit"
            disabled={state === 'submitting' || state === 'validating'}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            {state === 'submitting' || state === 'validating' ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {t('submitting')}
              </>
            ) : (
              t('submitButton')
            )}
          </button>
        </div>
      </form>

      {/* Live region for screen readers */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {state === 'submitting' && t('submitting')}
        {state === 'success' && t('successMessage')}
        {state === 'error' && t('errorTitle')}
      </div>
    </div>
  );
}
