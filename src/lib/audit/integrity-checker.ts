/**
 * @fileoverview Integrity Checker for Block 9.9
 * @module lib/audit/integrity-checker
 * @see BLOCK9.9_FINAL_AUDIT_AND_HANDOFF.md
 *
 * Integration with Block 9.8 integrity API and risk assessment
 */

import type { IntegritySnapshot, SystemState, ReadinessState } from './types';

/**
 * Fetch current integrity status from Block 9.8 API
 */
export async function fetchIntegrityStatus(
  baseUrl: string = 'http://localhost:3000',
): Promise<IntegritySnapshot> {
  try {
    const response = await fetch(`${baseUrl}/api/integrity/status`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Integrity API returned ${response.status}`);
    }

    const data = await response.json();

    // Validate response structure
    if (!data.timestamp || !data.system_state || !data.ledger_status) {
      throw new Error('Invalid integrity API response structure');
    }

    return data as IntegritySnapshot;
  } catch (error) {
    console.error('Failed to fetch integrity status:', error);
    throw new Error('Unable to fetch integrity status from Block 9.8 API');
  }
}

/**
 * Assess blocking issues from integrity snapshot
 */
export function assessBlockingIssues(snapshot: IntegritySnapshot): string[] {
  const blockingIssues: string[] = [];

  // Check system state
  if (snapshot.system_state === 'attention_required') {
    blockingIssues.push(
      'System integrity state requires attention - conditional approval with exceptions required',
    );
  }

  // Check for critical ledger issues
  Object.entries(snapshot.ledger_status).forEach(([ledger, status]) => {
    if (status === 'critical') {
      blockingIssues.push(`Critical integrity issue in ${ledger} ledger`);
    }
  });

  // Check for high-severity open issues
  const criticalOpenIssues = snapshot.open_issues.filter(
    (issue) => issue.severity === 'critical' || issue.severity === 'high',
  );

  if (criticalOpenIssues.length > 0) {
    criticalOpenIssues.forEach((issue) => {
      blockingIssues.push(
        `${issue.severity.toUpperCase()}: ${issue.classification} (${issue.count} instances)`,
      );
    });
  }

  // Check for pending human reviews
  if (snapshot.pending_human_reviews > 0) {
    blockingIssues.push(
      `${snapshot.pending_human_reviews} pending human review(s) from integrity monitoring`,
    );
  }

  return blockingIssues;
}

/**
 * Determine overall readiness state
 */
export function determineReadinessState(
  integrityState: SystemState,
  completedSignOffs: string[],
  requiredSignOffs: string[],
): ReadinessState {
  // Check if all sign-offs are complete
  const allSignOffsComplete = requiredSignOffs.every((role) => completedSignOffs.includes(role));

  if (allSignOffsComplete) {
    return 'approved';
  }

  // Check for hard blockers (critical integrity issues)
  if (integrityState === 'attention_required') {
    // Not a hard blocker, but requires conditional approval
    return 'ready_for_review';
  }

  return 'ready_for_review';
}

/**
 * Check if conditional approval is allowed
 */
export function isConditionalApprovalAllowed(snapshot: IntegritySnapshot): boolean {
  // Conditional approval is allowed for 'attention_required' state
  // but NOT for critical ledger failures
  if (snapshot.system_state === 'attention_required') {
    const hasCriticalLedgerIssue = Object.values(snapshot.ledger_status).some(
      (status) => status === 'critical',
    );
    return !hasCriticalLedgerIssue;
  }

  return true;
}

/**
 * Generate human-readable integrity summary
 */
export function generateIntegritySummary(snapshot: IntegritySnapshot): string {
  const lines: string[] = [];

  lines.push(`System State: ${snapshot.system_state}`);
  lines.push(`Last Verification: ${snapshot.last_verification}`);
  lines.push(`Verification Scope: ${snapshot.verification_scope}`);
  lines.push('');

  lines.push('Ledger Status:');
  Object.entries(snapshot.ledger_status).forEach(([ledger, status]) => {
    const icon = status === 'valid' ? '✅' : status === 'degraded' ? '⚠️' : '❌';
    lines.push(`  ${icon} ${ledger}: ${status}`);
  });
  lines.push('');

  if (snapshot.open_issues.length > 0) {
    lines.push('Open Issues:');
    snapshot.open_issues.forEach((issue) => {
      lines.push(`  - ${issue.classification} (${issue.severity}): ${issue.count} instances`);
    });
    lines.push('');
  }

  if (snapshot.recent_repairs.length > 0) {
    lines.push('Recent Repairs:');
    snapshot.recent_repairs.slice(0, 3).forEach((repair) => {
      lines.push(`  - ${repair.classification}: ${repair.status}`);
    });
    lines.push('');
  }

  if (snapshot.pending_human_reviews > 0) {
    lines.push(`Pending Human Reviews: ${snapshot.pending_human_reviews}`);
    lines.push('');
  }

  lines.push(`Global Merkle Root: ${snapshot.global_merkle_root.substring(0, 16)}...`);

  return lines.join('\n');
}

/**
 * Validate integrity snapshot structure
 */
export function validateIntegritySnapshot(data: unknown): data is IntegritySnapshot {
  // Temporary: Cast to any for type guard validation — will fix in Stage VII (ticket #QPOLY-TYPE-001)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj = data as any;
  return (
    data &&
    typeof data === 'object' &&
    typeof obj.timestamp === 'string' &&
    typeof obj.system_state === 'string' &&
    ['healthy', 'degraded', 'attention_required'].includes(obj.system_state) &&
    typeof obj.last_verification === 'string' &&
    typeof obj.verification_scope === 'string' &&
    obj.ledger_status &&
    typeof obj.ledger_status === 'object' &&
    Array.isArray(obj.open_issues) &&
    Array.isArray(obj.recent_repairs) &&
    typeof obj.pending_human_reviews === 'number' &&
    typeof obj.global_merkle_root === 'string'
  );
}

/**
 * Get integrity health score (0-100)
 */
export function calculateIntegrityHealthScore(snapshot: IntegritySnapshot): number {
  let score = 100;

  // Deduct for system state
  if (snapshot.system_state === 'degraded') score -= 20;
  if (snapshot.system_state === 'attention_required') score -= 40;

  // Deduct for ledger issues
  Object.values(snapshot.ledger_status).forEach((status) => {
    if (status === 'degraded') score -= 5;
    if (status === 'critical') score -= 15;
  });

  // Deduct for open issues
  snapshot.open_issues.forEach((issue) => {
    if (issue.severity === 'critical') score -= 10;
    if (issue.severity === 'high') score -= 5;
    if (issue.severity === 'medium') score -= 2;
  });

  // Deduct for pending reviews
  score -= snapshot.pending_human_reviews * 3;

  return Math.max(0, Math.min(100, score));
}
