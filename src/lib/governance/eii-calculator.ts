/**
 * @fileoverview Ethics Integrity Index (EII) Calculator
 * @module lib/governance/eii-calculator
 * @see BLOCK9.3_TRANSPARENCY_FRAMEWORK.md
 *
 * Computes EII from governance ledger with 90-day rolling average
 * Formula: EII = (Security + Accessibility + Transparency + Compliance) / 4
 */

import { getEIIEntries, type EIIEntry } from './ledger-parser';

/**
 * EII metric weights (normalized to 100)
 */
export const EII_WEIGHTS = {
  security: 0.25,
  accessibility: 0.25,
  transparency: 0.25,
  compliance: 0.25,
};

/**
 * EII data point for visualization
 */
export interface EIIDataPoint {
  date: string;
  eii: number;
  metrics: {
    security?: number;
    accessibility?: number;
    transparency?: number;
    compliance?: number;
    privacy?: number;
    seo?: number;
    a11y?: number;
    performance?: number;
    bundle?: number;
  };
  commit: string;
}

/**
 * EII history result
 */
export interface EIIHistory {
  dataPoints: EIIDataPoint[];
  rollingAverage: Array<{ date: string; average: number }>;
  current: number;
  average: number;
  min: number;
  max: number;
  trend: 'up' | 'down' | 'stable';
}

/**
 * Calculate EII from metrics
 * @param metrics Metric values
 * @returns Calculated EII (0-100)
 */
export function calculateEII(metrics: EIIEntry['metrics']): number {
  // Map metrics to standard categories
  const security = metrics.security || 0;
  const accessibility = metrics.accessibility || metrics.a11y || 0;
  const transparency = metrics.transparency || 0;
  const compliance = metrics.privacy || 0;

  // Calculate weighted average
  const eii =
    security * EII_WEIGHTS.security +
    accessibility * EII_WEIGHTS.accessibility +
    transparency * EII_WEIGHTS.transparency +
    compliance * EII_WEIGHTS.compliance;

  return Math.round(eii * 10) / 10; // Round to 1 decimal place
}

/**
 * Get EII history from ledger
 * @param ledgerPath Path to governance ledger
 * @param days Number of days to include (default: 90)
 * @returns EII history
 */
export function getEIIHistory(
  ledgerPath: string = 'governance/ledger/ledger.jsonl',
  days: number = 90
): EIIHistory {
  const entries = getEIIEntries(ledgerPath);

  if (entries.length === 0) {
    return {
      dataPoints: [],
      rollingAverage: [],
      current: 0,
      average: 0,
      min: 0,
      max: 0,
      trend: 'stable',
    };
  }

  // Filter entries within date range
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= cutoffDate;
  });

  // Convert to data points
  const dataPoints: EIIDataPoint[] = recentEntries.map((entry) => ({
    date: entry.timestamp.split('T')[0], // Extract date
    eii: entry.eii,
    metrics: entry.metrics,
    commit: entry.commit,
  }));

  // Calculate rolling average (7-day window)
  const rollingAverage = calculateRollingAverage(dataPoints, 7);

  // Calculate statistics
  const eiiValues = dataPoints.map((dp) => dp.eii);
  const current = eiiValues[eiiValues.length - 1] || 0;
  const average = eiiValues.reduce((sum, val) => sum + val, 0) / eiiValues.length;
  const min = Math.min(...eiiValues);
  const max = Math.max(...eiiValues);

  // Determine trend
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (eiiValues.length >= 2) {
    const recentAvg = eiiValues.slice(-3).reduce((sum, val) => sum + val, 0) / 3;
    const olderAvg = eiiValues.slice(0, 3).reduce((sum, val) => sum + val, 0) / 3;
    if (recentAvg > olderAvg + 2) trend = 'up';
    else if (recentAvg < olderAvg - 2) trend = 'down';
  }

  return {
    dataPoints,
    rollingAverage,
    current,
    average: Math.round(average * 10) / 10,
    min,
    max,
    trend,
  };
}

/**
 * Calculate rolling average
 * @param dataPoints EII data points
 * @param windowSize Window size in days
 * @returns Rolling average data
 */
function calculateRollingAverage(
  dataPoints: EIIDataPoint[],
  windowSize: number
): Array<{ date: string; average: number }> {
  if (dataPoints.length < windowSize) {
    return dataPoints.map((dp) => ({ date: dp.date, average: dp.eii }));
  }

  const result: Array<{ date: string; average: number }> = [];

  for (let i = windowSize - 1; i < dataPoints.length; i++) {
    const window = dataPoints.slice(i - windowSize + 1, i + 1);
    const average = window.reduce((sum, dp) => sum + dp.eii, 0) / windowSize;
    result.push({
      date: dataPoints[i].date,
      average: Math.round(average * 10) / 10,
    });
  }

  return result;
}

/**
 * Get current EII
 * @param ledgerPath Path to governance ledger
 * @returns Current EII value
 */
export function getCurrentEII(ledgerPath: string = 'governance/ledger/ledger.jsonl'): number {
  const entries = getEIIEntries(ledgerPath);
  if (entries.length === 0) return 0;
  return entries[entries.length - 1].eii;
}

/**
 * Get EII breakdown by metric
 * @param ledgerPath Path to governance ledger
 * @returns Metric breakdown
 */
export function getEIIBreakdown(ledgerPath: string = 'governance/ledger/ledger.jsonl') {
  const entries = getEIIEntries(ledgerPath);
  if (entries.length === 0) {
    return {
      security: 0,
      accessibility: 0,
      transparency: 0,
      compliance: 0,
    };
  }

  const latest = entries[entries.length - 1];
  return {
    security: latest.metrics.security || 0,
    accessibility: latest.metrics.accessibility || latest.metrics.a11y || 0,
    transparency: latest.metrics.transparency || 0,
    compliance: latest.metrics.privacy || 0,
  };
}

/**
 * Format EII for display
 * @param eii EII value
 * @returns Formatted string with color indicator
 */
export function formatEII(eii: number): { value: string; color: string; label: string } {
  if (eii >= 90) {
    return { value: eii.toFixed(1), color: 'green', label: 'Excellent' };
  } else if (eii >= 80) {
    return { value: eii.toFixed(1), color: 'blue', label: 'Good' };
  } else if (eii >= 70) {
    return { value: eii.toFixed(1), color: 'yellow', label: 'Fair' };
  } else {
    return { value: eii.toFixed(1), color: 'red', label: 'Needs Improvement' };
  }
}

