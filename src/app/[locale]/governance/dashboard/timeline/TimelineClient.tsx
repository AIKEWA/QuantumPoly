'use client';

/**
 * @fileoverview Timeline Client Component
 * @module app/[locale]/governance/dashboard/timeline/TimelineClient
 * @see BLOCK10.4_DASHBOARD_REFINEMENT.md
 *
 * Client-side interactive timeline page with data fetching and state management
 */

import Link from 'next/link';
import { useState } from 'react';

import { BlockDetailModal } from '@/components/dashboard/BlockDetailModal';
import { LedgerFeed } from '@/components/dashboard/LedgerFeed';
import { LedgerTimeline } from '@/components/dashboard/LedgerTimeline';
import { TrustLegend } from '@/components/dashboard/TrustLegend';
import { useLedgerData } from '@/hooks/use-ledger-data';
import { getVerificationStats, type LedgerEntry } from '@/lib/governance/hash-continuity';

interface TimelineClientProps {
  locale: string;
  ledgerType?: string;
  highlightBlock?: string;
}

export function TimelineClient({ locale, ledgerType = 'governance' }: TimelineClientProps) {
  const { data, status, error, refresh, lastUpdated } = useLedgerData({
    refreshMs: 15000,
    ledgerType: ledgerType as 'governance' | 'consent' | 'federation',
  });

  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle block click from timeline
  const handleBlockClick = (entry: any) => {
    setSelectedEntry(entry as LedgerEntry);
    setIsModalOpen(true);
  };

  // Handle navigate to parent
  const handleNavigateToParent = (parentId: string) => {
    if (!data) return;
    const parentEntry = data.entries.find((e) => (e.block || e.id) === parentId);
    if (parentEntry) {
      setSelectedEntry(parentEntry as unknown as LedgerEntry);
    }
  };

  // Get verification statistics
  const stats = data ? getVerificationStats(data.entries as unknown as LedgerEntry[]) : null;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Interactive Ledger Timeline
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Real-time visualization of governance ledger with hash chain verification
              </p>
            </div>

            {/* Ledger Type Toggle */}
            <div className="flex items-center gap-2">
              <label htmlFor="ledger-type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Ledger:
              </label>
              <select
                id="ledger-type"
                value={ledgerType}
                onChange={(e) => {
                  const newType = e.target.value;
                  window.location.href = `/${locale}/governance/dashboard/timeline?ledger=${newType}`;
                }}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="governance">Governance</option>
                <option value="consent">Consent</option>
                <option value="federation">Federation</option>
              </select>
            </div>
          </div>

          {/* Breadcrumb */}
          <nav className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
            <Link href={`/${locale}`} className="hover:text-cyan-600 dark:hover:text-cyan-400">
              Home
            </Link>
            <span className="mx-2">→</span>
            <Link href={`/${locale}/governance`} className="hover:text-cyan-600 dark:hover:text-cyan-400">
              Governance
            </Link>
            <span className="mx-2">→</span>
            <Link href={`/${locale}/governance/dashboard`} className="hover:text-cyan-600 dark:hover:text-cyan-400">
              Dashboard
            </Link>
            <span className="mx-2">→</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">Timeline</span>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Status Messages */}
        {status === 'loading' && (
          <div className="mb-8 rounded-lg bg-blue-50 p-4 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Loading ledger data...</span>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="mb-8 rounded-lg border-2 border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-400">Failed to load ledger</h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {error?.message || 'An unknown error occurred'}
                </p>
              </div>
              <button
                onClick={refresh}
                className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {status === 'stale' && (
          <div className="mb-8 rounded-lg bg-yellow-50 p-4 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Data may be outdated. Showing last known good snapshot.</span>
              </div>
              <button
                onClick={refresh}
                className="rounded-lg bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-800 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-yellow-900/40 dark:text-yellow-300 dark:hover:bg-yellow-900/60"
              >
                Refresh
              </button>
            </div>
          </div>
        )}

        {data && data.entries.length > 0 && (
          <>
            {/* Overview Panel */}
            <section className="mb-8 grid gap-6 md:grid-cols-4">
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Blocks</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {data.totalEntries}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">Latest Block</p>
                <p className="mt-1 font-mono text-lg font-bold text-gray-900 dark:text-gray-100">
                  {data.latest}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">Merkle Root</p>
                <p className="mt-1 truncate font-mono text-xs text-gray-900 dark:text-gray-100">
                  {data.merkle_root.substring(0, 16)}...
                </p>
                <button
                  onClick={() => navigator.clipboard.writeText(data.merkle_root)}
                  className="mt-2 text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400"
                >
                  Copy Full Hash
                </button>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">Verification Status</p>
                <div className="mt-1 flex items-center gap-2">
                  {data.verified ? (
                    <>
                      <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-semibold text-green-600 dark:text-green-400">Verified</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-semibold text-yellow-600 dark:text-yellow-400">Warning</span>
                    </>
                  )}
                </div>
                {stats && (
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    {stats.verified}/{stats.total} verified
                  </p>
                )}
              </div>
            </section>

            {/* Main Content Grid */}
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Timeline (2/3 width) */}
              <div className="space-y-8 lg:col-span-2">
                <LedgerTimeline
                  entries={data.entries as unknown as LedgerEntry[]}
                  height={600}
                  onBlockClick={handleBlockClick}
                  showControls
                />

                {/* Trust Legend */}
                <TrustLegend />
              </div>

              {/* Sidebar (1/3 width) */}
              <div className="space-y-8">
                <LedgerFeed
                  entries={data.entries}
                  locale={locale}
                  maxEntries={10}
                  showFilters={true}
                  onEntryClick={handleBlockClick}
                />

                {/* Verification Stats */}
                {stats && (
                  <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Verification Statistics
                    </h3>
                    <dl className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600 dark:text-gray-400">Verified:</dt>
                        <dd className="font-semibold text-green-600 dark:text-green-400">
                          {stats.statusCounts.verified}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600 dark:text-gray-400">Warnings:</dt>
                        <dd className="font-semibold text-yellow-600 dark:text-yellow-400">
                          {stats.statusCounts.warning}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600 dark:text-gray-400">Errors:</dt>
                        <dd className="font-semibold text-red-600 dark:text-red-400">
                          {stats.statusCounts.error}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600 dark:text-gray-400">Unknown:</dt>
                        <dd className="font-semibold text-gray-600 dark:text-gray-400">
                          {stats.statusCounts.unknown}
                        </dd>
                      </div>
                      <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                        <div className="flex justify-between">
                          <dt className="font-medium text-gray-900 dark:text-gray-100">Verification Rate:</dt>
                          <dd className="font-bold text-cyan-600 dark:text-cyan-400">
                            {stats.verificationRate.toFixed(1)}%
                          </dd>
                        </div>
                      </div>
                    </dl>
                  </div>
                )}

                {/* Last Updated */}
                {lastUpdated && (
                  <div className="rounded-lg bg-gray-100 p-4 text-xs text-gray-600 dark:bg-gray-900 dark:text-gray-400">
                    <p className="font-medium">Last Updated:</p>
                    <p className="mt-1">{new Date(lastUpdated).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {data && data.entries.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No ledger entries found</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              The selected ledger does not contain any entries yet.
            </p>
          </div>
        )}
      </div>

      {/* Block Detail Modal */}
      <BlockDetailModal
        entry={selectedEntry}
        allEntries={(data?.entries || []) as unknown as LedgerEntry[]}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNavigateToParent={handleNavigateToParent}
      />
    </main>
  );
}

