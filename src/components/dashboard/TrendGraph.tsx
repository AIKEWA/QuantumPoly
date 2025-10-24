'use client';

import { useTranslations } from 'next-intl';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface HistoryEntry {
  timestamp: string;
  commit: string;
  eii: number;
  metrics: {
    seo: number;
    a11y: number;
    performance: number;
    bundle: number;
  };
}

interface TrendGraphProps {
  history: HistoryEntry[];
}

/**
 * TrendGraph Component
 *
 * Displays time-series visualization of EII and individual metrics
 * over CI runs. Shows historical progression and trends.
 */
export function TrendGraph({ history }: TrendGraphProps) {
  const t = useTranslations('dashboard.trend');

  if (!history || history.length === 0) {
    return (
      <div className="trend-graph rounded-lg border border-gray-200 bg-white p-8 text-center">
        <h3 className="mb-4 text-xl font-semibold text-gray-900">{t('title')}</h3>
        <p className="text-gray-600">{t('noData')}</p>
      </div>
    );
  }

  // Format data for chart
  const chartData = history.map((entry) => ({
    date: new Date(entry.timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
    fullDate: entry.timestamp,
    commit: entry.commit,
    EII: entry.eii,
    SEO: entry.metrics.seo,
    A11y: entry.metrics.a11y,
    Performance: entry.metrics.performance,
    Bundle: entry.metrics.bundle,
  }));

  // Custom tooltip
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      payload: { fullDate: string; commit: string };
      name: string;
      value: number;
      color: string;
    }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
          <p className="mb-2 text-sm font-medium text-gray-900">
            {new Date(data.fullDate).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <p className="mb-2 text-xs text-gray-600">
            Commit: <code className="font-mono">{data.commit}</code>
          </p>
          {payload.map((entry) => (
            <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}:</span> {entry.value.toFixed(1)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="trend-graph rounded-lg border border-gray-200 bg-white p-8">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900">{t('title')}</h3>
        <p className="mt-2 text-sm text-gray-600">{t('description')}</p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{ value: t('xAxis'), position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{
              value: t('yAxis'),
              angle: -90,
              position: 'insideLeft',
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="line" />
          <Line
            type="monotone"
            dataKey="EII"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="SEO"
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <Line
            type="monotone"
            dataKey="A11y"
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <Line
            type="monotone"
            dataKey="Performance"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <Line
            type="monotone"
            dataKey="Bundle"
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-6 text-center text-sm text-gray-600">
        <p>
          Showing {chartData.length} data points from{' '}
          {new Date(history[0].timestamp).toLocaleDateString()} to{' '}
          {new Date(history[history.length - 1].timestamp).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
