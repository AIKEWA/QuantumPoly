import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PolicyLayout } from '@/components/layouts/PolicyLayout';
import { isValidLocale, type Locale } from '@/i18n';
import { loadPolicy, getAllLocales } from '@/lib/policies/load-policy';

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Generate static params for all supported locales.
 * Enables static generation at build time.
 */
export function generateStaticParams() {
  return getAllLocales().map((locale) => ({ locale }));
}

/**
 * Force static generation at build time.
 * Allows middleware header access for i18n while maintaining static optimization.
 */
export const dynamic = 'force-static';

/**
 * Generate metadata for the ethics page.
 * Sets appropriate robots meta tag based on publication status.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  try {
    const policy = await loadPolicy('ethics', locale as Locale);
    const { metadata } = policy;

    // Set noindex for non-published content
    const robots = metadata.status === 'published' ? 'index, follow' : 'noindex, nofollow';

    return {
      title: `${metadata.title} | QuantumPoly`,
      description: metadata.summary,
      robots,
      openGraph: {
        title: metadata.title,
        description: metadata.summary,
        type: 'article',
        locale: locale,
      },
      twitter: {
        card: 'summary_large_image',
        title: metadata.title,
        description: metadata.summary,
      },
      alternates: {
        canonical: `/${locale}/ethics`,
        languages: {
          en: '/en/ethics',
          de: '/de/ethics',
          tr: '/tr/ethics',
          es: '/es/ethics',
          fr: '/fr/ethics',
          it: '/it/ethics',
        },
      },
    };
  } catch (error) {
    console.error('Error generating metadata for ethics page:', error);
    return {};
  }
}

/**
 * Ethics & Transparency policy page.
 * Displays our commitment to responsible AI and transparent practices.
 */
export default async function EthicsPage({ params }: Props) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  try {
    const policy = await loadPolicy('ethics', locale as Locale);

    return (
      <PolicyLayout metadata={policy.metadata} toc={policy.toc} isFallback={policy.isFallback}>
        <div dangerouslySetInnerHTML={{ __html: policy.html }} />

        {/* Observatory Teaser */}
        <div className="mt-12 rounded-xl border border-blue-200 bg-blue-50 p-8 dark:border-blue-900 dark:bg-blue-900/20">
          <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
            See Ethics in Action
          </h2>
          <p className="mb-6 text-lg text-slate-700 dark:text-slate-300">
            Explore real-time data on our global ethical performance, verify ledger proofs, and
            track long-term integrity trends in the Public Ethics Observatory.
          </p>
          <a
            href={`/${locale}/observatory`}
            className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Open the Observatory →
          </a>
        </div>
      </PolicyLayout>
    );
  } catch (error) {
    console.error('Error loading ethics policy:', error);
    notFound();
  }
}
