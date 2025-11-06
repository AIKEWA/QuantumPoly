/**
 * @fileoverview System Health Card Component
 * @module components/monitoring/SystemHealthCard
 * @see BLOCK10.3_IMPLEMENTATION_SUMMARY.md
 *
 * Visual indicator of current system health state
 * Part of "The System That Watches Itself" autonomous monitoring framework
 */

import React from 'react';

export interface SystemHealthCardProps {
  systemState: 'healthy' | 'warning' | 'degraded' | 'unknown';
  timestamp: string;
  endpointsHealthy: string;
  uptimePercentage: number;
  trend: 'improving' | 'stable' | 'declining' | 'unknown';
  className?: string;
}

/**
 * Get visual indicator for system state
 */
function getStateIndicator(state: string): {
  color: string;
  bgColor: string;
  icon: string;
  label: string;
} {
  switch (state) {
    case 'healthy':
      return {
        color: 'text-green-700 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        icon: '✓',
        label: 'Healthy',
      };
    case 'warning':
      return {
        color: 'text-yellow-700 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        icon: '⚠',
        label: 'Warning',
      };
    case 'degraded':
      return {
        color: 'text-red-700 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        icon: '✗',
        label: 'Degraded',
      };
    default:
      return {
        color: 'text-gray-700 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-900/30',
        icon: '?',
        label: 'Unknown',
      };
  }
}

/**
 * Get trend indicator
 */
function getTrendIndicator(trend: string): string {
  switch (trend) {
    case 'improving':
      return '↗ Improving';
    case 'declining':
      return '↘ Declining';
    case 'stable':
      return '→ Stable';
    default:
      return '— Unknown';
  }
}

/**
 * Format timestamp as relative time
 */
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } catch {
    return timestamp;
  }
}

/**
 * System Health Card Component
 */
export function SystemHealthCard({
  systemState,
  timestamp,
  endpointsHealthy,
  uptimePercentage,
  trend,
  className = '',
}: SystemHealthCardProps) {
  const indicator = getStateIndicator(systemState);
  const trendLabel = getTrendIndicator(trend);

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}
      role="region"
      aria-label="System Health Status"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            System Health
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Real-time monitoring status
          </p>
        </div>
        
        {/* Status Badge */}
        <div
          className={`flex items-center gap-2 rounded-full px-3 py-1.5 ${indicator.bgColor}`}
          role="status"
          aria-live="polite"
        >
          <span className={`text-lg ${indicator.color}`} aria-hidden="true">
            {indicator.icon}
          </span>
          <span className={`text-sm font-medium ${indicator.color}`}>
            {indicator.label}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        {/* Endpoints */}
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Endpoints
          </dt>
          <dd className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {endpointsHealthy}
          </dd>
          <dd className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Operational
          </dd>
        </div>

        {/* Uptime */}
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            7-Day Uptime
          </dt>
          <dd className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {uptimePercentage.toFixed(1)}%
          </dd>
          <dd className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {trendLabel}
          </dd>
        </div>
      </div>

      {/* Last Update */}
      <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Last verified:{' '}
          <time dateTime={timestamp} className="font-medium">
            {formatTimestamp(timestamp)}
          </time>
        </p>
      </div>

      {/* Accessibility: Screen reader announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        System status: {indicator.label}. {endpointsHealthy} endpoints operational.
        7-day uptime: {uptimePercentage.toFixed(1)}%. Trend: {trendLabel}.
        Last verified {formatTimestamp(timestamp)}.
      </div>
    </div>
  );
}

