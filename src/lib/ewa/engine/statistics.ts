/**
 * @fileoverview Statistical Analysis Engine
 * @module lib/ewa/engine/statistics
 * @see BLOCK9.5_ETHICAL_AUTONOMY.md
 *
 * Rule-based heuristic analysis of governance data
 * Analyzes EII trends, consent stability, and security posture
 */

import { aggregateConsentMetrics } from '@/lib/governance/consent-aggregator';
import { getEIIHistory } from '@/lib/governance/eii-calculator';
import { parseLedger } from '@/lib/governance/ledger-parser';

import type { StatisticalAnalysis } from '../types';

/**
 * Perform statistical analysis on governance data
 * @param governanceLedgerPath Path to governance ledger
 * @param consentLedgerPath Path to consent ledger
 * @returns Statistical analysis result
 */
export function performStatisticalAnalysis(
  governanceLedgerPath: string = 'governance/ledger/ledger.jsonl',
  consentLedgerPath: string = 'governance/consent/ledger.jsonl'
): StatisticalAnalysis {
  // EII Analysis
  const eiiHistory = getEIIHistory(governanceLedgerPath, 90);
  // eiiBreakdown available for future detailed analysis
  // const eiiBreakdown = getEIIBreakdown(governanceLedgerPath);

  const currentEII = eiiHistory.current;
  const dataPoints = eiiHistory.dataPoints;

  // Calculate 30-day and 90-day deltas
  let delta30d = 0;
  let delta90d = 0;

  if (dataPoints.length >= 2) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Find closest data points
    const recent30 = dataPoints.find(
      (dp) => new Date(dp.date) <= thirtyDaysAgo
    );
    const recent90 = dataPoints.find(
      (dp) => new Date(dp.date) <= ninetyDaysAgo
    );

    if (recent30) {
      delta30d = currentEII - recent30.eii;
    }
    if (recent90) {
      delta90d = currentEII - recent90.eii;
    }
  }

  // Calculate volatility (standard deviation of recent EII values)
  const recentEII = dataPoints.slice(-30).map((dp) => dp.eii);
  const eiiVolatility = calculateStandardDeviation(recentEII);

  // Consent Analysis
  const consentMetrics = aggregateConsentMetrics(consentLedgerPath);

  const totalUsers = consentMetrics.totalUsers || 1; // Avoid division by zero
  const withdrawalRate =
    totalUsers > 0 ? (consentMetrics.consentRevoked / totalUsers) * 100 : 0;

  // Calculate category shifts (change in opt-in rates)
  const categoryShifts = {
    analytics: consentMetrics.categoryMetrics.analytics.rate,
    performance: consentMetrics.categoryMetrics.performance.rate,
  };

  // Consent volatility (variance in daily consent events)
  const dailyEvents = consentMetrics.timeSeriesData.map(
    (ts) => ts.consentGiven + ts.consentRevoked + ts.consentUpdated
  );
  const consentVolatility = calculateStandardDeviation(dailyEvents);

  // Security Analysis
  const ledgerEntries = parseLedger(governanceLedgerPath);
  const latestEntry = ledgerEntries[ledgerEntries.length - 1];

  // Extract security score from latest ledger entry
  let securityScore = 88; // Default from baseline
  if (latestEntry && 'metrics' in latestEntry) {
    const metrics = latestEntry.metrics as any;
    securityScore = metrics.security || 88;
  }

  // Detect anomalies (simple heuristic: check for missing signatures, hash mismatches)
  let anomaliesDetected = 0;
  for (const entry of ledgerEntries.slice(-10)) {
    // Check last 10 entries
    if (!entry.signature) anomaliesDetected++; // Unsigned entries
    if (!entry.hash || !/^[0-9a-f]{64}$/.test(entry.hash)) anomaliesDetected++;
  }

  // Security trend
  let securityTrend: 'improving' | 'stable' | 'declining' = 'stable';
  if (anomaliesDetected === 0) securityTrend = 'improving';
  if (anomaliesDetected > 3) securityTrend = 'declining';

  return {
    eii_analysis: {
      current: currentEII,
      delta_30d: delta30d,
      delta_90d: delta90d,
      volatility: eiiVolatility,
      trend: eiiHistory.trend,
    },
    consent_analysis: {
      total_users: totalUsers,
      withdrawal_rate: withdrawalRate,
      category_shifts: categoryShifts,
      volatility: consentVolatility,
    },
    security_analysis: {
      current_score: securityScore,
      anomalies_detected: anomaliesDetected,
      trend: securityTrend,
    },
  };
}

/**
 * Calculate standard deviation
 * @param values Array of numbers
 * @returns Standard deviation
 */
function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
  const variance =
    squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;

  return Math.sqrt(variance);
}

/**
 * Detect EII decline pattern
 * @param delta30d 30-day EII delta
 * @param delta90d 90-day EII delta
 * @returns True if decline pattern detected
 */
export function detectEIIDecline(delta30d: number, delta90d: number): boolean {
  return delta30d < -3 || delta90d < -5;
}

/**
 * Detect consent volatility spike
 * @param withdrawalRate Current withdrawal rate
 * @param volatility Consent event volatility
 * @returns True if volatility spike detected
 */
export function detectConsentVolatility(
  withdrawalRate: number,
  volatility: number
): boolean {
  return withdrawalRate > 10 || volatility > 5;
}

/**
 * Detect security anomalies
 * @param anomaliesDetected Number of anomalies
 * @param trend Security trend
 * @returns True if security concern detected
 */
export function detectSecurityConcern(
  anomaliesDetected: number,
  trend: 'improving' | 'stable' | 'declining'
): boolean {
  return anomaliesDetected > 2 || trend === 'declining';
}

