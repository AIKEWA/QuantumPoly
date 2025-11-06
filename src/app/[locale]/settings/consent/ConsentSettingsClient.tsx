'use client';

/**
 * @fileoverview Client component for consent settings page
 * @module app/[locale]/settings/consent/ConsentSettingsClient
 */

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ConsentModal } from '@/components/consent/ConsentModal';
import { useConsent } from '@/hooks/use-consent';
import { ConsentCategory, PRIVACY_POLICY_VERSION } from '@/types/consent';

interface ConsentSettingsClientProps {
  locale: string;
}

export function ConsentSettingsClient({ locale }: ConsentSettingsClientProps) {
  const t = useTranslations('consent');
  const { consentState, isLoading } = useConsent();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    );
  }

  const handleExportData = () => {
    if (!consentState) return;

    const data = {
      userId: consentState.userId,
      preferences: consentState.preferences,
      timestamp: consentState.timestamp,
      policyVersion: consentState.policyVersion,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consent-data-${consentState.userId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Current Preferences */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('settings.currentPreferences')}
        </h2>

        {!consentState?.hasConsented ? (
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t('settings.noConsentYet')}</p>
        ) : (
          <div className="mt-4 space-y-4">
            {/* Essential */}
            <div className="flex items-center justify-between rounded-md border border-gray-200 p-4 dark:border-gray-700">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {t('modal.categories.essential.title')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t('modal.categories.essential.description')}
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                {t('modal.alwaysActive')}
              </span>
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between rounded-md border border-gray-200 p-4 dark:border-gray-700">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {t('modal.categories.analytics.title')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t('modal.categories.analytics.description')}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  consentState.preferences[ConsentCategory.Analytics]
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                {consentState.preferences[ConsentCategory.Analytics]
                  ? t('settings.enabled')
                  : t('settings.disabled')}
              </span>
            </div>

            {/* Performance */}
            <div className="flex items-center justify-between rounded-md border border-gray-200 p-4 dark:border-gray-700">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {t('modal.categories.performance.title')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t('modal.categories.performance.description')}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  consentState.preferences[ConsentCategory.Performance]
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                {consentState.preferences[ConsentCategory.Performance]
                  ? t('settings.enabled')
                  : t('settings.disabled')}
              </span>
            </div>

            {/* Metadata */}
            <div className="mt-6 rounded-md bg-gray-50 p-4 dark:bg-gray-900">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-400">{t('settings.lastUpdated')}:</dt>
                  <dd className="font-mono text-gray-900 dark:text-white">
                    {new Date(consentState.timestamp).toLocaleString(locale)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-400">{t('settings.policyVersion')}:</dt>
                  <dd className="font-mono text-gray-900 dark:text-white">{PRIVACY_POLICY_VERSION}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-400">{t('settings.userId')}:</dt>
                  <dd className="font-mono text-xs text-gray-900 dark:text-white">{consentState.userId}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {t('settings.changePreferences')}
          </button>
          {consentState?.hasConsented && (
            <button
              type="button"
              onClick={handleExportData}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              {t('settings.exportData')}
            </button>
          )}
        </div>
      </div>

      {/* Consent Modal */}
      <ConsentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} locale={locale} />
    </>
  );
}

