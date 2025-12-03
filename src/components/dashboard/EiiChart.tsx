'use client';

/**
 * @fileoverview Ethics Integrity Index (EII) Chart Component
 * @module components/dashboard/EIIChart
 * @see BLOCK9.3_TRANSPARENCY_FRAMEWORK.md
 *
 * Visualizes EII with 90-day rolling average using Recharts
 * WCAG 2.2 AA compliant with accessible tooltips and labels
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { EIIHistory } from '@/types/integrity';

interface EIIChartProps {
  history: EIIHistory;
  height?: number;
}

const COLORS = {
  eii: '#0891b2', // cyan-600
  average: '#f59e0b', // amber-500
};

/**
 * EII Chart Component
 * Displays EII trend over time with optional rolling average
 */
export function EIIChart({ history, height = 300 }: EIIChartProps) {
  const { dataPoints, rollingAverage, current, average, min, max } = history;

  // Combine dataPoints with rolling average for the chart
  const chartData = dataPoints.map((dp) => {
    const avgEntry = rollingAverage.find((ra) => ra.date === dp.date);
    return {
      date: dp.date,
      eii: dp.eii,
      average: avgEntry ? avgEntry.average : undefined,
    };
  });

  if (!chartData || chartData.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 dark:border-gray-700 dark:bg-gray-800"
        style={{ height }}
      >
        <p className="text-gray-500 dark:text-gray-400">No EII data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Ethics Integrity Index (EII) — 90-Day Trend
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          aria-label="Ethics Integrity Index chart showing 90-day trend"
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="date"
            tick={{ fill: 'currentColor' }}
            className="text-gray-600 dark:text-gray-400"
            tickFormatter={(value: number | string) => {
              // Format date as MM/DD
              const date = new Date(value);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
            aria-label="Date axis"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: 'currentColor' }}
            className="text-gray-600 dark:text-gray-400"
            aria-label="EII score axis"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg, #fff)',
              borderColor: 'var(--tooltip-border, #e5e7eb)',
              color: 'var(--tooltip-text, #374151)',
              borderRadius: '0.5rem',
            }}
            formatter={(value: number, name: string) => [
              value.toFixed(1),
              name === 'eii' ? 'EII Score' : '7-Day Average',
            ]}
            labelFormatter={(label: number | string) => `Date: ${label}`}
          />
          <Legend
            wrapperStyle={{ color: 'currentColor' }}
            iconType="line"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => (value === 'eii' ? 'EII Score' : '7-Day Average')}
          />
          <Line
            type="monotone"
            dataKey="eii"
            stroke={COLORS.eii}
            strokeWidth={2}
            dot={{ fill: COLORS.eii, r: 4 }}
            activeDot={{ r: 6 }}
            name="eii"
            aria-label="EII score line"
          />
          <Line
            type="monotone"
            dataKey="average"
            stroke={COLORS.average}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="average"
            aria-label="7-day rolling average line"
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
        <div className="rounded bg-gray-50 p-3 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400">Current</p>
          <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400">{current.toFixed(1)}</p>
        </div>
        <div className="rounded bg-gray-50 p-3 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400">Average</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{average.toFixed(1)}</p>
        </div>
        <div className="rounded bg-gray-50 p-3 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400">Min</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{min.toFixed(1)}</p>
        </div>
        <div className="rounded bg-gray-50 p-3 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400">Max</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{max.toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * EII Metric Breakdown Component
 * Shows individual metric scores
 */
interface EIIBreakdownProps {
  metrics: {
    security: number;
    accessibility: number;
    transparency: number;
    compliance: number;
  };
}

export function EIIBreakdown({ metrics }: EIIBreakdownProps) {
  const metricData = [
    { name: 'Security', value: metrics.security, color: 'bg-blue-500' },
    { name: 'Accessibility', value: metrics.accessibility, color: 'bg-green-500' },
    { name: 'Transparency', value: metrics.transparency, color: 'bg-purple-500' },
    { name: 'Compliance', value: metrics.compliance, color: 'bg-orange-500' },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        EII Metric Breakdown
      </h3>
      <div className="space-y-4">
        {metricData.map((metric) => (
          <div key={metric.name}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {metric.name}
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {metric.value.toFixed(1)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={`h-full ${metric.color} transition-all duration-500`}
                style={{ width: `${metric.value}%` }}
                role="progressbar"
                aria-valuenow={metric.value}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${metric.name} score: ${metric.value}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
