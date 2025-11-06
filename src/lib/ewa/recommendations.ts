/**
 * @fileoverview Recommendation Generation
 * @module lib/ewa/recommendations
 * @see BLOCK9.5_ETHICAL_AUTONOMY.md
 *
 * Generates actionable recommendations from ethical insights
 */

import type { EthicalInsight, StatisticalAnalysis } from './types';

/**
 * Recommendation structure
 */
export interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: 'eii' | 'consent' | 'security' | 'transparency';
  title: string;
  description: string;
  action_items: string[];
  responsible_roles: string[];
  estimated_impact: 'high' | 'medium' | 'low';
  related_insights: string[];
}

/**
 * Generate recommendations from insights
 * @param insights Array of ethical insights
 * @param analysis Statistical analysis for context
 * @returns Array of recommendations
 */
export function generateRecommendations(
  insights: EthicalInsight[],
  analysis: StatisticalAnalysis
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Group insights by category
  const eiiInsights = insights.filter((i) => i.insight_id.startsWith('eii'));
  const consentInsights = insights.filter((i) =>
    i.insight_id.startsWith('consent')
  );
  const securityInsights = insights.filter((i) =>
    i.insight_id.startsWith('security')
  );

  // EII Recommendations
  if (eiiInsights.length > 0) {
    const criticalEII = eiiInsights.some((i) => i.severity === 'critical');
    recommendations.push({
      id: 'rec-eii-improvement',
      priority: criticalEII ? 'high' : 'medium',
      category: 'eii',
      title: 'Improve Ethics Integrity Index',
      description: `EII has declined by ${Math.abs(analysis.eii_analysis.delta_30d).toFixed(1)}% in the last 30 days. This requires immediate attention to prevent further degradation.`,
      action_items: [
        'Conduct accessibility audit of recent changes',
        'Review and update transparency documentation',
        'Verify all governance processes are properly documented',
        'Schedule stakeholder feedback session',
      ],
      responsible_roles: ['Governance Officer', 'Accessibility Lead', 'Documentation Architect'],
      estimated_impact: 'high',
      related_insights: eiiInsights.map((i) => i.insight_id),
    });
  }

  // Consent Recommendations
  if (consentInsights.length > 0) {
    const highWithdrawal = analysis.consent_analysis.withdrawal_rate > 15;
    recommendations.push({
      id: 'rec-consent-optimization',
      priority: highWithdrawal ? 'high' : 'medium',
      category: 'consent',
      title: 'Optimize Consent Management',
      description: `Consent withdrawal rate at ${analysis.consent_analysis.withdrawal_rate.toFixed(1)}% indicates user concerns about data practices.`,
      action_items: [
        'Review consent banner clarity and accessibility',
        'Simplify privacy policy language',
        'Add more granular consent categories if needed',
        'Implement consent preference dashboard improvements',
        'Analyze user feedback on data collection',
      ],
      responsible_roles: ['Compliance Steward', 'UX Designer', 'Privacy Officer'],
      estimated_impact: 'high',
      related_insights: consentInsights.map((i) => i.insight_id),
    });
  }

  // Security Recommendations
  if (securityInsights.length > 0) {
    const criticalSecurity = securityInsights.some((i) => i.severity === 'critical');
    recommendations.push({
      id: 'rec-security-hardening',
      priority: criticalSecurity ? 'high' : 'medium',
      category: 'security',
      title: 'Strengthen Security Posture',
      description: `${analysis.security_analysis.anomalies_detected} security anomalies detected in governance ledger.`,
      action_items: [
        'Review and sign all unsigned ledger entries',
        'Verify cryptographic hash integrity',
        'Implement automated signature verification in CI/CD',
        'Audit access controls for governance systems',
        'Update security documentation',
      ],
      responsible_roles: ['Security Lead', 'Governance Officer', 'DevOps Engineer'],
      estimated_impact: 'high',
      related_insights: securityInsights.map((i) => i.insight_id),
    });
  }

  // General transparency recommendation if volatility is high
  if (analysis.eii_analysis.volatility > 5) {
    recommendations.push({
      id: 'rec-transparency-stability',
      priority: 'medium',
      category: 'transparency',
      title: 'Stabilize Transparency Metrics',
      description: `High EII volatility (${analysis.eii_analysis.volatility.toFixed(2)}) suggests inconsistent governance practices.`,
      action_items: [
        'Establish regular governance review cadence',
        'Standardize documentation update procedures',
        'Implement automated metric tracking',
        'Create governance process checklists',
      ],
      responsible_roles: ['Governance Officer', 'PMO'],
      estimated_impact: 'medium',
      related_insights: [],
    });
  }

  return recommendations;
}

/**
 * Get highest priority recommendations
 * @param recommendations Array of recommendations
 * @param limit Maximum number to return
 * @returns Top priority recommendations
 */
export function getTopRecommendations(
  recommendations: Recommendation[],
  limit: number = 3
): Recommendation[] {
  const priorityOrder = { high: 3, medium: 2, low: 1 };

  return [...recommendations]
    .sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by estimated impact
      const impactOrder = { high: 3, medium: 2, low: 1 };
      return impactOrder[b.estimated_impact] - impactOrder[a.estimated_impact];
    })
    .slice(0, limit);
}

/**
 * Format recommendation for display
 * @param recommendation Recommendation
 * @returns Formatted recommendation
 */
export function formatRecommendation(recommendation: Recommendation): {
  summary: string;
  details: string;
  urgency: string;
} {
  const urgencyMap = {
    high: 'Urgent — Address within 7 days',
    medium: 'Important — Address within 30 days',
    low: 'Monitor — Address as capacity allows',
  };

  return {
    summary: `[${recommendation.priority.toUpperCase()}] ${recommendation.title}`,
    details: recommendation.description,
    urgency: urgencyMap[recommendation.priority],
  };
}

/**
 * Generate executive summary of recommendations
 * @param recommendations Array of recommendations
 * @returns Executive summary text
 */
export function generateExecutiveSummary(
  recommendations: Recommendation[]
): string {
  const highPriority = recommendations.filter((r) => r.priority === 'high');
  const mediumPriority = recommendations.filter((r) => r.priority === 'medium');

  if (highPriority.length === 0 && mediumPriority.length === 0) {
    return 'All governance metrics are within acceptable ranges. Continue current practices and maintain regular monitoring.';
  }

  const parts: string[] = [];

  if (highPriority.length > 0) {
    parts.push(
      `${highPriority.length} high-priority issue${highPriority.length > 1 ? 's' : ''} requiring immediate attention: ${highPriority.map((r) => r.title).join(', ')}.`
    );
  }

  if (mediumPriority.length > 0) {
    parts.push(
      `${mediumPriority.length} medium-priority recommendation${mediumPriority.length > 1 ? 's' : ''} for improvement: ${mediumPriority.map((r) => r.title).join(', ')}.`
    );
  }

  return parts.join(' ');
}

