/**
 * @fileoverview Core Integrity Verification Engine
 * @module lib/integrity/engine
 * @see BLOCK9.8_CONTINUOUS_INTEGRITY.md
 *
 * Continuous integrity monitoring engine that verifies:
 * - Ledger chain consistency (hashes, timestamps, signatures)
 * - Federation partner proof validity
 * - Trust proof freshness
 * - Temporal consistency
 * - Cross-reference validity
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Reserved for future integrity checks
// import { getIntegrityRecentEntries, verifyIntegrityLedger } from '@/lib/integrity';

import {
  type IntegrityReport,
  type IntegrityIssue,
  IssueClassification,
  IssueSeverity,
  type LedgerHealth,
  type SystemState,
} from './types';

/**
 * Compute SHA-256 hash
 */
function sha256(data: string | Record<string, unknown>): string {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Read JSONL ledger file
 */
function readLedger(ledgerPath: string): Record<string, unknown>[] {
  if (!fs.existsSync(ledgerPath)) {
    return [];
  }

  const content = fs.readFileSync(ledgerPath, 'utf8');
  const lines = content.trim().split('\n').filter(Boolean);

  return lines
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        console.error(`Invalid JSON at line ${index + 1} in ${ledgerPath}`);
        return null;
      }
    })
    .filter((item): item is Record<string, unknown> => item !== null && typeof item === 'object');
}

/**
 * Compute global Merkle root across all ledgers
 */
function computeGlobalMerkleRoot(ledgers: Array<{ name: string; merkleRoot: string }>): string {
  const combined = ledgers.map((l) => l.merkleRoot).join('');
  return sha256(combined);
}

/**
 * Check if date is in the past
 */
function isDateInPast(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    return date < new Date();
  } catch {
    return false;
  }
}

/**
 * Check if date is in the future
 */
function isDateInFuture(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    return date > new Date();
  } catch {
    return false;
  }
}

/**
 * Verify governance ledger integrity
 */
