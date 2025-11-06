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
 * Generate metadata for the accessibility page
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const t = await getTranslations('accessibility');

  return {
    title: `${t('title')} | QuantumPoly`,
    description: t('summary'),
    robots: 'index, follow',
    openGraph: {
      title: t('title'),
      description: t('summary'),
      type: 'article',
      locale: locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('summary'),
    },
    alternates: {
      canonical: `/${locale}/accessibility`,
      languages: {
        en: '/en/accessibility',
        de: '/de/accessibility',
        tr: '/tr/accessibility',
        es: '/es/accessibility',
        fr: '/fr/accessibility',
        it: '/it/accessibility',
      },
    },
  };
}

/**
 * Accessibility Statement page
 * Documents our commitment to WCAG 2.2 AA compliance and accessibility practices
 */
export default async function AccessibilityPage({ params }: Props) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const t = await getTranslations('accessibility');

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

        {/* Conformance Standards */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {t('standards.heading')}
          </h2>
          <p className="leading-relaxed text-gray-700 dark:text-gray-300">
            {t('standards.content')}
          </p>
        </section>

        {/* Compliance Status */}
        <section className="mb-12 rounded-lg bg-cyan-50 p-6 dark:bg-cyan-900/20">
          <h2 className="mb-3 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {t('compliance.heading')}
          </h2>
          <p className="mb-2 font-medium text-cyan-900 dark:text-cyan-100">
            {t('compliance.status')}
          </p>
          <p className="text-gray-700 dark:text-gray-300">{t('compliance.explanation')}</p>
        </section>

        {/* Accessibility Measures */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {t('measures.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('measures.intro')}
          </p>
          <ul className="list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>{t('measures.items.commitment')}</li>
            <li>{t('measures.items.standards')}</li>
            <li>{t('measures.items.testing')}</li>
            <li>{t('measures.items.training')}</li>
            <li>{t('measures.items.feedback')}</li>
          </ul>
        </section>

        {/* Technical Specifications */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {t('technical.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('technical.intro')}
          </p>
          <ul className="list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>{t('technical.items.html')}</li>
            <li>{t('technical.items.aria')}</li>
            <li>{t('technical.items.css')}</li>
            <li>{t('technical.items.javascript')}</li>
          </ul>
        </section>

        {/* Testing & Validation */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {t('testing.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('testing.intro')}
          </p>
          <ul className="list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>{t('testing.items.automated')}</li>
            <li>{t('testing.items.e2e')}</li>
            <li>{t('testing.items.lighthouse')}</li>
            <li>{t('testing.items.manual')}</li>
            <li>{t('testing.items.continuous')}</li>
          </ul>
        </section>

        {/* Accessibility Features */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {t('features.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('features.intro')}
          </p>
          <ul className="list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>{t('features.items.keyboard')}</li>
            <li>{t('features.items.screenreader')}</li>
            <li>{t('features.items.contrast')}</li>
            <li>{t('features.items.resize')}</li>
            <li>{t('features.items.focus')}</li>
            <li>{t('features.items.headings')}</li>
            <li>{t('features.items.landmarks')}</li>
            <li>{t('features.items.alt')}</li>
            <li>{t('features.items.captions')}</li>
            <li>{t('features.items.motion')}</li>
          </ul>
        </section>

        {/* Assessment Approach */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {t('assessment.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('assessment.content')}
          </p>
          <ul className="list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>{t('assessment.items.selfEvaluation')}</li>
            <li>{t('assessment.items.external')}</li>
            <li>{t('assessment.items.userTesting')}</li>
          </ul>
        </section>

        {/* Known Limitations */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {t('limitations.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('limitations.intro')}
          </p>
          <p className="leading-relaxed text-gray-700 dark:text-gray-300">
            {t('limitations.content')}
          </p>
        </section>

        {/* Feedback & Contact */}
        <section className="mb-12 rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {t('feedback.heading')}
          </h2>
          <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
            {t('feedback.intro')}
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
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {t('feedback.response')}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            {t('feedback.alternative')}{' '}
            <Link
              href={`/${locale}/contact`}
              className="text-cyan-600 underline hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
            >
              {t('feedback.contactPage')}
            </Link>
            .
          </p>
        </section>

        {/* Statement Information */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {t('date.heading')}
          </h2>
          <dl className="space-y-2 text-gray-700 dark:text-gray-300">
            <div>
              <dt className="inline font-medium">{t('date.approved')}: </dt>
              <dd className="inline">{t('date.approvedDate')}</dd>
            </div>
            <div>
              <dt className="inline font-medium">{t('date.lastReviewed')}: </dt>
              <dd className="inline">{t('date.lastReviewedDate')}</dd>
            </div>
            <div>
              <dt className="inline font-medium">{t('date.nextReview')}: </dt>
              <dd className="inline">{t('date.nextReviewDate')}</dd>
            </div>
          </dl>
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

