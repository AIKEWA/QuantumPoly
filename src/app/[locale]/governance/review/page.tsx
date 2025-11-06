/**
 * @fileoverview Review Dashboard Page - Block 9.9
 * @module app/[locale]/governance/review
 * @see BLOCK9.9_FINAL_AUDIT_AND_HANDOFF.md
 *
 * Human audit and final review dashboard
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { ReviewDashboard } from '@/components/audit/ReviewDashboard';
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
 * Generate metadata
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {
      title: 'Review Dashboard',
    };
  }

  const t = await getTranslations({ locale, namespace: 'governance' });

  return {
    title: `${t('review_dashboard')} | QuantumPoly`,
    description: 'Human audit and final review dashboard for Block 9.9',
    robots: {
      index: false, // Don't index review dashboard
      follow: false,
    },
  };
}

/**
 * Review Dashboard Page
 */
export default async function ReviewDashboardPage({ params }: Props) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  // Fetch initial data server-side
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  let initialStatus;
  let initialHistory;

  try {
    const [statusRes, historyRes] = await Promise.all([
      fetch(`${baseUrl}/api/audit/status`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/audit/history`, { cache: 'no-store' }),
    ]);

    if (!statusRes.ok || !historyRes.ok) {
      throw new Error('Failed to fetch initial data');
    }

    initialStatus = await statusRes.json();
    const historyData = await historyRes.json();
    initialHistory = historyData.signoffs;
  } catch (error) {
    console.error('Failed to fetch initial data:', error);
    // Provide fallback data
    initialStatus = {
      release_candidate: 'unknown',
      commit_hash: 'unknown',
      readiness_state: 'blocked',
      integrity_state: 'attention_required',
      required_signoffs: [
        'Lead Engineer',
        'Governance Officer',
        'Legal Counsel',
        'Accessibility Reviewer',
      ],
      completed_signoffs: [],
      blocking_issues: ['Failed to fetch integrity status'],
      last_review: null,
    };
    initialHistory = [];
  }

  // Check if API key is configured (server-side only)
  const apiKeyConfigured = !!process.env.REVIEW_DASHBOARD_API_KEY;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Block 9.9 — Human Audit & Review Dashboard
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Final accountability checkpoint before production release
              </p>
            </div>
            <Link
              href={`/${locale}/governance`}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              ← Back to Governance
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Warning if API key not configured */}
        {!apiKeyConfigured && (
          <div className="mb-6 rounded-lg border-2 border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
              ⚠️ Configuration Warning
            </p>
            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
              REVIEW_DASHBOARD_API_KEY environment variable is not configured.
              Sign-off submission will not work until this is set.
            </p>
          </div>
        )}

        {/* Governance Milestones */}
        <div className="mb-8 rounded-lg border-2 border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
            Governance Milestones (Blocks 9.0-9.8)
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[
              { id: '9.0', title: 'Legal Compliance Baseline', status: 'complete' },
              { id: '9.1', title: 'Website Implementation', status: 'complete' },
              { id: '9.2', title: 'Consent Management', status: 'complete' },
              { id: '9.3', title: 'Transparency Framework', status: 'complete' },
              { id: '9.4', title: 'Public Ethics API', status: 'complete' },
              { id: '9.5', title: 'Ethical Autonomy (EWA)', status: 'complete' },
              { id: '9.6', title: 'Federated Transparency', status: 'complete' },
              { id: '9.7', title: 'Trust Proof & Attestation', status: 'complete' },
              { id: '9.8', title: 'Continuous Integrity', status: 'complete' },
            ].map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-center justify-between rounded-md border border-gray-200 p-3 dark:border-gray-700"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Block {milestone.id}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {milestone.title}
                  </p>
                </div>
                <span className="text-green-600 dark:text-green-400">✅</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard */}
        <ReviewDashboard
          initialStatus={initialStatus}
          initialHistory={initialHistory}
          apiKey={null} // Client will handle API key input
        />

        {/* Footer Information */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">
            About This Dashboard
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>
              This dashboard implements Block 9.9 of the QuantumPoly governance
              framework — the final human accountability checkpoint before
              production release.
            </p>
            <p>
              Four required roles must provide explicit sign-off: Lead Engineer,
              Governance Officer, Legal Counsel, and Accessibility Reviewer.
            </p>
            <p>
              All sign-offs are recorded with cryptographic integrity verification
              and stored in both structured files and the governance ledger.
            </p>
            <p className="font-medium text-gray-700 dark:text-gray-300">
              "Before this system touches the world, humans sign their name under
              it."
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

