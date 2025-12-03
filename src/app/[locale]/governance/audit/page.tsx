/**
 * @fileoverview Ledger Validation Dashboard
 * @module app/[locale]/governance/audit
 * @see FPP-10
 *
 * Displays real-time governance transparency, integrity status, and validation tools.
 */

import { Metadata } from 'next';

import { VerificationWidget } from '@/components/dashboard/VerificationWidget';
import { getIntegrityLedgerStats, getIntegrityCurrentEII } from '@/lib/integrity';

export const metadata: Metadata = {
  title: 'Ledger Validation Dashboard | QuantumPoly',
  description: 'Verify the integrity of governance and consent ledgers in real-time.',
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LedgerValidationDashboard({ params }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { locale } = await params;

  // Fetch initial data
  const ledgerStats = getIntegrityLedgerStats();
  const currentEII = getIntegrityCurrentEII();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
          Ledger Validation Dashboard
        </h1>
        <p className="max-w-3xl text-lg text-gray-600 dark:text-gray-300">
          Transparent verification of all governance actions, consent records, and system integrity.
          This dashboard provides cryptographic proof of the system's immutability.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Primary Verification Widget */}
        <div className="lg:col-span-2">
          <VerificationWidget />
        </div>

        {/* Ledger Statistics */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            Governance Ledger Stats
          </h2>
          <dl className="grid grid-cols-2 gap-4">
            <div className="rounded bg-gray-50 p-4 dark:bg-gray-900">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Entries
              </dt>
              <dd className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                {ledgerStats.totalEntries}
              </dd>
            </div>
            <div className="rounded bg-gray-50 p-4 dark:bg-gray-900">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Current EII</dt>
              <dd
                className={`mt-1 text-2xl font-bold ${
                  currentEII >= 80
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}
              >
                {currentEII.toFixed(1)}
              </dd>
            </div>
            <div className="col-span-2 rounded bg-gray-50 p-4 dark:bg-gray-900">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Update</dt>
              <dd className="mt-1 font-mono text-sm text-gray-900 dark:text-gray-100">
                {ledgerStats.dateRange.end
                  ? new Date(ledgerStats.dateRange.end).toLocaleString()
                  : 'N/A'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Documentation & Info */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            About Integrity
          </h2>
          <div className="prose prose-sm dark:prose-invert">
            <p>
              The Integrity Module ensures that the QuantumPoly governance model remains accountable
              and transparent.
            </p>
            <ul>
              <li>
                <strong>Cryptographic Chaining:</strong> Each ledger entry is hashed and linked to
                the previous one.
              </li>
              <li>
                <strong>Merkle Trees:</strong> Enables efficient and secure verification of large
                datasets.
              </li>
              <li>
                <strong>Public Verification:</strong> Anyone can verify the integrity of the system
                using this dashboard.
              </li>
            </ul>
            <p className="mt-4">
              <a
                href="/docs/integrity/ARCHITECTURE.md"
                className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
              >
                View System Architecture →
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
