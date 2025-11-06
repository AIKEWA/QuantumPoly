/**
 * @fileoverview Trust Trajectory Indicator Gauge Component
 * @module components/dashboard/TrustTrajectoryGauge
 * @see BLOCK9.5_ETHICAL_AUTONOMY.md
 *
 * Visual gauge display for Trust Trajectory Indicator (TTI)
 */

'use client';

import React from 'react';

import type { TrustTrajectory } from '@/lib/ewa/types';

interface TrustTrajectoryGaugeProps {
  trajectory: TrustTrajectory;
}

export function TrustTrajectoryGauge({ trajectory }: TrustTrajectoryGaugeProps) {
  const { tti_score, trend, components } = trajectory;

  // Determine color based on score
  let color = 'text-red-600 dark:text-red-400';
  let label = 'Needs Improvement';

  if (tti_score >= 90) {
    color = 'text-green-600 dark:text-green-400';
    label = 'Excellent';
  } else if (tti_score >= 80) {
    color = 'text-blue-600 dark:text-blue-400';
    label = 'Good';
  } else if (tti_score >= 70) {
    color = 'text-yellow-600 dark:text-yellow-400';
    label = 'Fair';
  }

  // Trend icon
  const trendIcon =
    trend === 'improving' ? '↗' : trend === 'declining' ? '↘' : '→';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Trust Trajectory Indicator
      </h3>

      {/* Gauge Display */}
      <div className="mb-6 flex items-center justify-center">
        <div className="relative h-48 w-48">
          {/* Background circle */}
          <svg className="h-full w-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${(tti_score / 100) * 251.2} 251.2`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              className={color}
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-4xl font-bold ${color}`}>{tti_score}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              / 100
            </div>
          </div>
        </div>
      </div>

      {/* Label and Trend */}
      <div className="mb-4 text-center">
        <div className={`mb-1 text-xl font-semibold ${color}`}>{label}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Trend: {trendIcon} {trend}
        </div>
      </div>

      {/* Component Breakdown */}
      <div className="space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">EII:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {components.eii.toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Consent Stability:
          </span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {components.consent_stability.toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Security Posture:
          </span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {components.security_posture.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 rounded bg-blue-50 p-3 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
        <p className="font-semibold">What is TTI?</p>
        <p className="mt-1">
          Trust Trajectory Indicator combines EII, consent stability, and
          security posture into a single composite metric (0-100).
        </p>
      </div>
    </div>
  );
}

