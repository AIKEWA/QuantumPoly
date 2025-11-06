/**
 * @fileoverview Optional ML Analysis Layer
 * @module lib/ewa/engine/ml
 * @see BLOCK9.5_ETHICAL_AUTONOMY.md
 *
 * Machine learning-based anomaly detection and forecasting
 * Activated via EWA_ML=true environment variable
 * Advisory only — all outputs must be explainable
 */

import type { MLAnalysis, StatisticalAnalysis } from '../types';

/**
 * Check if ML layer is enabled
 * @returns True if ML analysis should be performed
 */
export function isMLEnabled(): boolean {
  return process.env.EWA_ML === 'true' || process.env.NEXT_PUBLIC_EWA_ML === 'true';
}

/**
 * Perform ML-based analysis (optional layer)
 * @param statistical Statistical analysis result
 * @returns ML analysis result or null if disabled
 */
export function performMLAnalysis(
  statistical: StatisticalAnalysis
): MLAnalysis | null {
  if (!isMLEnabled()) {
    return null;
  }

  // Simple anomaly detection using statistical thresholds
  // In production, this could use Isolation Forest or similar algorithms
  const anomalies = detectAnomalies(statistical);

  // Simple forecasting using linear trend
  // In production, this could use Prophet or ARIMA
  const forecast = forecastEII(statistical);

  // Pattern detection using rule-based heuristics
  // In production, this could use clustering or sequence mining
  const patterns = detectPatterns(statistical);

  return {
    anomalies,
    forecast,
    patterns,
  };
}

/**
 * Detect anomalies in governance metrics
 * @param statistical Statistical analysis
 * @returns Detected anomalies
 */
function detectAnomalies(statistical: StatisticalAnalysis): Array<{
  metric: string;
  score: number;
  explanation: string;
}> {
  const anomalies: Array<{
    metric: string;
    score: number;
    explanation: string;
  }> = [];

  // EII volatility anomaly
  if (statistical.eii_analysis.volatility > 5) {
    anomalies.push({
      metric: 'eii_volatility',
      score: Math.min(statistical.eii_analysis.volatility / 10, 1),
      explanation: `EII volatility (${statistical.eii_analysis.volatility.toFixed(2)}) exceeds normal range (0-5)`,
    });
  }

  // Consent withdrawal spike
  if (statistical.consent_analysis.withdrawal_rate > 15) {
    anomalies.push({
      metric: 'consent_withdrawal',
      score: Math.min(statistical.consent_analysis.withdrawal_rate / 50, 1),
      explanation: `Consent withdrawal rate (${statistical.consent_analysis.withdrawal_rate.toFixed(1)}%) significantly elevated`,
    });
  }

  // Security anomaly cluster
  if (statistical.security_analysis.anomalies_detected > 5) {
    anomalies.push({
      metric: 'security_anomalies',
      score: Math.min(statistical.security_analysis.anomalies_detected / 10, 1),
      explanation: `${statistical.security_analysis.anomalies_detected} security anomalies detected in recent entries`,
    });
  }

  return anomalies;
}

/**
 * Forecast EII for next 30 days using linear trend
 * @param statistical Statistical analysis
 * @returns Forecast result
 */
function forecastEII(statistical: StatisticalAnalysis): {
  eii_30d: number;
  confidence: number;
} {
  const current = statistical.eii_analysis.current;
  const delta30d = statistical.eii_analysis.delta_30d;

  // Simple linear extrapolation
  const forecast = current + delta30d;

  // Confidence based on trend stability
  const volatility = statistical.eii_analysis.volatility;
  const confidence = Math.max(0, 1 - volatility / 10);

  return {
    eii_30d: Math.max(0, Math.min(100, forecast)),
    confidence,
  };
}

/**
 * Detect patterns in governance data
 * @param statistical Statistical analysis
 * @returns Detected patterns
 */
function detectPatterns(statistical: StatisticalAnalysis): Array<{
  pattern_id: string;
  description: string;
  significance: number;
}> {
  const patterns: Array<{
    pattern_id: string;
    description: string;
    significance: number;
  }> = [];

  // Pattern: Sustained EII decline
  if (
    statistical.eii_analysis.delta_30d < -2 &&
    statistical.eii_analysis.delta_90d < -3
  ) {
    patterns.push({
      pattern_id: 'sustained_eii_decline',
      description: 'EII shows sustained decline over 30 and 90 day periods',
      significance: 0.8,
    });
  }

  // Pattern: Consent category divergence
  const analyticsRate = statistical.consent_analysis.category_shifts.analytics || 0;
  const performanceRate = statistical.consent_analysis.category_shifts.performance || 0;
  const divergence = Math.abs(analyticsRate - performanceRate);

  if (divergence > 20) {
    patterns.push({
      pattern_id: 'consent_category_divergence',
      description: `Analytics (${analyticsRate.toFixed(1)}%) and Performance (${performanceRate.toFixed(1)}%) consent rates diverging`,
      significance: 0.6,
    });
  }

  // Pattern: Security degradation
  if (
    statistical.security_analysis.trend === 'declining' &&
    statistical.security_analysis.anomalies_detected > 3
  ) {
    patterns.push({
      pattern_id: 'security_degradation',
      description: 'Security metrics showing degradation with multiple anomalies',
      significance: 0.9,
    });
  }

  return patterns;
}

/**
 * Generate ML-based explanation for insight
 * @param mlAnalysis ML analysis result
 * @returns Human-readable explanation
 */
export function generateMLExplanation(mlAnalysis: MLAnalysis): string {
  const explanations: string[] = [];

  if (mlAnalysis.anomalies.length > 0) {
    explanations.push(
      `Detected ${mlAnalysis.anomalies.length} anomalies in governance metrics`
    );
  }

  if (mlAnalysis.forecast.confidence > 0.7) {
    explanations.push(
      `High-confidence forecast: EII projected at ${mlAnalysis.forecast.eii_30d.toFixed(1)} in 30 days`
    );
  }

  if (mlAnalysis.patterns.length > 0) {
    const significantPatterns = mlAnalysis.patterns.filter((p) => p.significance > 0.7);
    if (significantPatterns.length > 0) {
      explanations.push(
        `Significant patterns: ${significantPatterns.map((p) => p.pattern_id).join(', ')}`
      );
    }
  }

  return explanations.join('; ') || 'No significant ML findings';
}

