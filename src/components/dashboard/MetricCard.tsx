'use client';

import { useTranslations } from 'next-intl';

import { ExplainabilityTooltip } from './ExplainabilityTooltip';

interface MetricCardProps {
  category: 'seo' | 'a11y' | 'performance' | 'bundle';
  score: number;
  hash?: string;
  source?: string;
}

/**
 * MetricCard Component
 *
 * Displays individual ethical metric with score visualization,
 * category description, and explainability tooltip.
 */
export function MetricCard({ category, score, hash, source }: MetricCardProps) {
  const t = useTranslations('dashboard');

  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 75) return 'bg-yellow-100';
    return 'bg-orange-100';
  };

  const scoreColor = getScoreColor(score);
  const scoreBackground = getScoreBackground(score);

  // Calculate gauge fill percentage
  const gaugeFill = score;

  return (
    <div className="metric-card rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{t(`categories.${category}`)}</h3>
          <p className="mt-1 text-sm text-gray-600">{t(`categoryDescriptions.${category}`)}</p>
        </div>

        {/* Score Badge */}
        <div
          className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full ${scoreBackground}`}
          role="img"
          aria-label={`${t(`categories.${category}`)} score: ${score} out of 100`}
        >
          <span className={`text-2xl font-bold ${scoreColor}`}>{score}</span>
        </div>
      </div>

      {/* Gauge Visualization */}
      <div className="mb-4">
        <div
          className="gauge-container h-3 overflow-hidden rounded-full bg-gray-200"
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${t(`categories.${category}`)} progress`}
        >
          <div
            className={`gauge-fill h-full transition-all duration-500 ${
              score >= 90 ? 'bg-green-500' : score >= 75 ? 'bg-yellow-500' : 'bg-orange-500'
            }`}
            style={{ width: `${gaugeFill}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      {/* Metadata */}
      {(hash || source) && (
        <div className="mb-4 rounded bg-gray-50 p-3">
          {source && (
            <div className="mb-1 text-xs text-gray-600">
              <span className="font-medium">Source:</span> {source}
            </div>
          )}
          {hash && (
            <div className="text-xs text-gray-600">
              <span className="font-medium">Hash:</span>{' '}
              <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs">
                {hash.substring(0, 16)}...
              </code>
            </div>
          )}
        </div>
      )}

      {/* Explainability */}
      <ExplainabilityTooltip metric={category} />
    </div>
  );
}
