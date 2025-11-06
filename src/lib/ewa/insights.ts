/**
 * @fileoverview Ethical Insight Generation
 * @module lib/ewa/insights
 * @see BLOCK9.5_ETHICAL_AUTONOMY.md
 *
 * Generates structured ethical insights from analysis results
 */

import crypto from 'crypto';

import {
  calculateSeverityScore,
  requiresHumanReview,
  calculateConfidence,
} from './engine/severity';
import {
  detectEIIDecline,
  detectConsentVolatility,
  detectSecurityConcern,
} from './engine/statistics';
import type {
  EthicalInsight,
  StatisticalAnalysis,
  MLAnalysis,
} from './types';

/**
 * Generate a short unique ID
 * @returns 8-character hex string
 */
function generateShortId(): string {
  return crypto.randomBytes(4).toString('hex');
}

/**
 * Generate insights from analysis results
 * @param statistical Statistical analysis
 * @param ml Optional ML analysis
 * @returns Array of ethical insights
 */
export function generateInsights(
  statistical: StatisticalAnalysis,
  ml?: MLAnalysis
): EthicalInsight[] {
  const insights: EthicalInsight[] = [];
  const timestamp = new Date().toISOString();

  // Calculate overall severity
  const severityResult = calculateSeverityScore(statistical);

  // Insight 1: EII Trend Analysis
  if (detectEIIDecline(statistical.eii_analysis.delta_30d, statistical.eii_analysis.delta_90d)) {
    insights.push({
      timestamp,
      insight_id: `eii-decline-${generateShortId()}`,
      severity: severityResult.level,
      severity_score: severityResult.score,
      description: `EII dropped ${Math.abs(statistical.eii_analysis.delta_30d).toFixed(1)}% in the last 30 days`,
      recommended_action:
        'Review consent flow friction, accessibility notices, and transparency documentation. Consider user feedback analysis.',
      confidence: calculateConfidence(
        30,
        statistical.eii_analysis.current > 0 ? 90 : 30
      ),
      evidence: {
        eii_current: statistical.eii_analysis.current,
        eii_delta_30d: statistical.eii_analysis.delta_30d,
        eii_delta_90d: statistical.eii_analysis.delta_90d,
        volatility: statistical.eii_analysis.volatility,
      },
      source: ml ? 'hybrid' : 'statistical',
      requires_human_review: requiresHumanReview(severityResult.score),
    });
  }

  // Insight 2: Consent Volatility
  if (
    detectConsentVolatility(
      statistical.consent_analysis.withdrawal_rate,
      statistical.consent_analysis.volatility
    )
  ) {
    insights.push({
      timestamp,
      insight_id: `consent-volatility-${generateShortId()}`,
      severity: severityResult.level,
      severity_score: severityResult.score,
      description: `Consent withdrawal rate elevated at ${statistical.consent_analysis.withdrawal_rate.toFixed(1)}%`,
      recommended_action:
        'Investigate consent banner clarity, review privacy policy accessibility, and analyze user feedback on data practices.',
      confidence: calculateConfidence(
        statistical.consent_analysis.total_users,
        90
      ),
      evidence: {
        total_users: statistical.consent_analysis.total_users,
        withdrawal_rate: statistical.consent_analysis.withdrawal_rate,
        category_shifts: statistical.consent_analysis.category_shifts,
        volatility: statistical.consent_analysis.volatility,
      },
      source: ml ? 'hybrid' : 'statistical',
      requires_human_review: requiresHumanReview(severityResult.score),
    });
  }

  // Insight 3: Security Concerns
  if (
    detectSecurityConcern(
      statistical.security_analysis.anomalies_detected,
      statistical.security_analysis.trend
    )
  ) {
    insights.push({
      timestamp,
      insight_id: `security-concern-${generateShortId()}`,
      severity: severityResult.level,
      severity_score: severityResult.score,
      description: `${statistical.security_analysis.anomalies_detected} security anomalies detected in recent governance entries`,
      recommended_action:
        'Review ledger integrity, verify cryptographic signatures, and ensure all governance entries are properly signed.',
      confidence: 0.95,
      evidence: {
        anomalies_detected: statistical.security_analysis.anomalies_detected,
        current_score: statistical.security_analysis.current_score,
        trend: statistical.security_analysis.trend,
      },
      source: ml ? 'hybrid' : 'statistical',
      requires_human_review: requiresHumanReview(severityResult.score),
    });
  }

  // ML-enhanced insights
  if (ml) {
    // Add ML anomaly insights
    for (const anomaly of ml.anomalies) {
      if (anomaly.score > 0.5) {
        insights.push({
          timestamp,
          insight_id: `ml-anomaly-${generateShortId()}`,
          severity: anomaly.score > 0.7 ? 'critical' : 'moderate',
          severity_score: anomaly.score,
          description: `ML-detected anomaly: ${anomaly.explanation}`,
          recommended_action: `Investigate ${anomaly.metric} for unusual patterns or data quality issues`,
          confidence: anomaly.score,
          evidence: {
            metric: anomaly.metric,
            ml_score: anomaly.score,
            explanation: anomaly.explanation,
          },
          source: 'ml',
          requires_human_review: requiresHumanReview(anomaly.score),
        });
      }
    }

    // Add ML pattern insights
    for (const pattern of ml.patterns) {
      if (pattern.significance > 0.7) {
        insights.push({
          timestamp,
          insight_id: `ml-pattern-${generateShortId()}`,
          severity: pattern.significance > 0.8 ? 'moderate' : 'low',
          severity_score: pattern.significance,
          description: `Pattern detected: ${pattern.description}`,
          recommended_action: 'Monitor this pattern and consider proactive mitigation strategies',
          confidence: pattern.significance,
          evidence: {
            pattern_id: pattern.pattern_id,
            significance: pattern.significance,
          },
          source: 'ml',
          requires_human_review: requiresHumanReview(pattern.significance),
        });
      }
    }
  }

  // If no specific issues detected, generate a positive insight
  if (insights.length === 0) {
    insights.push({
      timestamp,
      insight_id: `status-normal-${generateShortId()}`,
      severity: 'low',
      severity_score: 0.1,
      description: 'All governance metrics within normal ranges',
      recommended_action: 'Continue monitoring. No immediate action required.',
      confidence: 0.9,
      evidence: {
        eii_current: statistical.eii_analysis.current,
        eii_trend: statistical.eii_analysis.trend,
        security_status: statistical.security_analysis.trend,
      },
      source: ml ? 'hybrid' : 'statistical',
      requires_human_review: false,
    });
  }

  return insights;
}

