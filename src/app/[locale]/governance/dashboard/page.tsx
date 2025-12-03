/**
 * @fileoverview Transparency Dashboard Page
 * @module app/[locale]/governance/dashboard
 * @see BLOCK9.3_TRANSPARENCY_FRAMEWORK.md
 *
 * Public transparency dashboard displaying governance data, EII metrics, and consent statistics
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { ConsentMetrics } from '@/components/dashboard/ConsentMetrics';
import { EIIChart, EIIBreakdown } from '@/components/dashboard/EiiChart';
import { LedgerFeed } from '@/components/dashboard/LedgerFeed';
import { VerificationWidget } from '@/components/dashboard/VerificationWidget';
import { isValidLocale, locales } from '@/i18n';
import {
  getIntegrityConsentMetrics,
  getIntegrityEIIHistory,
  getIntegrityEIIBreakdown,
  getIntegrityRecentEntries,
  type LedgerEntry,
} from '@/lib/integrity';

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
 * Revalidate every 6 hours (hybrid caching strategy)
 */
export const revalidate = 21600; // 6 hours in seconds

/**
 * Generate metadata for the transparency dashboard
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  // Translations available but not used in metadata
  await getTranslations('dashboard');

  return {
    title: `Transparency Dashboard | QuantumPoly`,
    description:
      'Real-time governance transparency dashboard with EII metrics, consent statistics, and ledger verification',
    robots: 'index, follow',
    openGraph: {
      title: 'Transparency Dashboard',
      description: 'Real-time governance transparency dashboard',
      type: 'website',
      locale: locale,
    },
    alternates: {
      canonical: `/${locale}/governance/dashboard`,
      languages: {
        en: '/en/governance/dashboard',
        de: '/de/governance/dashboard',
        tr: '/tr/governance/dashboard',
        es: '/es/governance/dashboard',
        fr: '/fr/governance/dashboard',
        it: '/it/governance/dashboard',
      },
    },
  };
}

/**
 * Transparency Dashboard Page
 */
