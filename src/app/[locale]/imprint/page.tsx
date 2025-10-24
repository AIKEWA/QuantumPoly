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
 * Generate metadata for the imprint page.
 * Sets appropriate robots meta tag based on publication status.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  try {
    const policy = await loadPolicy('imprint', locale as Locale);
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
        canonical: `/${locale}/imprint`,
        languages: {
          en: '/en/imprint',
          de: '/de/imprint',
          tr: '/tr/imprint',
          es: '/es/imprint',
          fr: '/fr/imprint',
          it: '/it/imprint',
        },
      },
    };
  } catch (error) {
    console.error('Error generating metadata for imprint page:', error);
    return {};
  }
}

/**
 * Imprint page (Impressum).
 * Provides legal information about the organization.
 *
 * Note: This is informational content only and does not constitute legal advice.
 */
export default async function ImprintPage({ params }: Props) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  try {
    const policy = await loadPolicy('imprint', locale as Locale);

    return (
      <PolicyLayout metadata={policy.metadata} toc={policy.toc} isFallback={policy.isFallback}>
        <div dangerouslySetInnerHTML={{ __html: policy.html }} />
      </PolicyLayout>
    );
  } catch (error) {
    console.error('Error loading imprint:', error);
    notFound();
  }
}
