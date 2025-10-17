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
 * Force static generation and prevent runtime data fetching.
 * Throws error if route attempts dynamic rendering.
 */
export const dynamic = 'error';

/**
 * Generate metadata for the GEP page.
 * Sets appropriate robots meta tag based on publication status.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  try {
    const policy = await loadPolicy('gep', locale as Locale);
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
        canonical: `/${locale}/gep`,
        languages: {
          en: '/en/gep',
          de: '/de/gep',
          tr: '/tr/gep',
          es: '/es/gep',
          fr: '/fr/gep',
          it: '/it/gep',
        },
      },
    };
  } catch (error) {
    console.error('Error generating metadata for GEP page:', error);
    return {};
  }
}

/**
 * Good Engineering Practices (GEP) policy page.
 * Documents our technical standards and development practices.
 */
export default async function GEPPage({ params }: Props) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  try {
    const policy = await loadPolicy('gep', locale as Locale);

    return (
      <PolicyLayout metadata={policy.metadata} toc={policy.toc} isFallback={policy.isFallback}>
        <div dangerouslySetInnerHTML={{ __html: policy.html }} />
      </PolicyLayout>
    );
  } catch (error) {
    console.error('Error loading GEP policy:', error);
    notFound();
  }
}
