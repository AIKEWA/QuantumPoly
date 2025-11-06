/**
 * @fileoverview Ethical Insights Feed Component
 * @module components/dashboard/InsightsFeed
 * @see BLOCK9.5_ETHICAL_AUTONOMY.md
 *
 * Displays ethical insights from EWA v2 with severity indicators
 */

'use client';

import React from 'react';

import type { EthicalInsight } from '@/lib/ewa/types';

interface InsightsFeedProps {
  insights: EthicalInsight[];
  maxInsights?: number;
}

export function InsightsFeed({
  insights,
  maxInsights = 10,
}: InsightsFeedProps) {
  const displayInsights = insights.slice(0, maxInsights);

  // Severity styling
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-800 dark:text-red-300',
          badge: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
          icon: '⚠️',
        };
      case 'moderate':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-800 dark:text-yellow-300',
          badge:
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
          icon: '⚠',
        };
      case 'low':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-800 dark:text-green-300',
          badge:
            'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
          icon: '✓',
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-700',
          text: 'text-gray-800 dark:text-gray-300',
          badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300',
          icon: 'ℹ',
        };
    }
  };

  if (displayInsights.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Ethical Insights Feed
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No insights available. Run analysis to generate insights.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Ethical Insights Feed
      </h3>

      <div className="space-y-4">
        {displayInsights.map((insight) => {
          const style = getSeverityStyle(insight.severity);

          return (
            <div
              key={insight.insight_id}
              className={`rounded-lg border p-4 ${style.bg} ${style.border}`}
            >
              {/* Header */}
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{style.icon}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${style.badge}`}
                  >
                    {insight.severity.toUpperCase()}
                  </span>
                  {insight.requires_human_review && (
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                      REVIEW REQUIRED
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(insight.timestamp).toLocaleDateString()}
                </span>
              </div>

              {/* Description */}
              <p className={`mb-2 text-sm font-medium ${style.text}`}>
                {insight.description}
              </p>

              {/* Recommended Action */}
              <div className="mb-2 rounded bg-white/50 p-2 text-xs dark:bg-gray-800/50">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Recommended Action:
                </span>{' '}
                <span className="text-gray-600 dark:text-gray-400">
                  {insight.recommended_action}
                </span>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                <span>
                  Confidence: {(insight.confidence * 100).toFixed(0)}%
                </span>
                <span>Source: {insight.source}</span>
                <span className="font-mono text-xs">
                  ID: {insight.insight_id}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {insights.length > maxInsights && (
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Showing {maxInsights} of {insights.length} insights
        </div>
      )}
    </div>
  );
}