/**
 * Filter insights by severity
 * @param insights Array of insights
 * @param minSeverity Minimum severity level
 * @returns Filtered insights
 */
export function filterInsightsBySeverity(
  insights: EthicalInsight[],
  minSeverity: 'low' | 'moderate' | 'critical'
): EthicalInsight[] {
  const severityOrder = { low: 0, moderate: 1, critical: 2 };
  const minLevel = severityOrder[minSeverity];

  return insights.filter(
    (insight) => severityOrder[insight.severity] >= minLevel
  );
}

/**
 * Get insights requiring human review
 * @param insights Array of insights
 * @returns Insights requiring review
 */
export function getInsightsRequiringReview(
  insights: EthicalInsight[]
): EthicalInsight[] {
  return insights.filter((insight) => insight.requires_human_review);
}

/**
 * Sort insights by severity and confidence
 * @param insights Array of insights
 * @returns Sorted insights (highest priority first)
 */
export function sortInsightsByPriority(
  insights: EthicalInsight[]
): EthicalInsight[] {
  return [...insights].sort((a, b) => {
    // First sort by severity
    const severityOrder = { critical: 3, moderate: 2, low: 1 };
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
    if (severityDiff !== 0) return severityDiff;

    // Then by confidence
    return b.confidence - a.confidence;
  });
}

