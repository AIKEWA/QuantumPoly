'use client';

/**
 * @fileoverview GDPR-compliant consent settings modal
 * @module components/consent/ConsentModal
 * @see BLOCK9.2_CONSENT_MANAGEMENT_FRAMEWORK.md
 *
 * Accessibility:
 * - WCAG 2.2 AA compliant
 * - Focus trap implementation
 * - ESC key handling
 * - Keyboard navigation
 * - ARIA labels and descriptions
 */

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { useConsent } from '@/hooks/use-consent';
import { ConsentCategory, ConsentPreferences, PRIVACY_POLICY_VERSION } from '@/types/consent';

interface ConsentModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback to close modal */
  onClose: () => void;
  /** Current locale for privacy policy link */
  locale: string;
}

/**
 * Consent modal component (Step 2 of two-step consent flow)
 * Provides granular control over consent categories
 */
export function ConsentModal({ isOpen, onClose, locale }: ConsentModalProps) {
  const t = useTranslations('consent');
  const { consentState, acceptAll, rejectAll, updatePreferences } = useConsent();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Local state for form
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    [ConsentCategory.Essential]: true,
    [ConsentCategory.Analytics]: consentState?.preferences[ConsentCategory.Analytics] ?? false,
    [ConsentCategory.Performance]: consentState?.preferences[ConsentCategory.Performance] ?? false,
  });

  // Update local state when consent state changes
  useEffect(() => {
    if (consentState) {
      setPreferences(consentState.preferences);
    }
  }, [consentState]);

  // Focus management
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // ESC key handler
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTab);
    return () => modal.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = (category: ConsentCategory.Analytics | ConsentCategory.Performance) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleSave = async () => {
    await updatePreferences(preferences);
    onClose();
  };

  const handleAcceptAll = async () => {
    await acceptAll();
    onClose();
  };

  const handleRejectAll = async () => {
    await rejectAll();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div
        ref={modalRef}
        className="relative mx-4 w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 id="consent-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('modal.title')}
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {t('modal.description')} <span className="font-mono text-xs">{PRIVACY_POLICY_VERSION}</span>
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            aria-label={t('modal.closeAriaLabel')}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Consent Categories */}
        <div className="space-y-4">
          {/* Essential */}
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('modal.categories.essential.title')}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {t('modal.categories.essential.description')}
                </p>
              </div>
              <div className="ml-4">
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                  {t('modal.alwaysActive')}
                </span>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="rounded-md border border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('modal.categories.analytics.title')}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {t('modal.categories.analytics.description')}
                </p>
              </div>
              <div className="ml-4">
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences[ConsentCategory.Analytics]}
                  onClick={() => handleToggle(ConsentCategory.Analytics)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    preferences[ConsentCategory.Analytics] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences[ConsentCategory.Analytics] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="rounded-md border border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('modal.categories.performance.title')}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {t('modal.categories.performance.description')}
                </p>
              </div>
              <div className="ml-4">
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences[ConsentCategory.Performance]}
                  onClick={() => handleToggle(ConsentCategory.Performance)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    preferences[ConsentCategory.Performance] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences[ConsentCategory.Performance] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Policy Link */}
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
          {t('modal.privacyPolicyText')}{' '}
          <a
            href={`/${locale}/privacy`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {t('modal.privacyPolicyLink')}
          </a>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleRejectAll}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            {t('modal.rejectAllButton')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            {t('modal.saveButton')}
          </button>
          <button
            type="button"
            onClick={handleAcceptAll}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {t('modal.acceptAllButton')}
          </button>
        </div>
      </div>
    </div>
  );
}

