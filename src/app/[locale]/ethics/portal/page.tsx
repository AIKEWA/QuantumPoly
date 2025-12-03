/**
 * @fileoverview Public Ethics Portal Page
 * @module app/ethics/portal
 * @see BLOCK10.2_TRANSPARENCY_API_AND_PORTAL.md
 * @see BLOCK10.3_IMPLEMENTATION_SUMMARY.md
 *
 * Public transparency portal displaying governance ledger timeline and integrity proofs
 * Enhanced with autonomous system monitoring (BLOCK 10.3)
 */

import { Metadata } from 'next';
import Link from 'next/link';

import { MonitoringTimeline } from '@/components/monitoring/MonitoringTimeline';
import { SystemHealthCard } from '@/components/monitoring/SystemHealthCard';
import { getLatestReportSummary, getReportHistory } from '@/lib/monitoring/report-reader';

/**
 * Metadata for ethics portal page
 */
export const metadata: Metadata = {
  title: 'Ethics Portal | QuantumPoly',
  description:
    'Public transparency portal for governance ledger, audit status, and integrity proofs',
  robots: 'index, follow',
  openGraph: {
    title: 'Ethics Portal - QuantumPoly',
    description: 'Real-time access to governance ledger and integrity verification',
    type: 'website',
  },
};

/**
 * Revalidate every 5 minutes (hybrid caching)
 */
export const revalidate = 300;

/**
 * Summary response from API
 */
interface SummaryResponse {
  latest: string;
  merkle_root: string;
  verified: boolean;
  totalEntries: number;
  lastUpdate: string;
  blocks: string[];
  recentChanges: Array<{
    block: string;
    timestamp: string;
    entryType: string;
    title: string;
  }>;
}

/**
 * Fetch summary data server-side
 */
