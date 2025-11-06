/**
 * @fileoverview Interactive Ledger Timeline Page
 * @module app/[locale]/governance/dashboard/timeline
 * @see BLOCK10.4_DASHBOARD_REFINEMENT.md
 *
 * Full-page interactive timeline visualization of governance ledger
 * with comprehensive controls, filtering, and verification display
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { isValidLocale, locales } from '@/i18n';

import { TimelineClient } from './TimelineClient';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ledger?: string; block?: string }>;
};

/**
 * Generate static params for all supported locales
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * Force dynamic rendering for query parameters
 */
export const dynamic = 'force-dynamic';

/**
 * Generate metadata for the timeline page
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const t = await getTranslations('governance');

  return {
    title: `Interactive Ledger Timeline | ${t('title')} | QuantumPoly`,
    description: t('timeline.description') || 'Interactive visualization of governance ledger with hash chain verification and continuity analysis.',
    robots: 'index, follow',
    openGraph: {
      title: `Interactive Ledger Timeline | ${t('title')}`,
      description: t('timeline.description') || 'Interactive visualization of governance ledger with hash chain verification and continuity analysis.',
      type: 'website',
      locale: locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Interactive Ledger Timeline | ${t('title')}`,
      description: t('timeline.description') || 'Interactive visualization of governance ledger with hash chain verification and continuity analysis.',
    },
    alternates: {
      canonical: `/${locale}/governance/dashboard/timeline`,
      languages: {
        en: '/en/governance/dashboard/timeline',
        de: '/de/governance/dashboard/timeline',
        tr: '/tr/governance/dashboard/timeline',
        es: '/es/governance/dashboard/timeline',
        fr: '/fr/governance/dashboard/timeline',
        it: '/it/governance/dashboard/timeline',
      },
    },
  };
}

/**
 * Interactive Ledger Timeline Page
 */
export default async function TimelinePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { ledger, block } = await searchParams;

  if (!isValidLocale(locale)) {
    notFound();
  }

  return <TimelineClient locale={locale} ledgerType={ledger} highlightBlock={block} />;
}

