/**
 * @fileoverview Ethical Autonomy Dashboard Page
 * @module app/[locale]/governance/autonomy
 * @see BLOCK9.5_ETHICAL_AUTONOMY.md
 *
 * Dashboard for EWA v2 self-learning governance system
 * Displays EII trends, consent volatility, TTI, and ethical insights
 */

import { Metadata } from 'next/';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ConsentMetrics } from '@/components/dashboard/ConsentMetrics';
import { EIIChart } from '@/components/dashboard/EiiChart';
import { InsightsFeed } from '@/components/dashboard/InsightsFeed';
import { TrustTrajectoryGauge } from '@/components/dashboard/TrustTrajectoryGauge';
import { isValidLocale, locales } from '@/i18n';
import { runAnalysis } from '@/lib/ewa/engine';
import { generateRecommendations, type Recommendation } from '@/lib/ewa/recommendations';
import { getIntegrityConsentMetrics, getIntegrityEIIHistory } from '@/lib/integrity';

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
 * Generate metadata for the autonomy dashboard
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  return {
    title: `Ethical Autonomy Dashboard | QuantumPoly`,
    description:
      'Self-learning governance dashboard with EWA v2 insights, Trust Trajectory Indicator, and ethical risk analysis',
    robots: 'index, follow',
    openGraph: {
      title: 'Ethical Autonomy Dashboard',
      description: 'Self-learning governance with EWA v2',
      type: 'website',
      locale: locale,
    },
    alternates: {
      canonical: `/${locale}/governance/autonomy`,
      languages: {
        en: '/en/governance/autonomy',
        de: '/de/governance/autonomy',
        tr: '/tr/governance/autonomy',
        es: '/es/governance/autonomy',
        fr: '/fr/governance/autonomy',
        it: '/it/governance/autonomy',
      },
    },
  };
}

/**
 * Ethical Autonomy Dashboard Page
 */
