import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { isValidLocale, locales } from '@/i18n';

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Generate static params for all supported locales
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * Force static generation for all locales
 */
export const dynamic = 'force-static';

/**
 * Generate metadata for the contact page
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const t = await getTranslations('contact');

  return {
    title: `${t('title')} | QuantumPoly`,
    description: t('summary'),
    robots: 'index, follow',
    openGraph: {
      title: t('title'),
      description: t('summary'),
      type: 'website',
      locale: locale,
    },
    twitter: {
      card: 'summary',
      title: t('title'),
      description: t('summary'),
    },
    alternates: {
      canonical: `/${locale}/contact`,
      languages: {
        en: '/en/contact',
        de: '/de/contact',
        tr: '/tr/contact',
        es: '/es/contact',
        fr: '/fr/contact',
        it: '/it/contact',
      },
    },
  };
}

/**
 * Contact page
 * Provides contact information for various departments and inquiries
 */
export default async function ContactPage({ params }: Props) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const t = await getTranslations('contact');

  return (
    <main className="min-h-screen bg-white px-4 py-12 dark:bg-gray-900">
      <article className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-12 border-b border-gray-200 pb-8 dark:border-gray-700">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-gray-100">
            {t('title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{t('summary')}</p>
        </header>

        {/* Introduction */}
        <section className="mb-12">
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">{t('intro')}</p>
        </section>

        {/* Company Information */}
        <section className="mb-12 rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {t('company.heading')}
          </h2>
          <div className="space-y-2 text-gray-700 dark:text-gray-300">
            <p className="font-medium">{t('company.name')}</p>
            <p>{t('company.owner')}</p>
            <p>{t('company.legalForm')}</p>
            <p>{t('company.registry')}</p>
            <div className="mt-4">
              <p className="mb-2 font-medium">{t('company.address.heading')}:</p>
              <address className="not-italic">
                {t('company.address.street')}
                <br />
                {t('company.address.city')}
                <br />
                {t('company.address.country')}
              </address>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {t('contacts.heading')}
          </h2>
          <div className="space-y-6">
            {/* General Inquiries */}
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t('contacts.general.label')}
              </h3>
              <a
                href={`mailto:${t('contacts.general.email')}`}
                className="mb-2 block text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
              >
                {t('contacts.general.email')}
              </a>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('contacts.general.description')}
              </p>
            </div>

            {/* Legal & Compliance */}
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t('contacts.legal.label')}
              </h3>
              <a
                href={`mailto:${t('contacts.legal.email')}`}
                className="mb-2 block text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
              >
                {t('contacts.legal.email')}
              </a>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('contacts.legal.description')}
              </p>
            </div>

            {/* Privacy & Data Protection */}
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t('contacts.privacy.label')}
              </h3>
              <a
                href={`mailto:${t('contacts.privacy.email')}`}
                className="mb-2 block text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
              >
                {t('contacts.privacy.email')}
              </a>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('contacts.privacy.description')}
              </p>
            </div>

            {/* Ethics & Governance */}
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t('contacts.trust.label')}
              </h3>
              <a
                href={`mailto:${t('contacts.trust.email')}`}
                className="mb-2 block text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
              >
                {t('contacts.trust.email')}
              </a>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('contacts.trust.description')}
              </p>
            </div>

            {/* Accessibility */}
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t('contacts.accessibility.label')}
              </h3>
              <a
                href={`mailto:${t('contacts.accessibility.email')}`}
                className="mb-2 block text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
              >
                {t('contacts.accessibility.email')}
              </a>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('contacts.accessibility.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Response Times */}
        <section className="mb-12 rounded-lg bg-cyan-50 p-6 dark:bg-cyan-900/20">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {t('response.heading')}
          </h2>
          <ul className="mb-4 space-y-2 text-gray-700 dark:text-gray-300">
            <li>• {t('response.general')}</li>
            <li>• {t('response.legal')}</li>
            <li>• {t('response.privacy')}</li>
            <li>• {t('response.security')}</li>
            <li>• {t('response.accessibility')}</li>
          </ul>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('response.note')}</p>
        </section>

        {/* Additional Links */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {t('links.heading')}
          </h2>
          <div className="space-y-2 text-gray-700 dark:text-gray-300">
            <p>
              {t('links.imprint')}{' '}
              <Link
                href={`/${locale}/imprint`}
                className="text-cyan-600 underline hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
              >
                {t('links.imprintLink')}
              </Link>
              .
            </p>
            <p>
              {t('links.privacy')}{' '}
              <Link
                href={`/${locale}/privacy`}
                className="text-cyan-600 underline hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
              >
                {t('links.privacyLink')}
              </Link>
              .
            </p>
            <p>
              {t('links.governance')}{' '}
              <Link
                href={`/${locale}/governance`}
                className="text-cyan-600 underline hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
              >
                {t('links.governanceLink')}
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="mb-12 rounded-lg border border-gray-300 bg-gray-50 p-6 dark:border-gray-600 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('disclaimer')}</p>
        </section>

        {/* Back to Home */}
        <nav className="border-t border-gray-200 pt-8 dark:border-gray-700">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            ← Back to Home
          </Link>
        </nav>
      </article>
    </main>
  );
}