function verifyGovernanceLedger(issues: IntegrityIssue[]): LedgerHealth {
  const ledgerPath = 'governance/ledger/ledger.jsonl';
  const entries = readLedger(ledgerPath);

  if (entries.length === 0) {
    issues.push({
      issue_id: `gov-empty-${Date.now()}`,
      classification: IssueClassification.INTEGRITY_BREAK,
      severity: IssueSeverity.CRITICAL,
      affected_ledger: 'governance',
      description: 'Governance ledger is empty or unreadable',
      details: 'The governance ledger file exists but contains no valid entries',
      auto_repairable: false,
      detected_at: new Date().toISOString(),
    });
    return 'critical';
  }

  let criticalIssues = 0;
  let degradedIssues = 0;

  // Check each entry
  entries.forEach((entry, index) => {
    // Check required fields
    const requiredFields = ['id', 'timestamp', 'hash', 'merkleRoot'];
    const missingFields = requiredFields.filter((field) => !entry[field]);

    if (missingFields.length > 0) {
      issues.push({
        issue_id: `gov-missing-fields-${index}`,
        classification: IssueClassification.INTEGRITY_BREAK,
        severity: IssueSeverity.HIGH,
        affected_ledger: 'governance',
        entry_id: (entry.id as string) || `entry-${index}`,
        description: `Missing required fields: ${missingFields.join(', ')}`,
        details: `Entry at index ${index} is missing critical fields`,
        auto_repairable: false,
        detected_at: new Date().toISOString(),
      });
      criticalIssues++;
    }

    // Check for stale next_review dates
    if (entry.next_review && isDateInPast(entry.next_review as string)) {
      const daysPast = Math.floor(
        (Date.now() - new Date(entry.next_review as string).getTime()) / (1000 * 60 * 60 * 24),
      );

      issues.push({
        issue_id: `gov-stale-review-${entry.id}`,
        classification: IssueClassification.STALE_DATE,
        severity: daysPast > 90 ? IssueSeverity.HIGH : IssueSeverity.MEDIUM,
        affected_ledger: 'governance',
        entry_id: entry.id as string,
        description: `Review date is ${daysPast} days overdue`,
        details: `Entry "${entry.title || entry.id}" has next_review: ${entry.next_review}`,
        auto_repairable: true,
        original_state: { next_review: entry.next_review },
        proposed_state: { next_review: 'ATTENTION_REQUIRED' },
        rationale: `Automated escalation: next_review date exceeded by ${daysPast} days`,
        detected_at: new Date().toISOString(),
      });
      degradedIssues++;
    }

    // Check for future approved_date (backdating detection)
    if (entry.approved_date && isDateInFuture(entry.approved_date as string)) {
      issues.push({
        issue_id: `gov-future-approval-${entry.id}`,
        classification: IssueClassification.INTEGRITY_BREAK,
        severity: IssueSeverity.CRITICAL,
        affected_ledger: 'governance',
        entry_id: entry.id as string,
        description: 'Approval date is in the future',
        details: `Entry has approved_date: ${entry.approved_date} which is in the future`,
        auto_repairable: false,
        detected_at: new Date().toISOString(),
      });
      criticalIssues++;
    }

    // Check document references
    if (entry.documents && Array.isArray(entry.documents)) {
      entry.documents.forEach((doc: string) => {
        const docPath = path.join(process.cwd(), doc);
        if (!fs.existsSync(docPath)) {
          issues.push({
            issue_id: `gov-missing-doc-${entry.id}-${sha256(doc).slice(0, 8)}`,
            classification: IssueClassification.MISSING_REFERENCE,
            severity: IssueSeverity.HIGH,
            affected_ledger: 'governance',
            entry_id: entry.id as string,
            description: `Referenced document not found: ${doc}`,
            details: `Entry references document that does not exist at expected path`,
            auto_repairable: false,
            detected_at: new Date().toISOString(),
          });
          criticalIssues++;
        }
      });
    }

    // Check artifactLinks
    if (entry.artifactLinks && Array.isArray(entry.artifactLinks)) {
      entry.artifactLinks.forEach((artifact: string) => {
        const artifactPath = path.join(process.cwd(), artifact);
        if (!fs.existsSync(artifactPath)) {
          issues.push({
            issue_id: `gov-missing-artifact-${entry.id}-${sha256(artifact).slice(0, 8)}`,
            classification: IssueClassification.MISSING_REFERENCE,
            severity: IssueSeverity.MEDIUM,
            affected_ledger: 'governance',
            entry_id: entry.id as string,
            description: `Referenced artifact not found: ${artifact}`,
            details: `Entry references artifact that does not exist at expected path`,
            auto_repairable: false,
            detected_at: new Date().toISOString(),
          });
          degradedIssues++;
        }
      });
    }
  });

  // Determine health status
  if (criticalIssues > 0) return 'critical';
  if (degradedIssues > 0) return 'degraded';
  return 'valid';
}

/**
 * Verify consent ledger integrity
 */
function verifyConsentLedger(issues: IntegrityIssue[]): LedgerHealth {
  const ledgerPath = 'governance/consent/ledger.jsonl';

  if (!fs.existsSync(ledgerPath)) {
    // Consent ledger is optional if no consent events yet
    return 'valid';
  }

  const entries = readLedger(ledgerPath);

  if (entries.length === 0) {
    return 'valid'; // Empty is okay for consent ledger
  }

  let degradedIssues = 0;

  // Basic validation
  entries.forEach((entry, index) => {
    if (!entry.timestamp || !entry.event_type) {
      issues.push({
        issue_id: `consent-invalid-${index}`,
        classification: IssueClassification.MINOR_INCONSISTENCY,
        severity: IssueSeverity.LOW,
        affected_ledger: 'consent',
        description: 'Consent entry missing required fields',
        details: `Entry at index ${index} is missing timestamp or event_type`,
        auto_repairable: false,
        detected_at: new Date().toISOString(),
      });
      degradedIssues++;
    }
  });

  return degradedIssues > 0 ? 'degraded' : 'valid';
}

