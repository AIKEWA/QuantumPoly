/**
 * @fileoverview Federation Trust Calculator
 * @module lib/federation/trust-calculator
 * @see BLOCK9.6_COLLECTIVE_ETHICS_GRAPH.md
 *
 * Calculates network-level trust metrics and aggregate health indicators.
 * Implements staleness detection and trust score computation.
 */

import { NetworkTrustSummary, TrustStatus, VerificationResult } from './types';
import { computeNetworkMerkleRoot } from './verification';

/**
 * Calculate network trust summary from verification results
 */
export function calculateNetworkTrust(results: VerificationResult[]): NetworkTrustSummary {
  const timestamp = new Date().toISOString();

  // Count partners by trust status
  const validPartners = results.filter((r) => r.trust_status === TrustStatus.VALID).length;
  const stalePartners = results.filter((r) => r.trust_status === TrustStatus.STALE).length;
  const flaggedPartners = results.filter((r) => r.trust_status === TrustStatus.FLAGGED).length;
  const errorPartners = results.filter((r) => r.trust_status === TrustStatus.ERROR).length;

  // Compute network Merkle aggregate
  const partnerRoots = results
    .filter((r) => r.trust_status === TrustStatus.VALID || r.trust_status === TrustStatus.STALE)
    .map((r) => r.last_merkle_root);

  const networkMerkleAggregate = computeNetworkMerkleRoot(partnerRoots);

  // Generate notes
  let notes = '';
  if (stalePartners > 0) {
    notes += `${stalePartners} partner(s) overdue for transparency refresh (>30 days). `;
  }
  if (flaggedPartners > 0) {
    notes += `${flaggedPartners} partner(s) flagged for integrity review. `;
  }
  if (errorPartners > 0) {
    notes += `${errorPartners} partner(s) unreachable or returned errors. `;
  }
  if (validPartners === results.length) {
    notes = 'All partners verified successfully. Network integrity confirmed.';
  }

  return {
    timestamp,
    total_partners: results.length,
    valid_partners: validPartners,
    stale_partners: stalePartners,
    flagged_partners: flaggedPartners,
    error_partners: errorPartners,
    network_merkle_aggregate: networkMerkleAggregate,
    compliance_baseline: 'Stage VI — Federated Transparency',
    notes: notes.trim(),
  };
}

/**
 * Detect stale partners based on threshold
 */
export function detectStalePartners(
  results: VerificationResult[],
  thresholdDays: number = 30
): VerificationResult[] {
  return results.filter((result) => {
    if (result.trust_status !== TrustStatus.VALID && result.trust_status !== TrustStatus.STALE) {
      return false;
    }

    // Parse timestamp from last_verified_at or use current time
    const lastVerified = new Date(result.last_verified_at);
    const now = new Date();
    const daysSinceVerification = (now.getTime() - lastVerified.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceVerification > thresholdDays;
  });
}

/**
 * Calculate trust score (0-100) based on network health
 */
export function calculateTrustScore(summary: NetworkTrustSummary): number {
  if (summary.total_partners === 0) {
    return 0;
  }

  // Weight factors
  const validWeight = 1.0;
  const staleWeight = 0.5;
  const flaggedWeight = 0.0;
  const errorWeight = 0.0;

  const weightedScore =
    summary.valid_partners * validWeight +
    summary.stale_partners * staleWeight +
    summary.flagged_partners * flaggedWeight +
    summary.error_partners * errorWeight;

  const maxPossibleScore = summary.total_partners * validWeight;

  return Math.round((weightedScore / maxPossibleScore) * 100);
}

/**
 * Determine network health status
 */
export function getNetworkHealthStatus(summary: NetworkTrustSummary): 'healthy' | 'degraded' | 'critical' {
  const trustScore = calculateTrustScore(summary);

  if (trustScore >= 80) {
    return 'healthy';
  } else if (trustScore >= 50) {
    return 'degraded';
  } else {
    return 'critical';
  }
}

/**
 * Get partners requiring human review
 */
export function getPartnersRequiringReview(results: VerificationResult[]): VerificationResult[] {
  return results.filter((r) => r.trust_status === TrustStatus.FLAGGED);
}

/**
 * Get partners with errors
 */
export function getPartnersWithErrors(results: VerificationResult[]): VerificationResult[] {
  return results.filter((r) => r.trust_status === TrustStatus.ERROR);
}

/**
 * Generate human-readable trust report
 */
export function generateTrustReport(summary: NetworkTrustSummary): string {
  const trustScore = calculateTrustScore(summary);
  const healthStatus = getNetworkHealthStatus(summary);

  let report = `Federation Trust Report\n`;
  report += `========================\n\n`;
  report += `Timestamp: ${summary.timestamp}\n`;
  report += `Compliance Baseline: ${summary.compliance_baseline}\n\n`;
  report += `Network Health: ${healthStatus.toUpperCase()} (Trust Score: ${trustScore}/100)\n\n`;
  report += `Partner Statistics:\n`;
  report += `  Total Partners: ${summary.total_partners}\n`;
  report += `  Valid: ${summary.valid_partners}\n`;
  report += `  Stale: ${summary.stale_partners}\n`;
  report += `  Flagged: ${summary.flagged_partners}\n`;
  report += `  Error: ${summary.error_partners}\n\n`;
  report += `Network Merkle Aggregate: ${summary.network_merkle_aggregate}\n\n`;

  if (summary.notes) {
    report += `Notes:\n${summary.notes}\n`;
  }

  return report;
}