async function fetchSummary(): Promise<SummaryResponse | null> {
  try {
    // Use internal API route for SSR
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/ethics/summary`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error('Failed to fetch summary:', response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching summary:', error);
    return null;
  }
}

/**
 * Generate simple SVG timeline
 */
function generateTimelineSVG(entries: Array<{ block: string; timestamp: string; title?: string }>) {
  const width = 800;
  const height = 400;
  const padding = 40;
  const nodeRadius = 8;

  // Calculate positions
  const totalEntries = entries.length;
  const xStep = totalEntries > 1 ? (width - 2 * padding) / (totalEntries - 1) : 0;

  // Generate SVG elements
  const nodes = entries.map((entry, index) => {
    const x = padding + index * xStep;
    const y = height / 2;

    return `
      <g key="${index}">
        <circle cx="${x}" cy="${y}" r="${nodeRadius}" fill="#0ea5e9" stroke="#0c4a6e" stroke-width="2" />
        <text x="${x}" y="${y - 20}" text-anchor="middle" font-size="12" fill="#334155">
          ${entry.block.length > 12 ? entry.block.substring(0, 12) + '...' : entry.block}
        </text>
        <text x="${x}" y="${y + 30}" text-anchor="middle" font-size="10" fill="#64748b">
          ${new Date(entry.timestamp).toLocaleDateString()}
        </text>
      </g>
    `;
  });

  // Generate connecting lines
  const lines = entries.slice(0, -1).map((_, index) => {
    const x1 = padding + index * xStep;
    const x2 = padding + (index + 1) * xStep;
    const y = height / 2;

    return `<line x1="${x1 + nodeRadius}" y1="${y}" x2="${x2 - nodeRadius}" y2="${y}" stroke="#cbd5e1" stroke-width="2" />`;
  });

  return `
    <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Governance ledger timeline">
      <title>Governance Ledger Timeline</title>
      <desc>Visual timeline of governance ledger entries showing blocks and timestamps</desc>
      ${lines.join('\n')}
      ${nodes.join('\n')}
    </svg>
  `;
}

/**
 * Ethics Portal Page Component
 */
export default async function EthicsPortalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Fetch summary data server-side
  const summary = await fetchSummary();

  // Fallback data if fetch fails
  const verified = summary?.verified ?? false;
  const merkleRoot = summary?.merkle_root ?? 'unavailable';
  const latest = summary?.latest ?? 'unknown';
  const totalEntries = summary?.totalEntries ?? 0;
  const lastUpdate = summary?.lastUpdate ?? new Date().toISOString();
  const recentChanges = summary?.recentChanges ?? [];

  // Get monitoring data (BLOCK 10.3)
  const monitoringSummary = getLatestReportSummary();
  const monitoringHistory = getReportHistory(30).map((report) => ({
    date: report.report_date,
    timestamp: report.timestamp,
    systemState: report.system_state,
    endpointsPassed: report.endpoint_summary.passed,
    endpointsTotal: report.endpoint_summary.total,
    recommendations: report.recommendations.length,
  }));

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cyan-50 to-blue-50 px-4 py-12 dark:from-gray-800 dark:to-gray-900">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl dark:text-gray-100">
            Ethics Portal
          </h1>
          <p className="mb-6 text-xl text-gray-700 dark:text-gray-300">
            Public transparency layer for governance ledger, audit status, and integrity proofs
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <span
              className={`rounded-full px-3 py-1 font-medium ${
                verified
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}
              role="status"
              aria-label={verified ? 'Ledger verified' : 'Ledger not verified'}
            >
              {verified ? '✓ Verified' : '✗ Not Verified'}
            </span>
            <span className="rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              {totalEntries} Entries
            </span>
            <span className="rounded-full bg-purple-100 px-3 py-1 font-medium text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
              Public API
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* System Monitoring (BLOCK 10.3) */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
            System Monitoring
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Real-time autonomous monitoring - <em>&quot;The System That Watches Itself&quot;</em>
          </p>

          {monitoringSummary.available ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <SystemHealthCard
                systemState={
                  monitoringSummary.system_state as 'healthy' | 'warning' | 'degraded' | 'unknown'
                }
                timestamp={monitoringSummary.timestamp}
                endpointsHealthy={monitoringSummary.endpoints_healthy}
                uptimePercentage={monitoringSummary.uptime_7d}
                trend={monitoringSummary.trend as 'improving' | 'stable' | 'declining' | 'unknown'}
              />
              <MonitoringTimeline entries={monitoringHistory} maxEntries={10} />
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
              <p className="text-gray-500 dark:text-gray-400">
                Monitoring data not yet available. System monitoring begins after first autonomous
                check.
              </p>
            </div>
          )}
        </section>

        {/* Integrity Badges */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Ledger Integrity Status
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                Verification Status
              </div>
              <div
                className={`text-2xl font-bold ${
                  verified ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}
                aria-label={`Verification status: ${verified ? 'verified' : 'not verified'}`}
              >
                {verified ? 'Verified ✓' : 'Not Verified ✗'}
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                Last checked: {new Date(lastUpdate).toLocaleString()}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                Latest Block
              </div>
              <div
                className="text-2xl font-bold text-gray-900 dark:text-gray-100"
                aria-label={`Latest block: ${latest}`}
              >
                {latest}
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                Total entries: {totalEntries}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                Merkle Root
              </div>
              <div
                className="break-all font-mono text-sm text-gray-900 dark:text-gray-100"
                aria-label={`Merkle root: ${merkleRoot}`}
              >
                {merkleRoot.substring(0, 32)}...
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                Cryptographic proof
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Visualization */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Ledger Timeline
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            {recentChanges.length > 0 ? (
              <div
                className="overflow-x-auto"
                dangerouslySetInnerHTML={{
                  __html: generateTimelineSVG(
                    recentChanges.map((change) => ({
                      block: change.block,
                      timestamp: change.timestamp,
                      title: change.title,
                    })),
                  ),
                }}
              />
            ) : (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                No ledger entries available
              </div>
            )}
          </div>
        </section>

        {/* Recent Changes */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Recent Changes
          </h2>
          <div className="space-y-4">
            {recentChanges.length > 0 ? (
              recentChanges.map((change, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {change.block}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-500">
                      {new Date(change.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
                    {change.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    Type: {change.entryType}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                No recent changes available
              </div>
            )}
          </div>
        </section>

        {/* API Documentation */}
        <section className="mb-12 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
            Public API Access
          </h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            All governance data is available via public APIs for transparency and third-party
            verification.
          </p>
          <div className="space-y-3 text-sm">
            <div className="rounded bg-gray-50 p-3 dark:bg-gray-900">
              <code className="text-cyan-600 dark:text-cyan-400">GET /api/ethics/ledger</code>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Returns full public governance ledger with hashes, checksums, and signatures
              </p>
            </div>
            <div className="rounded bg-gray-50 p-3 dark:bg-gray-900">
              <code className="text-cyan-600 dark:text-cyan-400">GET /api/ethics/summary</code>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Returns summary of governance ledger (blocks, hash chain, latest changes)
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
            <p className="font-semibold">For Auditors</p>
            <p className="mt-1">
              Full documentation and verification workflows are available in the{' '}
              <Link
                href="/docs/transparency"
                className="underline hover:text-blue-900 dark:hover:text-blue-200"
              >
                transparency documentation
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Footer Navigation */}
        <footer className="border-t border-gray-200 pt-8 text-center dark:border-gray-700">
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            This portal is part of Block 10.2: Transparency API & Public Ethics Portal
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <Link
              href={`/${locale}/governance`}
              className="hover:text-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:hover:text-cyan-400"
            >
              Governance Overview
            </Link>
            <span aria-hidden="true">•</span>
            <Link
              href={`/${locale}/privacy`}
              className="hover:text-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:hover:text-cyan-400"
            >
              Privacy Policy
            </Link>
            <span aria-hidden="true">•</span>
            <Link
              href={`/${locale}/contact`}
              className="hover:text-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:hover:text-cyan-400"
            >
              Contact
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
