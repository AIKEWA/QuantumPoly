import fs from 'fs';
import path from 'path';

import { Metadata } from 'next';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { EthicalScorecard } from '@/components/dashboard/EthicalScorecard';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { TrendGraph } from '@/components/dashboard/TrendGraph';

// Type definitions
interface EthicalScorecard {
  project: string;
  version: string;
  timestamp: string;
  commit: string;
  eii: number;
  metrics: {
    seo: number;
    a11y: number;
    performance: number;
    bundle: number;
  };
  hash: string;
  tags?: string[];
  verifiedBy?: string;
  ledgerEntry?: string;
  legalLink?: string;
  reports?: Array<{
    metric: string;
    category: string;
    score: number;
    timestamp: string;
    source: string;
    commit: string;
    hash: string;
  }>;
}

interface HistoryEntry {
  timestamp: string;
  commit: string;
  eii: number;
  metrics: {
    seo: number;
    a11y: number;
    performance: number;
    bundle: number;
  };
}

/**
 * Load dashboard data from filesystem
 */
function loadDashboardData(): EthicalScorecard | null {
  const dataPath = path.join(process.cwd(), 'reports', 'governance', 'dashboard-data.json');

  try {
    if (!fs.existsSync(dataPath)) {
      return null;
    }
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    return null;
  }
}

/**
 * Load historical metrics data
 */
function loadHistoryData(): HistoryEntry[] {
  const historyPath = path.join(process.cwd(), 'reports', 'governance', 'metrics-history.json');

  try {
    if (!fs.existsSync(historyPath)) {
      return [];
    }
    const data = fs.readFileSync(historyPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load history data:', error);
    return [];
  }
}

/**
 * Generate metadata for the dashboard page
 */
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'dashboard' });

  return {
    title: t('title'),
    description: t('subtitle'),
    openGraph: {
      title: t('title'),
      description: t('subtitle'),
      type: 'website',
    },
  };
}

/**
 * Ethical Governance Dashboard Page
 */
export default function DashboardPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('dashboard');

  const dashboardData = loadDashboardData();
  const historyData = loadHistoryData();

  // If no data available, show setup instructions
  if (!dashboardData) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mb-8 text-lg text-gray-600">{t('subtitle')}</p>

          <div className="mx-auto max-w-2xl rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
            <div className="mb-4 text-6xl">📊</div>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">
              Dashboard Data Not Available
            </h2>
            <p className="mb-6 text-gray-600">
              The ethical governance dashboard requires aggregated metrics data. Run the aggregation
              script to generate the dashboard.
            </p>
            <div className="rounded-lg bg-gray-800 p-4 text-left">
              <code className="text-sm text-green-400">npm run ethics:aggregate</code>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              This will collect metrics from Lighthouse, coverage, and bundle reports.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-lg text-gray-600">{t('subtitle')}</p>
      </div>

      {/* Main Scorecard */}
      <div className="mb-12">
        <EthicalScorecard
          eii={dashboardData.eii}
          metrics={dashboardData.metrics}
          tags={dashboardData.tags}
          timestamp={dashboardData.timestamp}
          commit={dashboardData.commit}
        />
      </div>

      {/* Trend Graph */}
      {historyData.length > 1 && (
        <div className="mb-12">
          <TrendGraph history={historyData} />
        </div>
      )}

      {/* Individual Metric Cards */}
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Detailed Metrics</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {(Object.keys(dashboardData.metrics) as Array<keyof typeof dashboardData.metrics>).map(
            (category) => {
              const report = dashboardData.reports?.find((r) => r.category === category);
              return (
                <MetricCard
                  key={category}
                  category={category}
                  score={dashboardData.metrics[category]}
                  hash={report?.hash}
                  source={report?.source}
                />
              );
            },
          )}
        </div>
      </div>

      {/* Metadata Section */}
      <div className="mb-12 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          {t('metadata.project')} Information
        </h3>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-600">{t('metadata.project')}</dt>
            <dd className="mt-1 text-sm text-gray-900">{dashboardData.project}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">{t('metadata.version')}</dt>
            <dd className="mt-1 text-sm text-gray-900">{dashboardData.version}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">{t('metadata.commit')}</dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">{dashboardData.commit}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">{t('metadata.hash')}</dt>
            <dd className="mt-1 font-mono text-xs text-gray-900">
              {dashboardData.hash.substring(0, 32)}...
            </dd>
          </div>
          {dashboardData.verifiedBy && (
            <div>
              <dt className="text-sm font-medium text-gray-600">{t('metadata.verifiedBy')}</dt>
              <dd className="mt-1 text-sm text-gray-900">{dashboardData.verifiedBy}</dd>
            </div>
          )}
          {dashboardData.ledgerEntry && (
            <div>
              <dt className="text-sm font-medium text-gray-600">{t('ledger.entry')}</dt>
              <dd className="mt-1 text-sm text-gray-900">{dashboardData.ledgerEntry}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Call to Actions */}
      <div className="mb-12 grid gap-4 sm:grid-cols-3">
        {dashboardData.legalLink && (
          <a
            href={dashboardData.legalLink}
            className="rounded-lg border border-gray-200 bg-white p-4 text-center transition-shadow hover:shadow-md"
          >
            <div className="mb-2 text-3xl">⚖️</div>
            <div className="font-medium text-gray-900">{t('metadata.legalAudit')}</div>
          </a>
        )}

        <Link
          href={`/${locale}/dashboard/ledger`}
          className="rounded-lg border border-gray-200 bg-white p-4 text-center transition-shadow hover:shadow-md"
        >
          <div className="mb-2 text-3xl">🔒</div>
          <div className="font-medium text-gray-900">{t('ledger.viewLedger')}</div>
        </Link>

        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') {
              const dataStr = JSON.stringify(dashboardData, null, 2);
              const blob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `ethics-dashboard-${dashboardData.commit}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }
          }}
          className="rounded-lg border border-gray-200 bg-white p-4 text-center transition-shadow hover:shadow-md"
        >
          <div className="mb-2 text-3xl">📥</div>
          <div className="font-medium text-gray-900">{t('actions.exportReport')}</div>
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
        <p className="mb-2 font-medium">{t('footer.compliance')}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <span>{t('footer.gdpr')}</span>
          <span>•</span>
          <span>{t('footer.euAIAct')}</span>
          <span>•</span>
          <span>{t('footer.iso42001')}</span>
          <span>•</span>
          <span>{t('footer.ieee7000')}</span>
        </div>
      </footer>
    </main>
  );
}
