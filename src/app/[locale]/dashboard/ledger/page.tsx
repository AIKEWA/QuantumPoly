import fs from 'fs';
import path from 'path';

import { Metadata } from 'next';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

// Type definitions
interface LedgerEntry {
  id: string;
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
  merkleRoot: string;
  signature?: string;
}

/**
 * Load ledger entries from filesystem
 */
function loadLedger(): LedgerEntry[] {
  const ledgerPath = path.join(process.cwd(), 'governance', 'ledger', 'ledger.jsonl');

  try {
    if (!fs.existsSync(ledgerPath)) {
      return [];
    }

    const content = fs.readFileSync(ledgerPath, 'utf8');
    const lines = content.trim().split('\n').filter(Boolean);

    return lines.map((line) => JSON.parse(line)).reverse(); // Most recent first
  } catch (error) {
    console.error('Failed to load ledger:', error);
    return [];
  }
}

/**
 * Generate metadata for ledger page
 */
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'dashboard.ledger' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

/**
 * LedgerEntry Component
 */
function LedgerEntryCard({ entry, index }: { entry: LedgerEntry; index: number }) {
  const t = useTranslations('dashboard');

  return (
    <details className="ledger-entry group rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <summary className="cursor-pointer list-none p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                #{index + 1}
              </span>
              <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-700">
                {entry.id}
              </code>
            </div>

            <div className="mb-2 flex items-center gap-4 text-sm text-gray-600">
              <span>
                {new Date(entry.timestamp).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span>•</span>
              <span className="font-mono">{entry.commit}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600">{entry.eii.toFixed(1)}</span>
              <span className="text-sm text-gray-600">EII</span>
              {entry.signature ? (
                <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                  ✓ {t('ledger.signed')}
                </span>
              ) : (
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {t('ledger.unsigned')}
                </span>
              )}
            </div>
          </div>

          <svg
            className="h-6 w-6 text-gray-400 transition-transform group-open:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </summary>

      <div className="border-t border-gray-200 bg-gray-50 p-6">
        {/* Metrics Grid */}
        <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Object.entries(entry.metrics).map(([key, value]) => (
            <div key={key} className="rounded bg-white p-3 text-center shadow-sm">
              <div className="text-xs font-medium uppercase text-gray-600">
                {t(`categories.${key}`)}
              </div>
              <div className="mt-1 text-xl font-bold text-gray-900">{value}</div>
            </div>
          ))}
        </div>

        {/* Hash Information */}
        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-2">
            <span className="text-xs font-medium text-gray-600">{t('metadata.hash')}:</span>
            <code className="ml-2 block break-all font-mono text-xs text-gray-700">
              {entry.hash}
            </code>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-600">{t('ledger.merkleRoot')}:</span>
            <code className="ml-2 block break-all font-mono text-xs text-gray-700">
              {entry.merkleRoot}
            </code>
          </div>
        </div>

        {/* Signature */}
        {entry.signature && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="mb-1 flex items-center gap-2 text-xs font-medium text-green-800">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {t('ledger.signature')}
            </div>
            <code className="block break-all font-mono text-xs text-green-700">
              {entry.signature.substring(0, 200)}...
            </code>
          </div>
        )}
      </div>
    </details>
  );
}

/**
 * Transparency Ledger Page
 */
export default function LedgerPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('dashboard.ledger');
  const entries = loadLedger();

  // Calculate statistics
  const stats = {
    totalEntries: entries.length,
    signedEntries: entries.filter((e) => e.signature).length,
    avgEII: entries.length > 0 ? entries.reduce((sum, e) => sum + e.eii, 0) / entries.length : 0,
    minEII: entries.length > 0 ? Math.min(...entries.map((e) => e.eii)) : 0,
    maxEII: entries.length > 0 ? Math.max(...entries.map((e) => e.eii)) : 0,
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/${locale}/dashboard`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Dashboard
        </Link>

        <h1 className="mb-2 text-4xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-lg text-gray-600">{t('description')}</p>
      </div>

      {entries.length === 0 ? (
        /* Empty State */
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <div className="mb-4 text-6xl">🔒</div>
          <h2 className="mb-2 text-2xl font-semibold text-gray-900">No Ledger Entries Yet</h2>
          <p className="text-gray-600">Run the ledger update script to create the first entry.</p>
          <div className="mt-4 rounded-lg bg-gray-800 p-4">
            <code className="text-sm text-green-400">npm run ethics:ledger-update</code>
          </div>
        </div>
      ) : (
        <>
          {/* Statistics */}
          <div className="mb-8 grid gap-4 sm:grid-cols-5">
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{stats.totalEntries}</div>
              <div className="text-xs text-gray-600">Total Entries</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-green-600">{stats.signedEntries}</div>
              <div className="text-xs text-gray-600">Signed</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{stats.avgEII.toFixed(1)}</div>
              <div className="text-xs text-gray-600">Avg EII</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-orange-600">{stats.minEII}</div>
              <div className="text-xs text-gray-600">Min EII</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-green-600">{stats.maxEII}</div>
              <div className="text-xs text-gray-600">Max EII</div>
            </div>
          </div>

          {/* Download Button */}
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const dataStr = entries.map((e) => JSON.stringify(e)).join('\n');
                  const blob = new Blob([dataStr], { type: 'application/x-ndjson' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'transparency-ledger.jsonl';
                  a.click();
                  URL.revokeObjectURL(url);
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              {t('downloadJSON')}
            </button>
          </div>

          {/* Ledger Entries */}
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <LedgerEntryCard key={entry.id} entry={entry} index={index} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
