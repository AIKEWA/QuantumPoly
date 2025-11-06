'use client';

/**
 * @fileoverview Trust Legend Component
 * @module components/dashboard/TrustLegend
 * @see BLOCK10.4_DASHBOARD_REFINEMENT.md
 *
 * Plain-language legend explaining verification statuses
 * with color-independent visual cues (shapes + patterns + icons)
 */

interface TrustLegendProps {
  compact?: boolean;
}

/**
 * Trust Legend Component
 *
 * Explains verification statuses in plain language with:
 * - Color-coded indicators
 * - Shape-based visual cues (for colorblind users)
 * - Icon-based visual cues
 * - Clear descriptions
 */
export function TrustLegend({ compact = false }: TrustLegendProps) {
  const statuses = [
    {
      name: 'Verified',
      color: 'bg-green-500 dark:bg-green-400',
      textColor: 'text-green-800 dark:text-green-400',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      shape: 'Circle',
      description: 'Hash chain intact, parent relationship confirmed',
      meaning: 'The block has been verified and its hash chain continuity is intact.',
    },
    {
      name: 'Warning',
      color: 'bg-yellow-500 dark:bg-yellow-400',
      textColor: 'text-yellow-800 dark:text-yellow-400',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      shape: 'Triangle',
      description: 'Continuity gap detected, manual review recommended',
      meaning: 'The parent block reference cannot be found. This may indicate a data issue.',
    },
    {
      name: 'Error',
      color: 'bg-red-500 dark:bg-red-400',
      textColor: 'text-red-800 dark:text-red-400',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
      shape: 'Square',
      description: 'Hash format invalid or verification failed',
      meaning: 'The block hash is malformed or verification encountered an error.',
    },
    {
      name: 'Unknown',
      color: 'bg-gray-500 dark:bg-gray-400',
      textColor: 'text-gray-800 dark:text-gray-400',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      ),
      shape: 'Diamond',
      description: 'Verification incomplete, data not available',
      meaning: 'Verification status could not be determined due to missing information.',
    },
  ];

  if (compact) {
    return (
      <div className="flex flex-wrap gap-4" role="list" aria-label="Verification status legend">
        {statuses.map((status) => (
          <div key={status.name} className="flex items-center gap-2" role="listitem">
            <span className={`flex h-4 w-4 items-center justify-center rounded-full ${status.color}`} aria-hidden="true">
              <span className="sr-only">{status.shape}</span>
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{status.name}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Trust Status Legend</h3>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Each block in the ledger is verified for hash chain continuity. The following statuses indicate the
        verification result:
      </p>

      <div className="space-y-4" role="list" aria-label="Verification status descriptions">
        {statuses.map((status) => (
          <div key={status.name} className="flex gap-4" role="listitem">
            {/* Visual indicator with multiple cues */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${status.color}`}
                aria-label={`${status.name} status indicator`}
              >
                <span className={status.textColor}>{status.icon}</span>
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400" aria-label={`Shape: ${status.shape}`}>
                {status.shape}
              </span>
            </div>

            {/* Description */}
            <div className="flex-1">
              <h4 className="mb-1 font-semibold text-gray-900 dark:text-gray-100">{status.name}</h4>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{status.description}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{status.meaning}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Accessibility note */}
      <div className="mt-6 rounded-lg bg-blue-50 p-4 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
        <strong className="mb-1 block">Accessibility Note:</strong>
        Status indicators use multiple visual cues (color, shape, icon) to ensure information is accessible to
        all users, including those with color vision deficiencies.
      </div>
    </div>
  );
}