export default async function EthicalAutonomyPage({ params }: Props) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  // Run EWA v2 analysis
  let analysisResult;
  let recommendations: Recommendation[];
  let eiiHistory;
  let consentMetrics;

  try {
    analysisResult = await runAnalysis({
      governanceLedgerPath: 'governance/ledger/ledger.jsonl',
      consentLedgerPath: 'governance/consent/ledger.jsonl',
    });

    recommendations = generateRecommendations(analysisResult.insights, analysisResult.statistical);

    eiiHistory = getIntegrityEIIHistory('governance/ledger/ledger.jsonl', 90);
    consentMetrics = getIntegrityConsentMetrics('governance/consent/ledger.jsonl');
  } catch (error) {
    console.error('Failed to load autonomy dashboard data:', error);
    // Use fallback empty data
    analysisResult = {
      timestamp: new Date().toISOString(),
      statistical: {
        eii_analysis: {
          current: 0,
          delta_30d: 0,
          delta_90d: 0,
          volatility: 0,
          trend: 'stable' as const,
        },
        consent_analysis: {
          total_users: 0,
          withdrawal_rate: 0,
          category_shifts: {},
          volatility: 0,
        },
        security_analysis: {
          current_score: 0,
          anomalies_detected: 0,
          trend: 'stable' as const,
        },
      },
      insights: [],
      trust_trajectory: {
        timestamp: new Date().toISOString(),
        tti_score: 0,
        components: {
          eii: 0,
          consent_stability: 0,
          security_posture: 0,
        },
        trend: 'stable' as const,
        velocity: 0,
        volatility: 0,
      },
    };
    recommendations = [];
    eiiHistory = {
      dataPoints: [],
      rollingAverage: [],
      current: 0,
      average: 0,
      min: 0,
      max: 0,
      trend: 'stable' as const,
    };
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
  }

  // Prepare EII chart data
  // const chartData = eiiHistory.dataPoints.map((dp, index) => ({
  //   date: dp.date,
  //   eii: dp.eii,
  //   average: eiiHistory.rollingAverage[index]?.average,
  // }));

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 to-blue-50 px-4 py-12 dark:from-gray-800 dark:to-gray-900">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4">
            <Link
              href={`/${locale}/governance/dashboard`}
              className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
            >
              ← Back to Transparency Dashboard
            </Link>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl dark:text-gray-100">
            Ethical Autonomy Dashboard
          </h1>
          <p className="mb-6 text-xl text-gray-700 dark:text-gray-300">
            Self-learning governance powered by EWA v2 — Ethical Wisdom Analyzer
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-purple-100 px-3 py-1 font-medium text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
              🧠 Cognitive Governance
            </span>
            <span className="rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              📊 Statistical + ML Analysis
            </span>
            <span className="rounded-full bg-green-100 px-3 py-1 font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
              ✓ Human-Verified
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Trust Trajectory & Key Metrics */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Trust Trajectory & System Health
          </h2>
          <div className="grid gap-6 lg:grid-cols-3">
            <TrustTrajectoryGauge trajectory={analysisResult.trust_trajectory} />

            {/* Key Metrics Cards */}
            <div className="space-y-4 lg:col-span-2">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">Current EII</div>
                  <div className="mb-1 text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {analysisResult.statistical.eii_analysis.current.toFixed(1)}
                  </div>
                  <div
                    className={`text-sm ${
                      analysisResult.statistical.eii_analysis.delta_30d >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {analysisResult.statistical.eii_analysis.delta_30d >= 0 ? '↗' : '↘'}{' '}
                    {Math.abs(analysisResult.statistical.eii_analysis.delta_30d).toFixed(1)}% (30d)
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    Consent Stability
                  </div>
                  <div className="mb-1 text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {(
                      100 -
                      analysisResult.statistical.consent_analysis.withdrawal_rate * 2
                    ).toFixed(1)}
                    %
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {analysisResult.statistical.consent_analysis.total_users} users tracked
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    Security Posture
                  </div>
                  <div className="mb-1 text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {analysisResult.statistical.security_analysis.current_score.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {analysisResult.statistical.security_analysis.anomalies_detected} anomalies
                    detected
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    Active Insights
                  </div>
                  <div className="mb-1 text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {analysisResult.insights.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {analysisResult.insights.filter((i) => i.severity === 'critical').length}{' '}
                    critical
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EII Trend Analysis */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Ethics Integrity Index — 90-Day Trend
          </h2>
          <EIIChart history={eiiHistory} height={350} />
        </section>

        {/* Insights Feed */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Ethical Insights & Risk Signals
          </h2>
          <InsightsFeed insights={analysisResult.insights} maxInsights={10} />
        </section>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Recommended Actions
            </h2>
            <div className="space-y-4">
              {recommendations.slice(0, 5).map((rec) => (
                <div
                  key={rec.id}
                  className={`rounded-lg border p-6 ${
                    rec.priority === 'high'
                      ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                      : rec.priority === 'medium'
                        ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                        : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        rec.priority === 'high'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                          : rec.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300'
                      }`}
                    >
                      {rec.priority.toUpperCase()} PRIORITY
                    </span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                      {rec.category.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {rec.title}
                  </h3>
                  <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">{rec.description}</p>
                  <div className="mb-3">
                    <div className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Action Items:
                    </div>
                    <ul className="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      {rec.action_items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Responsible: {rec.responsible_roles.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Consent Metrics */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Consent Volatility Analysis
          </h2>
          <ConsentMetrics metrics={consentMetrics} />
        </section>

        {/* API Access */}
        <section className="mb-12 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
            EWA v2 Public APIs
          </h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            All EWA v2 insights and recommendations are available via public APIs for external
            verification and research.
          </p>
          <div className="space-y-2 text-sm">
            <div className="rounded bg-gray-50 p-3 dark:bg-gray-900">
              <code className="text-purple-600 dark:text-purple-400">GET /api/ewa/insights</code>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Retrieve latest ethical insights with severity scoring
              </p>
            </div>
            <div className="rounded bg-gray-50 p-3 dark:bg-gray-900">
              <code className="text-purple-600 dark:text-purple-400">
                GET /api/ewa/recommendations
              </code>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Get actionable recommendations for governance improvement
              </p>
            </div>
            <div className="rounded bg-gray-50 p-3 dark:bg-gray-900">
              <code className="text-purple-600 dark:text-purple-400">GET /api/ewa/verify</code>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Verify integrity of autonomous analysis ledger entries
              </p>
            </div>
            <div className="rounded bg-gray-50 p-3 dark:bg-gray-900">
              <code className="text-purple-600 dark:text-purple-400">POST /api/ewa/analyze</code>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Manually trigger on-demand analysis (rate-limited)
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-8 text-center dark:border-gray-700">
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            This dashboard is part of Block 9.5: Ethical Autonomy & Self-Learning Governance
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <Link
              href={`/${locale}/governance/dashboard`}
              className="hover:text-purple-600 dark:hover:text-purple-400"
            >
              Transparency Dashboard
            </Link>
            <span>•</span>
            <Link
              href={`/${locale}/governance`}
              className="hover:text-purple-600 dark:hover:text-purple-400"
            >
              Governance Overview
            </Link>
            <span>•</span>
            <Link
              href={`/${locale}/privacy`}
              className="hover:text-purple-600 dark:hover:text-purple-400"
            >
              Privacy Policy
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
