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
 * Generate metadata for the governance page
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const t = await getTranslations('governance');

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
      card: 'summary_large_image',
      title: t('title'),
      description: t('summary'),
    },
    alternates: {
      canonical: `/${locale}/governance`,
      languages: {
        en: '/en/governance',
        de: '/de/governance',
        tr: '/tr/governance',
        es: '/es/governance',
        fr: '/fr/governance',
        it: '/it/governance',
      },
    },
  };
}

/**
 * Governance page
 * Public landing page for ethical governance and transparency systems
 */
export default async function GovernancePage({ params }: Props) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const t = await getTranslations('governance');

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cyan-50 to-blue-50 px-4 py-16 dark:from-gray-800 dark:to-gray-900">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl dark:text-gray-100">
            {t('title')}
          </h1>
          <p className="mb-8 text-xl text-gray-700 dark:text-gray-300">{t('summary')}</p>
          <div className="flex flex-wrap gap-4">
            <Link
              href={`/${locale}/dashboard`}
              className="rounded-lg bg-cyan-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:bg-cyan-500 dark:hover:bg-cyan-600"
            >
              {t('cta.dashboard')}
            </Link>
            <Link
              href={`/${locale}/dashboard/ledger`}
              className="rounded-lg border-2 border-cyan-600 px-6 py-3 font-semibold text-cyan-600 transition-colors hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:border-cyan-400 dark:text-cyan-400 dark:hover:bg-gray-800"
            >
              {t('cta.ledger')}
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Introduction */}
        <section className="mb-16">
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">{t('intro')}</p>
        </section>

        {/* Ethical Integrity Index */}
        <section className="mb-16">
          <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t('eii.heading')}
          </h2>
          <p className="mb-6 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('eii.description')}
          </p>
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                SEO & Discoverability
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('eii.dimensions.seo')}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                Accessibility
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('eii.dimensions.accessibility')}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Performance</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('eii.dimensions.performance')}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                Bundle Efficiency
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('eii.dimensions.bundle')}
              </p>
            </div>
          </div>
          <Link
            href={`/${locale}/dashboard`}
            className="inline-flex items-center text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            {t('eii.viewDashboard')} →
          </Link>
        </section>

        {/* Transparency Ledger */}
        <section className="mb-16 rounded-lg bg-gray-50 p-8 dark:bg-gray-800">
          <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t('ledger.heading')}
          </h2>
          <p className="mb-6 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('ledger.description')}
          </p>
          <ul className="mb-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="mr-2 text-cyan-600 dark:text-cyan-400">✓</span>
              {t('ledger.features.timestamped')}
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-cyan-600 dark:text-cyan-400">✓</span>
              {t('ledger.features.hashed')}
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-cyan-600 dark:text-cyan-400">✓</span>
              {t('ledger.features.merkle')}
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-cyan-600 dark:text-cyan-400">✓</span>
              {t('ledger.features.signed')}
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-cyan-600 dark:text-cyan-400">✓</span>
              {t('ledger.features.public')}
            </li>
          </ul>
          <Link
            href={`/${locale}/dashboard/ledger`}
            className="inline-flex items-center text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            {t('ledger.viewLedger')} →
          </Link>
        </section>

        {/* Compliance Framework */}
        <section className="mb-16">
          <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t('framework.heading')}
          </h2>
          <p className="mb-6 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('framework.description')}
          </p>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="mr-3 font-semibold">•</span>
              <span>{t('framework.standards.gdpr')}</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 font-semibold">•</span>
              <span>{t('framework.standards.dsg')}</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 font-semibold">•</span>
              <span>{t('framework.standards.aiact')}</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 font-semibold">•</span>
              <span>{t('framework.standards.iso')}</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 font-semibold">•</span>
              <span>{t('framework.standards.ieee')}</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 font-semibold">•</span>
              <span>{t('framework.standards.wcag')}</span>
            </li>
          </ul>
        </section>

        {/* Governance Principles */}
        <section className="mb-16">
          <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t('principles.heading')}
          </h2>
          <p className="mb-6 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('principles.intro')}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-800 dark:bg-cyan-900/20">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                {t('principles.items.transparency').split(' — ')[0]}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('principles.items.transparency').split(' — ')[1]}
              </p>
            </div>
            <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-800 dark:bg-cyan-900/20">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                {t('principles.items.accountability').split(' — ')[0]}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('principles.items.accountability').split(' — ')[1]}
              </p>
            </div>
            <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-800 dark:bg-cyan-900/20">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                {t('principles.items.verifiability').split(' — ')[0]}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('principles.items.verifiability').split(' — ')[1]}
              </p>
            </div>
            <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-800 dark:bg-cyan-900/20">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                {t('principles.items.inclusivity').split(' — ')[0]}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('principles.items.inclusivity').split(' — ')[1]}
              </p>
            </div>
            <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-800 dark:bg-cyan-900/20">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                {t('principles.items.continuous').split(' — ')[0]}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('principles.items.continuous').split(' — ')[1]}
              </p>
            </div>
            <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-800 dark:bg-cyan-900/20">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                {t('principles.items.feedback').split(' — ')[0]}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('principles.items.feedback').split(' — ')[1]}
              </p>
            </div>
          </div>
        </section>

        {/* Current Status */}
        <section className="mb-16 rounded-lg border-2 border-cyan-200 bg-cyan-50 p-6 dark:border-cyan-800 dark:bg-cyan-900/20">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('status.heading')}
          </h2>
          <dl className="grid gap-4 md:grid-cols-2">
            <div>
              <dt className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
                {t('status.stage')}:
              </dt>
              <dd className="text-gray-700 dark:text-gray-300">{t('status.stageValue')}</dd>
            </div>
            <div>
              <dt className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
                {t('status.baseline')}:
              </dt>
              <dd className="text-gray-700 dark:text-gray-300">{t('status.baselineValue')}</dd>
            </div>
            <div>
              <dt className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
                {t('status.lastAudit')}:
              </dt>
              <dd className="text-gray-700 dark:text-gray-300">{t('status.lastAuditValue')}</dd>
            </div>
            <div>
              <dt className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
                {t('status.nextReview')}:
              </dt>
              <dd className="text-gray-700 dark:text-gray-300">{t('status.nextReviewValue')}</dd>
            </div>
          </dl>
        </section>

        {/* Feedback Section */}
        <section className="mb-16">
          <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t('feedback.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('feedback.description')}
          </p>
          <div className="mb-4">
            <p className="mb-2 font-medium text-gray-900 dark:text-gray-100">
              {t('feedback.email')}:
            </p>
            <a
              href={`mailto:${t('feedback.emailAddress')}`}
              className="text-cyan-600 underline hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
            >
              {t('feedback.emailAddress')}
            </a>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('feedback.github')} <code className="rounded bg-gray-200 px-2 py-1 dark:bg-gray-700">{t('feedback.githubLabel')}</code> {t('feedback.githubLabelText')}.
          </p>
        </section>

        {/* Documentation Resources */}
        <section className="mb-16">
          <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t('documentation.heading')}
          </h2>
          <p className="mb-6 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('documentation.intro')}
          </p>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li>• {t('documentation.items.readme')}</li>
            <li>• {t('documentation.items.methodology')}</li>
            <li>• {t('documentation.items.compliance')}</li>
            <li>• {t('documentation.items.feedback')}</li>
            <li>• {t('documentation.items.onboarding')}</li>
          </ul>
        </section>

        {/* Call to Action */}
        <section className="mb-12 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 p-8 text-white">
          <h2 className="mb-4 text-2xl font-bold">Explore Our Governance Systems</h2>
          <p className="mb-6">
            Dive deeper into our ethical governance framework and transparency systems.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href={`/${locale}/dashboard`}
              className="rounded-lg bg-white px-6 py-3 font-semibold text-cyan-600 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-cyan-600"
            >
              {t('cta.dashboard')}
            </Link>
            <Link
              href={`/${locale}/ethics`}
              className="rounded-lg border-2 border-white px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-cyan-600"
            >
              {t('cta.policies')}
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="rounded-lg border-2 border-white px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-cyan-600"
            >
              {t('cta.contact')}
            </Link>
          </div>
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
      </div>
    </main>
  );
}

