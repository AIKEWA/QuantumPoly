/**
 * @fileoverview Consent settings page for GDPR Art. 15 (right to access) compliance
 * @module app/[locale]/settings/consent
 * @see BLOCK9.2_CONSENT_MANAGEMENT_FRAMEWORK.md
 */

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { ConsentSettingsClient } from './ConsentSettingsClient';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'consent' });

  return {
    title: `${t('settings.title')} | QuantumPoly`,
    description: t('settings.description'),
    robots: 'noindex, nofollow', // Settings pages should not be indexed
  };
}

export default async function ConsentSettingsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('consent');

  return (
    <main className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('settings.title')}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">{t('settings.description')}</p>
        </div>

        {/* Client Component */}
        <ConsentSettingsClient locale={locale} />

        {/* Legal Information */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.legalTitle')}</h2>
          <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p>
              <strong>{t('settings.gdprRights.title')}:</strong>
            </p>
            <ul className="ml-6 list-disc space-y-1">
              <li>{t('settings.gdprRights.access')}</li>
              <li>{t('settings.gdprRights.rectification')}</li>
              <li>{t('settings.gdprRights.erasure')}</li>
              <li>{t('settings.gdprRights.restriction')}</li>
              <li>{t('settings.gdprRights.portability')}</li>
              <li>{t('settings.gdprRights.objection')}</li>
            </ul>
            <p className="mt-4">
              {t('settings.contactText')}{' '}
              <a
                href="mailto:legal@quantumpoly.ai"
                className="text-blue-600 underline hover:text-blue-700 dark:text-blue-400"
              >
                legal@quantumpoly.ai
              </a>
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-center">
          <a
            href={`/${locale}`}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← {t('settings.backToHome')}
          </a>
        </div>
      </div>
    </main>
  );
}

