/**
 * @fileoverview Integrity Status Panel - Block 9.9
 * @module components/audit/IntegrityStatusPanel
 * @see BLOCK9.9_FINAL_AUDIT_AND_HANDOFF.md
 *
 * Live integrity monitoring display from Block 9.8
 */

'use client';

import type { IntegritySnapshot, SystemState } from '@/lib/audit/types';

interface IntegrityStatusPanelProps {
  snapshot: IntegritySnapshot;
}

/**
 * Get status color classes
 */
function getStatusColor(state: SystemState): {
  bg: string;
  text: string;
  border: string;
} {
  switch (state) {
    case 'healthy':
      return {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-800 dark:text-green-300',
        border: 'border-green-200 dark:border-green-800',
      };
    case 'degraded':
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        text: 'text-yellow-800 dark:text-yellow-300',
        border: 'border-yellow-200 dark:border-yellow-800',
      };
    case 'attention_required':
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-800 dark:text-red-300',
        border: 'border-red-200 dark:border-red-800',
      };
  }
}

/**
 * Get ledger status icon
 */
function getLedgerStatusIcon(status: 'valid' | 'degraded' | 'critical'): string {
  switch (status) {
    case 'valid':
      return '✅';
    case 'degraded':
      return '⚠️';
    case 'critical':
      return '❌';
  }
}

/**
 * Integrity Status Panel Component
 */
export function IntegrityStatusPanel({ snapshot }: IntegrityStatusPanelProps) {
  const colors = getStatusColor(snapshot.system_state);

  return (
    <div
      className={`rounded-lg border-2 p-6 ${colors.bg} ${colors.border}`}
      role="region"
      aria-label="System Integrity Status"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className={`text-xl font-bold ${colors.text}`}>
          Integrity Status
        </h2>
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold uppercase ${colors.text}`}
          aria-label={`System state: ${snapshot.system_state.replace('_', ' ')}`}
        >
          {snapshot.system_state.replace('_', ' ')}
        </span>
      </div>

      <div className="space-y-4">
        {/* Last Verification */}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Last Verification
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(snapshot.last_verification).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        </div>

        {/* Verification Scope */}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Verification Scope
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {snapshot.verification_scope}
          </p>
        </div>

        {/* Ledger Status */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Ledger Health
          </p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(snapshot.ledger_status).map(([ledger, status]) => (
              <div
                key={ledger}
                className="flex items-center space-x-2 rounded bg-white/50 px-2 py-1 dark:bg-gray-800/50"
              >
                <span aria-hidden="true">{getLedgerStatusIcon(status)}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {ledger}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Open Issues */}
        {snapshot.open_issues.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Open Issues ({snapshot.open_issues.length})
            </p>
            <ul className="space-y-1">
              {snapshot.open_issues.map((issue, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  <span className="font-medium">{issue.classification}</span>:{' '}
                  {issue.count} {issue.severity} severity
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pending Reviews */}
        {snapshot.pending_human_reviews > 0 && (
          <div className="rounded-md bg-yellow-100 p-3 dark:bg-yellow-900/30">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
              ⚠️ {snapshot.pending_human_reviews} pending human review(s)
            </p>
          </div>
        )}

        {/* Merkle Root */}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Global Merkle Root
          </p>
          <p className="font-mono text-xs text-gray-600 dark:text-gray-400">
            {snapshot.global_merkle_root.substring(0, 32)}...
          </p>
        </div>
      </div>

      {/* Conditional Approval Warning */}
      {snapshot.system_state === 'attention_required' && (
        <div className="mt-4 rounded-md border-2 border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-semibold text-red-800 dark:text-red-300">
            ⚠️ Conditional Approval Required
          </p>
          <p className="mt-1 text-sm text-red-700 dark:text-red-400">
            System integrity requires attention. Approval may proceed only with
            explicit exception justification documenting known issues and
            mitigation plans.
          </p>
        </div>
      )}
    </div>
  );
}