export default async function TransparencyDashboardPage({ params }: Props) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  // Translations available but not used in this server component
  await getTranslations('dashboard');

  // Fetch data server-side (cached for 6 hours)
  let eiiHistory;
  let eiiBreakdown;
  let consentMetrics;
  let recentEntries: LedgerEntry[];

  try {
    eiiHistory = getIntegrityEIIHistory('governance/ledger/ledger.jsonl', 90);
    eiiBreakdown = getIntegrityEIIBreakdown('governance/ledger/ledger.jsonl');
    consentMetrics = getIntegrityConsentMetrics('governance/consent/ledger.jsonl');
    recentEntries = getIntegrityRecentEntries(5, 'governance/ledger/ledger.jsonl');
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    // Use fallback empty data
    eiiHistory = {
      dataPoints: [],
      rollingAverage: [],
      current: 0,
      average: 0,
      min: 0,
      max: 0,
      trend: 'stable' as const,
    };
    eiiBreakdown = { security: 0, accessibility: 0, transparency: 0, compliance: 0 };
    consentMetrics = {
      totalEvents: 0,
      totalUsers: 0,
      consentGiven: 0,
      consentRevoked: 0,
      consentUpdated: 0,
      categoryMetrics: {
        essential: { optIn: 0, optOut: 0, rate: 0 },
        analytics: { optIn: 0, optOut: 0, rate: 0 },
        performance: { optIn: 0, optOut: 0, rate: 0 },
      },
      timeSeriesData: [],
      lastUpdate: new Date().toISOString(),
    };
    recentEntries = [];
  }

  // Fetch validation report
  let validationStatus: { status: string; timestamp: string; totalErrors: number } | null = null;
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const reportPath = path.resolve(process.cwd(), 'governance/ledger/validation-report.json');
    const reportContent = await fs.readFile(reportPath, 'utf-8');
    validationStatus = JSON.parse(reportContent);
  } catch (e) {
    // Report might not exist yet or fails to read in some envs
    console.warn('Could not read validation report');
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cyan-50 to-blue-50 px-4 py-12 dark:from-gray-800 dark:to-gray-900">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4">
            <Link
              href={`/${locale}/governance`}
              className="text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
            >
              ← Back to Governance
            </Link>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl dark:text-gray-100">
            Transparency Dashboard
          </h1>
          <p className="mb-6 text-xl text-gray-700 dark:text-gray-300">
            Real-time governance metrics, ethical integrity index, and consent analytics
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-green-100 px-3 py-1 font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
              ✓ GDPR Compliant
            </span>
            <span className="rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              ✓ Real-time Verification
            </span>
            <span className="rounded-full bg-purple-100 px-3 py-1 font-medium text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
              ✓ Privacy-Preserving
            </span>
            {validationStatus?.status === 'valid' && (
              <span className="rounded-full bg-cyan-100 px-3 py-1 font-medium text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400">
                ✓ Schema Validated
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* EII Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Ethics Integrity Index (EII)
          </h2>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <EIIChart history={eiiHistory} height={350} />
            </div>
            <div>
              <EIIBreakdown metrics={eiiBreakdown} />
            </div>
          </div>
          <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
            <p className="font-semibold">What is EII?</p>
            <p className="mt-1">
              The Ethics Integrity Index measures our commitment to security, accessibility,
              transparency, and compliance. It is calculated from verified governance metrics and
              updated continuously.
            </p>
          </div>
        </section>

        {/* Consent Metrics Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Consent Analytics
          </h2>
          <ConsentMetrics metrics={consentMetrics} />
        </section>

        {/* Ledger Feed and Verification */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Governance Ledger
          </h2>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <LedgerFeed entries={recentEntries} locale={locale} maxEntries={5} />
            </div>
            <div>
              <VerificationWidget />
            </div>
          </div>
        </section>

        {/* Interactive Timeline Section */}
        <section className="mb-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Interactive Ledger Timeline
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Explore the complete governance ledger with interactive visualization, zoom
                controls, and hash chain verification
              </p>
            </div>
            <Link
              href={`/${locale}/governance/dashboard/timeline`}
              className="rounded-lg bg-cyan-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:bg-cyan-500 dark:hover:bg-cyan-600"
            >
              Explore Full Timeline →
            </Link>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                The timeline visualization provides an interactive view of all governance entries
                with:
              </p>
              <ul className="mt-3 grid gap-2 text-sm text-gray-700 md:grid-cols-2 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-cyan-600 dark:text-cyan-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Real-time hash chain verification
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-cyan-600 dark:text-cyan-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Zoom and pan controls
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-cyan-600 dark:text-cyan-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Keyboard navigation support
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-cyan-600 dark:text-cyan-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Detailed block inspection
                </li>
              </ul>
            </div>
            <div className="rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 p-1">
              <div className="flex h-48 items-center justify-center rounded-lg bg-white dark:bg-gray-800">
                <div className="text-center">
                  <svg
                    className="mx-auto h-16 w-16 text-cyan-600 dark:text-cyan-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <p className="mt-4 font-semibold text-gray-900 dark:text-gray-100">
                    Interactive Timeline Preview
                  </p>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Click "Explore Full Timeline" to view the complete visualization
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance Status */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Compliance Status
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border-2 border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
              <div className="mb-2 text-3xl">✅</div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                Block 9.0: Legal Compliance
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Imprint and Privacy Policy established for DE/EN
              </p>
              <p className="mt-2 text-xs text-green-700 dark:text-green-400">
                Status: Approved (2025-10-26)
              </p>
            </div>
            <div className="rounded-lg border-2 border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
              <div className="mb-2 text-3xl">✅</div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                Block 9.1: Website Implementation
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Legal and ethics pages visible across 6 locales
              </p>
              <p className="mt-2 text-xs text-green-700 dark:text-green-400">
                Status: Approved (2025-10-26)
              </p>
            </div>
            <div className="rounded-lg border-2 border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
              <div className="mb-2 text-3xl">✅</div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                Block 9.2: Consent Management
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                GDPR-compliant consent system with audit trail
              </p>
              <p className="mt-2 text-xs text-green-700 dark:text-green-400">
                Status: Approved (2025-10-26)
              </p>
            </div>

            {/* FPP-10: Ledger Validation Status */}
            <div
              className={`rounded-lg border-2 p-6 ${
                validationStatus?.status === 'valid'
                  ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                  : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
              }`}
            >
              <div className="mb-2 text-3xl">
                {validationStatus?.status === 'valid' ? '✅' : '⚠️'}
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                Ledger Schema Status
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {validationStatus?.status === 'valid'
                  ? 'All governance entries pass strict schema validation.'
                  : 'Schema drift detected. Validation required.'}
              </p>
              {validationStatus && (
                <p
                  className={`mt-2 text-xs ${validationStatus.status === 'valid' ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'}`}
                >
                  Last check: {new Date(validationStatus.timestamp).toISOString().split('T')[0]}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* API Access */}
        <section className="mb-12 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
            Public API Access
          </h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            All governance data is available via public APIs for transparency and third-party
            verification.
          </p>
          <div className="space-y-2 text-sm">
            <div className="rounded bg-gray-50 p-3 dark:bg-gray-900">
              <code className="text-cyan-600 dark:text-cyan-400">GET /api/governance/verify</code>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Verify ledger integrity and get Merkle root
              </p>
            </div>
            <div className="rounded bg-gray-50 p-3 dark:bg-gray-900">
              <code className="text-cyan-600 dark:text-cyan-400">GET /api/governance/feed</code>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Get recent governance ledger entries
              </p>
            </div>
            <div className="rounded bg-gray-50 p-3 dark:bg-gray-900">
              <code className="text-cyan-600 dark:text-cyan-400">
                GET /api/governance/eii-history
              </code>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Get EII history with 90-day rolling average
              </p>
            </div>
            <div className="rounded bg-gray-50 p-3 dark:bg-gray-900">
              <code className="text-cyan-600 dark:text-cyan-400">
                GET /api/governance/consent-metrics
              </code>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Get aggregated consent statistics (privacy-preserving)
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-8 text-center dark:border-gray-700">
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            This dashboard is part of Block 9.3: Transparency & Multi-Analytics Framework
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <Link
              href={`/${locale}/governance`}
              className="hover:text-cyan-600 dark:hover:text-cyan-400"
            >
              Governance Overview
            </Link>
            <span>•</span>
            <Link
              href={`/${locale}/privacy`}
              className="hover:text-cyan-600 dark:hover:text-cyan-400"
            >
              Privacy Policy
            </Link>
            <span>•</span>
            <Link
              href={`/${locale}/contact`}
              className="hover:text-cyan-600 dark:hover:text-cyan-400"
            >
              Contact
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
