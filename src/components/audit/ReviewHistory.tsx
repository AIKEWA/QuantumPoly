/**
 * @fileoverview Review History Component - Block 9.9
 * @module components/audit/ReviewHistory
 * @see BLOCK9.9_FINAL_AUDIT_AND_HANDOFF.md
 *
 * Display of past sign-offs
 */

'use client';

import type { PublicSignOffSummary, ReviewDecision } from '@/lib/audit/types';

interface ReviewHistoryProps {
  signoffs: PublicSignOffSummary[];
}

/**
 * Get decision badge color
 */
function getDecisionColor(decision: ReviewDecision): string {
  switch (decision) {
    case 'approved':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'approved_with_exceptions':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  }
}

/**
 * Format decision text
 */
function formatDecision(decision: ReviewDecision): string {
  return decision.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Review History Component
 */
export function ReviewHistory({ signoffs }: ReviewHistoryProps) {
  if (signoffs.length === 0) {
    return (
      <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-600 dark:text-gray-400">
          No sign-offs recorded yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
        Review History
      </h2>

      <div className="space-y-3">
        {signoffs.map((signoff) => (
          <div
            key={signoff.review_id}
            className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {signoff.role}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${getDecisionColor(
                      signoff.decision
                    )}`}
                  >
                    {formatDecision(signoff.decision)}
                  </span>
                  {signoff.has_exceptions && (
                    <span
                      className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                      title="Includes exception justifications"
                    >
                      ⚠️ Exceptions
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {new Date(signoff.timestamp).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>

                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Scope:
                  </p>
                  <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-gray-600 dark:text-gray-400">
                    {signoff.review_scope.map((scope) => (
                      <li key={scope}>{scope}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-500">
        Privacy Notice: This history displays public summaries only. Reviewer
        names and detailed notes are not exposed via public API.
      </p>
    </div>
  );
}

