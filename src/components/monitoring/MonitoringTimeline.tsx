/**
 * @fileoverview Monitoring Timeline Component
 * @module components/monitoring/MonitoringTimeline
 * @see BLOCK10.3_IMPLEMENTATION_SUMMARY.md
 *
 * Visual timeline of historical monitoring reports
 * Part of "The System That Watches Itself" autonomous monitoring framework
 */

import React from 'react';

export interface MonitoringTimelineEntry {
  date: string;
  timestamp: string;
  systemState: 'healthy' | 'warning' | 'degraded' | 'unknown';
  endpointsPassed: number;
  endpointsTotal: number;
  recommendations: number;
}

export interface MonitoringTimelineProps {
  entries: MonitoringTimelineEntry[];
  maxEntries?: number;
  className?: string;
}

/**
 * Get state color classes
 */
function getStateColor(state: string): {
  dot: string;
  text: string;
  bg: string;
} {
  switch (state) {
    case 'healthy':
      return {
        dot: 'bg-green-500',
        text: 'text-green-700 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-900/20',
      };
    case 'warning':
      return {
        dot: 'bg-yellow-500',
        text: 'text-yellow-700 dark:text-yellow-400',
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      };
    case 'degraded':
      return {
        dot: 'bg-red-500',
        text: 'text-red-700 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-900/20',
      };
    default:
      return {
        dot: 'bg-gray-400',
        text: 'text-gray-600 dark:text-gray-400',
        bg: 'bg-gray-50 dark:bg-gray-900/20',
      };
  }
}

/**
 * Format date as human-readable
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  } catch {
    return dateString;
  }
}

/**
 * Format time
 */
function formatTime(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
    return date.toLocaleTimeString('en-US', options);
  } catch {
    return timestamp;
  }
}

/**
 * Monitoring Timeline Component
 */
export function MonitoringTimeline({
  entries,
  maxEntries = 30,
  className = '',
}: MonitoringTimelineProps) {
  const displayEntries = entries.slice(0, maxEntries);

  if (displayEntries.length === 0) {
    return (
      <div
        className={`rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 ${className}`}
        role="region"
        aria-label="Monitoring Timeline"
      >
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Monitoring History
        </h3>
        <p className="py-8 text-center text-gray-500 dark:text-gray-400">
          No monitoring reports available yet.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 ${className}`}
      role="region"
      aria-label="Monitoring Timeline"
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Monitoring History
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Last {displayEntries.length} monitoring reports
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {displayEntries.map((entry, index) => {
          const colors = getStateColor(entry.systemState);
          const isLast = index === displayEntries.length - 1;

          return (
            <div key={entry.date} className="relative">
              {/* Timeline connector line */}
              {!isLast && (
                <div
                  className="absolute bottom-0 left-2 top-6 w-0.5 bg-gray-200 dark:bg-gray-700"
                  aria-hidden="true"
                />
              )}

              {/* Entry card */}
              <div className="flex items-start gap-4">
                {/* Status dot */}
                <div className="relative z-10 mt-1.5">
                  <div
                    className={`h-4 w-4 rounded-full ${colors.dot} ring-4 ring-white dark:ring-gray-800`}
                    role="img"
                    aria-label={`Status: ${entry.systemState}`}
                  />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 pb-4">
                  <div className={`rounded-lg p-4 ${colors.bg}`}>
                    {/* Date and time */}
                    <div className="mb-2 flex items-center justify-between">
                      <time
                        dateTime={entry.date}
                        className="text-sm font-medium text-gray-900 dark:text-gray-100"
                      >
                        {formatDate(entry.date)}
                      </time>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(entry.timestamp)}
                      </span>
                    </div>

                    {/* Status and metrics */}
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`font-medium capitalize ${colors.text}`}>
                        {entry.systemState}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        •
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {entry.endpointsPassed}/{entry.endpointsTotal} endpoints
                      </span>
                      
                      {entry.recommendations > 0 && (
                        <>
                          <span className="text-gray-600 dark:text-gray-400">
                            •
                          </span>
                          <span className={colors.text}>
                            {entry.recommendations} recommendation
                            {entry.recommendations !== 1 ? 's' : ''}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      {entries.length > maxEntries && (
        <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            Showing {maxEntries} of {entries.length} reports. Full history available in{' '}
            <code className="text-gray-700 dark:text-gray-300">
              reports/monitoring/
            </code>
          </p>
        </div>
      )}

      {/* Accessibility: Summary for screen readers */}
      <div className="sr-only" role="status">
        Monitoring history: {displayEntries.length} reports.
        Latest status: {displayEntries[0].systemState} on {formatDate(displayEntries[0].date)}.
      </div>
    </div>
  );
}