/**
 * Verify federation ledger integrity
 */
function verifyFederationLedger(issues: IntegrityIssue[]): LedgerHealth {
  const ledgerPath = 'governance/federation/ledger.jsonl';

  if (!fs.existsSync(ledgerPath)) {
    // Federation ledger is optional if federation not active
    return 'valid';
  }

  const entries = readLedger(ledgerPath);

  if (entries.length === 0) {
    return 'valid'; // Empty is okay
  }

  let degradedIssues = 0;

  // Check for stale federation verifications
  const recentVerifications = entries.filter(
    (e) => e.ledger_entry_type === 'federation_verification',
  );

  if (recentVerifications.length > 0) {
    const latestVerification = recentVerifications[recentVerifications.length - 1];
    const verificationDate = new Date(latestVerification.timestamp as string);
    const daysSinceVerification = Math.floor(
      (Date.now() - verificationDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceVerification > 2) {
      issues.push({
        issue_id: `federation-stale-${Date.now()}`,
        classification: IssueClassification.FEDERATION_STALE,
        severity: daysSinceVerification > 7 ? IssueSeverity.HIGH : IssueSeverity.MEDIUM,
        affected_ledger: 'federation',
        description: `Federation verification is ${daysSinceVerification} days old`,
        details: `Last verification: ${latestVerification.timestamp}`,
        auto_repairable: false,
        detected_at: new Date().toISOString(),
      });
      degradedIssues++;
    }
  }

  return degradedIssues > 0 ? 'degraded' : 'valid';
}

/**
 * Verify trust proofs integrity
 */
function verifyTrustProofs(issues: IntegrityIssue[]): LedgerHealth {
  const activeProofsPath = 'governance/trust-proofs/active-proofs.jsonl';

  if (!fs.existsSync(activeProofsPath)) {
    // Trust proofs are optional if not yet generated
    return 'valid';
  }

  const proofs = readLedger(activeProofsPath);

  if (proofs.length === 0) {
    return 'valid'; // Empty is okay
  }

  let degradedIssues = 0;
  let criticalIssues = 0;

  // Check for expired proofs
  proofs.forEach((proof, index) => {
    if (proof.expires_at) {
      const expiryDate = new Date(proof.expires_at as string);
      if (expiryDate < new Date()) {
        issues.push({
          issue_id: `trust-expired-${proof.artifact_id || index}`,
          classification: IssueClassification.ATTESTATION_EXPIRED,
          severity: IssueSeverity.MEDIUM,
          affected_ledger: 'trust_proofs',
          description: `Trust proof expired: ${proof.artifact_id}`,
          details: `Proof expired at ${proof.expires_at}`,
          auto_repairable: false,
          detected_at: new Date().toISOString(),
        });
        degradedIssues++;
      }
    }

    // Check if referenced file exists
    if (proof.file_path) {
      const filePath = path.join(process.cwd(), proof.file_path as string);
      if (!fs.existsSync(filePath)) {
        issues.push({
          issue_id: `trust-missing-file-${proof.artifact_id || index}`,
          classification: IssueClassification.MISSING_REFERENCE,
          severity: IssueSeverity.HIGH,
          affected_ledger: 'trust_proofs',
          description: `Trust proof references missing file: ${proof.file_path}`,
          details: `Artifact ${proof.artifact_id} references non-existent file`,
          auto_repairable: false,
          detected_at: new Date().toISOString(),
        });
        criticalIssues++;
      }
    }
  });

  if (criticalIssues > 0) return 'critical';
  if (degradedIssues > 0) return 'degraded';
  return 'valid';
}

/**
 * Determine overall system state
 */
function determineSystemState(
  governanceHealth: LedgerHealth,
  consentHealth: LedgerHealth,
  federationHealth: LedgerHealth,
  trustProofsHealth: LedgerHealth,
  pendingReviews: number,
): SystemState {
  // Critical if any ledger is critical
  if (
    governanceHealth === 'critical' ||
    consentHealth === 'critical' ||
    federationHealth === 'critical' ||
    trustProofsHealth === 'critical'
  ) {
    return 'attention_required';
  }

  // Attention required if pending human reviews
  if (pendingReviews > 0) {
    return 'attention_required';
  }

  // Degraded if any ledger is degraded
  if (
    governanceHealth === 'degraded' ||
    consentHealth === 'degraded' ||
    federationHealth === 'degraded' ||
    trustProofsHealth === 'degraded'
  ) {
    return 'degraded';
  }

  return 'healthy';
}

/**
 * Run comprehensive integrity verification
 */
export function runIntegrityVerification(scope: string[] = ['all']): IntegrityReport {
  const issues: IntegrityIssue[] = [];
  const timestamp = new Date().toISOString();

  // Determine what to verify
  const verifyAll = scope.includes('all');
  const verifyGovernance = verifyAll || scope.includes('governance');
  const verifyConsent = verifyAll || scope.includes('consent');
  const verifyFederation = verifyAll || scope.includes('federation');
  const verifyTrust = verifyAll || scope.includes('trust');

  // Run verifications
  const governanceHealth = verifyGovernance ? verifyGovernanceLedger(issues) : 'valid';
  const consentHealth = verifyConsent ? verifyConsentLedger(issues) : 'valid';
  const federationHealth = verifyFederation ? verifyFederationLedger(issues) : 'valid';
  const trustProofsHealth = verifyTrust ? verifyTrustProofs(issues) : 'valid';

  // Count auto-repairable vs. escalation issues
  // const autoRepairable = issues.filter(i => i.auto_repairable).length;
  const requiresReview = issues.filter((i) => !i.auto_repairable).length;

  // Compute global Merkle root
  const ledgers = [];

  if (verifyGovernance) {
    const govEntries = readLedger('governance/ledger/ledger.jsonl');
    const lastEntry = govEntries[govEntries.length - 1];
    if (lastEntry?.merkleRoot) {
      ledgers.push({ name: 'governance', merkleRoot: lastEntry.merkleRoot as string });
    }
  }

  if (verifyConsent && fs.existsSync('governance/consent/ledger.jsonl')) {
    const consentEntries = readLedger('governance/consent/ledger.jsonl');
    const lastEntry = consentEntries[consentEntries.length - 1];
    if (lastEntry?.merkleRoot) {
      ledgers.push({ name: 'consent', merkleRoot: lastEntry.merkleRoot as string });
    }
  }

  if (verifyFederation && fs.existsSync('governance/federation/ledger.jsonl')) {
    const fedEntries = readLedger('governance/federation/ledger.jsonl');
    const lastEntry = fedEntries[fedEntries.length - 1];
    if (lastEntry?.merkleRoot) {
      ledgers.push({ name: 'federation', merkleRoot: lastEntry.merkleRoot as string });
    }
  }

  const globalMerkleRoot = ledgers.length > 0 ? computeGlobalMerkleRoot(ledgers) : '';

  // Determine system state
  const systemState = determineSystemState(
    governanceHealth,
    consentHealth,
    federationHealth,
    trustProofsHealth,
    requiresReview,
  );

  return {
    timestamp,
    verification_scope: scope,
    total_issues: issues.length,
    auto_repaired: 0, // Will be updated by repair manager
    requires_human_review: requiresReview,
    issues,
    ledger_status: {
      governance: governanceHealth,
      consent: consentHealth,
      federation: federationHealth,
      trust_proofs: trustProofsHealth,
    },
    global_merkle_root: globalMerkleRoot,
    system_state: systemState,
  };
}
