/**
 * @fileoverview Multi-Factor Severity Scoring Engine
 * @module lib/ewa/engine/severity
 * @see BLOCK9.5_ETHICAL_AUTONOMY.md
 *
 * Calculates ethical risk severity using multi-factor composite scoring
 * Formula: (ΔEII_norm + consent_drop_norm + security_anomaly) / 3
 */

import type { SeverityLevel, StatisticalAnalysis } from '../types';

/**
 * Severity thresholds (0-1 scale)
 */
export const SEVERITY_THRESHOLDS = {
  LOW: 0.3,
  MODERATE: 0.6,
  CRITICAL: 1.0,
} as const;

/**
 * Normalization bounds for metrics
 */
const NORMALIZATION_BOUNDS = {
  eii_delta: { min: -10, max: 0 }, // EII drops (negative values)
  consent_drop: { min: 0, max: 50 }, // Withdrawal rate percentage
  security_anomaly: { min: 0, max: 10 }, // Number of anomalies
} as const;

/**
 * Normalize a value to 0-1 range
 * @param value Raw value
 * @param min Minimum bound
 * @param max Maximum bound
 * @returns Normalized value (0-1)
 */
function normalize(value: number, min: number, max: number): number {
  if (value <= min) return 0;
  if (value >= max) return 1;
  return (value - min) / (max - min);
}

/**
 * Calculate multi-factor severity score
 * @param analysis Statistical analysis result
 * @returns Severity score (0-1) and breakdown
 */
export function calculateSeverityScore(analysis: StatisticalAnalysis): {
  score: number;
  level: SeverityLevel;
  breakdown: {
    eii_component: number;
    consent_component: number;
    security_component: number;
  };
  explanation: string;
} {
  // Component 1: EII Delta (30-day)
  // Negative deltas indicate decline → higher severity
  const eiiDelta = analysis.eii_analysis.delta_30d;
  const eiiComponent = normalize(
    Math.abs(Math.min(eiiDelta, 0)), // Only consider drops
    Math.abs(NORMALIZATION_BOUNDS.eii_delta.min),
    Math.abs(NORMALIZATION_BOUNDS.eii_delta.max)
  );

  // Component 2: Consent Withdrawal Rate
  const consentDrop = analysis.consent_analysis.withdrawal_rate;
  const consentComponent = normalize(
    consentDrop,
    NORMALIZATION_BOUNDS.consent_drop.min,
    NORMALIZATION_BOUNDS.consent_drop.max
  );

  // Component 3: Security Anomalies
  const securityAnomalies = analysis.security_analysis.anomalies_detected;
  const securityComponent = normalize(
    securityAnomalies,
    NORMALIZATION_BOUNDS.security_anomaly.min,
    NORMALIZATION_BOUNDS.security_anomaly.max
  );

  // Composite score (equal weighting)
  const score = (eiiComponent + consentComponent + securityComponent) / 3;

  // Map to severity level
  let level: SeverityLevel;
  if (score < SEVERITY_THRESHOLDS.LOW) {
    level = 'low';
  } else if (score < SEVERITY_THRESHOLDS.MODERATE) {
    level = 'moderate';
  } else {
    level = 'critical';
  }

  // Generate explanation
  const components: string[] = [];
  if (eiiComponent > 0.3) {
    components.push(`EII declined ${Math.abs(eiiDelta).toFixed(1)}% in 30 days`);
  }
  if (consentComponent > 0.3) {
    components.push(`consent withdrawal rate at ${consentDrop.toFixed(1)}%`);
  }
  if (securityComponent > 0.3) {
    components.push(`${securityAnomalies} security anomalies detected`);
  }

  const explanation =
    components.length > 0
      ? `Severity driven by: ${components.join('; ')}`
      : 'All metrics within normal ranges';

  return {
    score,
    level,
    breakdown: {
      eii_component: eiiComponent,
      consent_component: consentComponent,
      security_component: securityComponent,
    },
    explanation,
  };
}

/**
 * Determine if insight requires human review
 * @param severityScore Severity score (0-1)
 * @returns True if human review required
 */
export function requiresHumanReview(severityScore: number): boolean {
  return severityScore > SEVERITY_THRESHOLDS.MODERATE;
}

/**
 * Calculate confidence score based on data quality
 * @param dataPoints Number of data points available
 * @param timeSpan Time span covered (days)
 * @returns Confidence score (0-1)
 */
export function calculateConfidence(dataPoints: number, timeSpan: number): number {
  // Confidence increases with more data points and longer time span
  const dataQuality = Math.min(dataPoints / 30, 1); // Ideal: 30+ data points
  const timeQuality = Math.min(timeSpan / 90, 1); // Ideal: 90+ days

  return (dataQuality + timeQuality) / 2;
}

/**
 * Format severity for display
 * @param level Severity level
 * @returns Display properties
 */
export function formatSeverity(level: SeverityLevel): {
  label: string;
  color: string;
  icon: string;
} {
  switch (level) {
    case 'low':
      return { label: 'Low Risk', color: 'green', icon: '✓' };
    case 'moderate':
      return { label: 'Moderate Risk', color: 'yellow', icon: '⚠' };
    case 'critical':
      return { label: 'Critical Risk', color: 'red', icon: '⚠️' };
  }
}

