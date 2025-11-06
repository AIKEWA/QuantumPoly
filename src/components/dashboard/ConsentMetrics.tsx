'use client';

/**
 * @fileoverview Consent Metrics Visualization Component
 * @module components/dashboard/ConsentMetrics
 * @see BLOCK9.3_TRANSPARENCY_FRAMEWORK.md
 *
 * Displays aggregated consent statistics with privacy preservation
 * No individual user data exposed
 */

// @ts-expect-error Temporary: recharts PieChart type issue — will fix in Stage VII (ticket #QPOLY-TYPE-001)
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ConsentMetricsProps {
  metrics: {
    totalEvents: number;
    totalUsers: number;
    consentGiven: number;
    consentRevoked: number;
    consentUpdated: number;
    categoryMetrics: {
      essential: { optIn: number; optOut: number; rate: number };
      analytics: { optIn: number; optOut: number; rate: number };
      performance: { optIn: number; optOut: number; rate: number };
    };
  };
}

const COLORS = {
  essential: '#10b981',
  analytics: '#3b82f6',
  performance: '#f59e0b',
  optOut: '#ef4444',
};

/**
 * Consent Metrics Component
 * Visualizes consent category distribution and opt-in rates
 */
export function ConsentMetrics({ metrics }: ConsentMetricsProps) {
  // Prepare data for pie chart (opt-in by category)
  const pieData = [
    { name: 'Essential', value: metrics.categoryMetrics.essential.optIn, color: COLORS.essential },
    { name: 'Analytics', value: metrics.categoryMetrics.analytics.optIn, color: COLORS.analytics },
    { name: 'Performance', value: metrics.categoryMetrics.performance.optIn, color: COLORS.performance },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Consent Metrics Overview
      </h3>

      {/* Summary Statistics */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded bg-gray-50 p-3 dark:bg-gray-900">
          <p className="text-xs text-gray-600 dark:text-gray-400">Total Users</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.totalUsers}</p>
        </div>
        <div className="rounded bg-green-50 p-3 dark:bg-green-900/20">
          <p className="text-xs text-gray-600 dark:text-gray-400">Consent Given</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{metrics.consentGiven}</p>
        </div>
        <div className="rounded bg-orange-50 p-3 dark:bg-orange-900/20">
          <p className="text-xs text-gray-600 dark:text-gray-400">Updated</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {metrics.consentUpdated}
          </p>
        </div>
        <div className="rounded bg-red-50 p-3 dark:bg-red-900/20">
          <p className="text-xs text-gray-600 dark:text-gray-400">Revoked</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{metrics.consentRevoked}</p>
        </div>
      </div>

      {/* Opt-in Rates by Category */}
      <div className="mb-6 space-y-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Opt-in Rates by Category</h4>
        
        {/* Essential */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Essential</span>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {metrics.categoryMetrics.essential.rate.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${metrics.categoryMetrics.essential.rate}%` }}
              role="progressbar"
              aria-valuenow={metrics.categoryMetrics.essential.rate}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Essential consent opt-in rate: ${metrics.categoryMetrics.essential.rate.toFixed(1)}%`}
            />
          </div>
        </div>

        {/* Analytics */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Analytics</span>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {metrics.categoryMetrics.analytics.rate.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${metrics.categoryMetrics.analytics.rate}%` }}
              role="progressbar"
              aria-valuenow={metrics.categoryMetrics.analytics.rate}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Analytics consent opt-in rate: ${metrics.categoryMetrics.analytics.rate.toFixed(1)}%`}
            />
          </div>
        </div>

        {/* Performance */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Performance</span>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {metrics.categoryMetrics.performance.rate.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-orange-500 transition-all duration-500"
              style={{ width: `${metrics.categoryMetrics.performance.rate}%` }}
              role="progressbar"
              aria-valuenow={metrics.categoryMetrics.performance.rate}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Performance consent opt-in rate: ${metrics.categoryMetrics.performance.rate.toFixed(1)}%`}
            />
          </div>
        </div>
      </div>

      {/* Pie Chart */}
      {metrics.totalUsers > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Consent Distribution
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value} users`, 'Opt-in']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="mt-4 rounded bg-blue-50 p-3 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
        <p className="font-semibold">Privacy-Preserving Analytics</p>
        <p className="mt-1">
          All data is aggregated and anonymized. No individual user information is displayed or stored.
        </p>
      </div>
    </div>
  );
}

