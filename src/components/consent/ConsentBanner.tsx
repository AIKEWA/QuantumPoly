'use client';

/**
 * @fileoverview GDPR-compliant consent banner component
 * @module components/consent/ConsentBanner
 * @see BLOCK9.2_CONSENT_MANAGEMENT_FRAMEWORK.md
 *
 * Accessibility:
 * - WCAG 2.2 AA compliant
 * - Keyboard navigation support
 * - Screen reader announcements
 * - Focus management
 */

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useConsent } from '@/hooks/use-consent';

interface ConsentBannerProps {
  /** Callback when user opens settings modal */
  onOpenSettings: () => void;
  /** Current locale for privacy policy link */
  locale: string;
}

/**
 * Consent banner component (Step 1 of two-step consent flow)
 * Displays on first visit, provides "Accept All" or "Customize" options
 */
export function ConsentBanner({ onOpenSettings, locale }: ConsentBannerProps) {
  const t = useTranslations('consent');
  const { hasConsentDecision, acceptAll, isLoading } = useConsent();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show banner only if user hasn't made a decision
    if (!isLoading && !hasConsentDecision) {
      setIsVisible(true);
    }
  }, [isLoading, hasConsentDecision]);

  // Don't render if user has already consented or still loading
  if (isLoading || hasConsentDecision || !isVisible) {
    return null;
  }

  const handleAcceptAll = async () => {
    await acceptAll();
    setIsVisible(false);
  };

  const handleOpenSettings = () => {
    onOpenSettings();
  };

  return (
    <div
      role="dialog"
      aria-labelledby="consent-banner-title"
      aria-describedby="consent-banner-description"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Content */}
          <div className="flex-1">
            <h2 id="consent-banner-title" className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('banner.title')}
            </h2>
            <p id="consent-banner-description" className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {t('banner.description')}{' '}
              <a
                href={`/${locale}/privacy`}
                className="underline hover:text-gray-900 dark:hover:text-white"
              >
                {t('banner.privacyLink')}
              </a>
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleOpenSettings}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              aria-label={t('banner.customizeAriaLabel')}
            >
              {t('banner.customizeButton')}
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
              aria-label={t('banner.acceptAriaLabel')}
            >
              {t('banner.acceptButton')}
            </button>
          </div>
        </div>
      </div>

      {/* Screen reader announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        {t('banner.screenReaderAnnouncement')}
      </div>
    </div>
  );
}

