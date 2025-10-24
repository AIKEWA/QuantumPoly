'use client';

import { useTranslations } from 'next-intl';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

interface EthicalScorecardProps {
  eii: number;
  metrics: {
    seo: number;
    a11y: number;
    performance: number;
    bundle: number;
  };
  tags?: string[];
  timestamp?: string;
  commit?: string;
}

/**
 * EthicalScorecard Component
 *
 * Displays the comprehensive ethical scorecard with:
 * - EII badge (gold/silver/bronze/amber)
 * - Radial chart showing 4 metric axes
 * - Qualitative compliance tags
 * - Metadata (timestamp, commit)
 */
export function EthicalScorecard({
  eii,
  metrics,
  tags = [],
  timestamp,
  commit,
}: EthicalScorecardProps) {
  const t = useTranslations('dashboard');

  type TierType = 'gold' | 'silver' | 'bronze' | 'amber';

  // Determine EII tier
  const getEIITier = (eii: number): { tier: TierType; icon: string; label: string } => {
    if (eii >= 95) return { tier: 'gold', icon: '🥇', label: t('badges.gold') };
    if (eii >= 90) return { tier: 'silver', icon: '🥈', label: t('badges.silver') };
    if (eii >= 75) return { tier: 'bronze', icon: '🥉', label: t('badges.bronze') };
    return { tier: 'amber', icon: '⚠️', label: t('badges.amber') };
  };

  const tierInfo = getEIITier(eii);

  // Prepare data for radar chart
  const chartData = [
    { category: t('categories.seo'), value: metrics.seo, fullMark: 100 },
    { category: t('categories.a11y'), value: metrics.a11y, fullMark: 100 },
    { category: t('categories.performance'), value: metrics.performance, fullMark: 100 },
    { category: t('categories.bundle'), value: metrics.bundle, fullMark: 100 },
  ];

  const tierColors: Record<TierType, string> = {
    gold: 'border-green-500 bg-green-50',
    silver: 'border-blue-500 bg-blue-50',
    bronze: 'border-yellow-500 bg-yellow-50',
    amber: 'border-orange-500 bg-orange-50',
  };

  return (
    <div className="ethical-scorecard rounded-xl border-2 border-gray-200 bg-white p-8 shadow-lg">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="mb-2 text-3xl font-bold text-gray-900">{t('title')}</h2>
        <p className="text-gray-600">{t('subtitle')}</p>
      </div>

      {/* EII Badge */}
      <div
        className={`eii-badge mx-auto mb-8 flex max-w-md items-center justify-between rounded-lg border-4 ${tierColors[tierInfo.tier]} p-6`}
      >
        <div className="flex items-center gap-4">
          <span className="text-5xl" role="img" aria-label={tierInfo.label}>
            {tierInfo.icon}
          </span>
          <div>
            <div className="text-sm font-medium uppercase text-gray-600">{t('eii')}</div>
            <div className="text-4xl font-bold text-gray-900">{eii.toFixed(1)}</div>
            <div className="text-sm text-gray-600">{tierInfo.label}</div>
          </div>
        </div>
      </div>

      {/* Radial Chart */}
      <div className="mb-8">
        <h3 className="mb-4 text-center text-lg font-semibold text-gray-900">
          Metric Distribution
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={chartData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="category" tick={{ fill: '#374151', fontSize: 14 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Individual Scores */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
            <div className="mb-1 text-xs font-medium uppercase text-gray-600">
              {t(`categories.${key}`)}
            </div>
            <div
              className={`text-2xl font-bold ${
                value >= 90 ? 'text-green-600' : value >= 75 ? 'text-yellow-600' : 'text-orange-600'
              }`}
            >
              {value}
            </div>
            <div className="text-xs text-gray-500">/ 100</div>
          </div>
        ))}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-semibold text-gray-700">Compliance Tags</h4>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      {(timestamp || commit) && (
        <div className="border-t border-gray-200 pt-4 text-sm text-gray-600">
          <div className="flex flex-wrap gap-4">
            {timestamp && (
              <div>
                <span className="font-medium">{t('metadata.timestamp')}:</span>{' '}
                {new Date(timestamp).toLocaleString()}
              </div>
            )}
            {commit && (
              <div>
                <span className="font-medium">{t('metadata.commit')}:</span>{' '}
                <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs">{commit}</code>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
