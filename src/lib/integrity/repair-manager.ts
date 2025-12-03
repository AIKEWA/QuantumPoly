/**
 * @fileoverview Autonomous Repair Manager
 * @module lib/integrity/repair-manager
 * @see BLOCK9.8_CONTINUOUS_INTEGRITY.md
 *
 * Manages conservative self-healing for non-critical governance issues.
 * Only performs mechanical, non-interpretive repairs with full audit trail.
 */

import crypto from 'crypto';
import fs from 'fs';

import { v4 as uuidv4 } from 'uuid';

import {
  type IntegrityIssue,
  type AutonomousRepairEntry,
  type RepairResult,
  IssueClassification,
  IssueSeverity,
} from './types';

/**
 * Compute SHA-256 hash
 */
function sha256(data: string | Record<string, unknown>): string {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Compute Merkle root for repair entry
 */
function computeMerkleRoot(entry: Partial<AutonomousRepairEntry>): string {
  const timestamp = (entry as Record<string, unknown>).timestamp || entry.applied_at;
  const components = [
    entry.entry_id,
    timestamp,
    entry.issue_classification,
    JSON.stringify(entry.original_state),
    JSON.stringify(entry.new_state),
  ];
  return sha256(components.join(''));
}

/**
 * Read JSONL ledger
 */
function readLedger(ledgerPath: string): Record<string, unknown>[] {
  if (!fs.existsSync(ledgerPath)) {
    return [];
  }

  const content = fs.readFileSync(ledgerPath, 'utf8');
  const lines = content.trim().split('\n').filter(Boolean);

  return lines
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter((item): item is Record<string, unknown> => item !== null && typeof item === 'object');
}

/**
 * Append entry to JSONL ledger
 */
function appendToLedger(ledgerPath: string, entry: unknown): void {
  const line = JSON.stringify(entry) + '\n';
  fs.appendFileSync(ledgerPath, line, 'utf8');
}

/**
 * Update ledger entry (rewrite entire ledger)
 */
function updateLedgerEntry(
  ledgerPath: string,
  entryId: string,
  updates: Record<string, unknown>,
): boolean {
  const entries = readLedger(ledgerPath);
  let updated = false;

  const updatedEntries = entries.map((entry) => {
    if (entry.id === entryId || entry.entry_id === entryId) {
      updated = true;
      return { ...entry, ...updates };
    }
    return entry;
  });

  if (updated) {
    const content = updatedEntries.map((e) => JSON.stringify(e)).join('\n') + '\n';
    fs.writeFileSync(ledgerPath, content, 'utf8');
  }

  return updated;
}

/**
 * Attempt to repair a stale next_review date
 */
function repairStaleReviewDate(issue: IntegrityIssue, dryRun: boolean): RepairResult {
  if (!issue.entry_id || !issue.original_state?.next_review) {
    return {
      success: false,
      error: 'Missing entry_id or original_state',
    };
  }

  const timestamp = new Date().toISOString();
  const repairEntryId = `autonomous_repair-${timestamp}-${uuidv4().slice(0, 8)}`;

  const repairEntry: AutonomousRepairEntry = {
    entry_id: repairEntryId,
    ledger_entry_type: 'autonomous_repair',
    block_id: '9.8',
    title: `Automated Review Date Escalation: ${issue.entry_id}`,
    status: 'applied',
    applied_at: timestamp,
    responsible_roles: ['Integrity Monitor Engine', 'Governance Officer'],
    issue_classification: IssueClassification.STALE_DATE,
    original_state: issue.original_state,
    new_state: issue.proposed_state || { next_review: 'ATTENTION_REQUIRED' },
    rationale: issue.rationale || 'Automated escalation: review date exceeded threshold',
    hash: '',
    merkleRoot: '',
    signature: null,
  };

  // Compute hash and Merkle root
  const entryForHash: Record<string, unknown> = { ...repairEntry };
  delete entryForHash.hash;
  delete entryForHash.merkleRoot;
  delete entryForHash.signature;

  repairEntry.hash = sha256(entryForHash);
  repairEntry.merkleRoot = computeMerkleRoot(repairEntry);

  if (!dryRun) {
    // Update the original entry
    const ledgerPath = `governance/${issue.affected_ledger}/ledger.jsonl`;
    const updated = updateLedgerEntry(ledgerPath, issue.entry_id, {
      next_review: 'ATTENTION_REQUIRED',
    });

    if (!updated) {
      return {
        success: false,
        error: `Failed to update entry ${issue.entry_id} in ${ledgerPath}`,
      };
    }

    // Append repair entry to governance ledger
    appendToLedger('governance/ledger/ledger.jsonl', repairEntry);
  }

  return {
    success: true,
    repair_entry: repairEntry,
  };
}

/**
 * Create escalation entry for issues requiring human review
 */
function createEscalationEntry(issue: IntegrityIssue, dryRun: boolean): RepairResult {
  const timestamp = new Date().toISOString();
  const repairEntryId = `autonomous_repair-${timestamp}-${uuidv4().slice(0, 8)}`;

  // Determine follow-up deadline based on severity
  let followupDays = 3; // Default: 3 business days
  if (issue.severity === IssueSeverity.CRITICAL) {
    followupDays = 1;
  } else if (issue.severity === IssueSeverity.HIGH) {
    followupDays = 2;
  } else if (issue.severity === IssueSeverity.MEDIUM) {
    followupDays = 5;
  } else {
    followupDays = 7;
  }

  const repairEntry: AutonomousRepairEntry = {
    entry_id: repairEntryId,
    ledger_entry_type: 'autonomous_repair',
    block_id: '9.8',
    title: `Integrity Issue Requires Review: ${issue.classification}`,
    status: 'pending_human_review',
    applied_at: timestamp,
    responsible_roles: ['Integrity Monitor Engine', 'Governance Officer'],
    issue_classification: issue.classification,
    original_state: issue.original_state || { issue_description: issue.description },
    new_state: {},
    rationale: `${issue.description}. ${issue.details}`,
    requires_followup_by: new Date(Date.now() + followupDays * 24 * 60 * 60 * 1000).toISOString(),
    followup_owner: 'Governance Officer',
    hash: '',
    merkleRoot: '',
    signature: null,
  };

  // Compute hash and Merkle root
  const entryForHash: Record<string, unknown> = { ...repairEntry };
  delete entryForHash.hash;
  delete entryForHash.merkleRoot;
  delete entryForHash.signature;

  repairEntry.hash = sha256(entryForHash);
  repairEntry.merkleRoot = computeMerkleRoot(repairEntry);

  if (!dryRun) {
    appendToLedger('governance/ledger/ledger.jsonl', repairEntry);
  }

  return {
    success: true,
    repair_entry: repairEntry,
  };
}

/**
 * Attempt to repair an integrity issue
 *
 * Conservative repair scope:
 * - Stale next_review dates: Update to ATTENTION_REQUIRED
 * - Hash mismatches: Escalate to human review
 * - Missing references: Escalate to human review
 * - Integrity breaks: Escalate to human review
 * - Compliance downgrades: Escalate to human review
 */
export function attemptRepair(issue: IntegrityIssue, dryRun: boolean = false): RepairResult {
  // Conservative repair logic - only auto-repair mechanical issues
  if (issue.auto_repairable) {
    switch (issue.classification) {
      case IssueClassification.STALE_DATE:
        return repairStaleReviewDate(issue, dryRun);

      case IssueClassification.MINOR_INCONSISTENCY:
        // For now, escalate even minor inconsistencies
        return createEscalationEntry(issue, dryRun);

      default:
        return createEscalationEntry(issue, dryRun);
    }
  } else {
    // Not auto-repairable - create escalation entry
    return createEscalationEntry(issue, dryRun);
  }
}

/**
 * Process all issues and attempt repairs
 */
export function processIssues(
  issues: IntegrityIssue[],
  dryRun: boolean = false,
): {
  repaired: RepairResult[];
  escalated: RepairResult[];
  failed: RepairResult[];
} {
  const repaired: RepairResult[] = [];
  const escalated: RepairResult[] = [];
  const failed: RepairResult[] = [];

  issues.forEach((issue) => {
    const result = attemptRepair(issue, dryRun);

    if (!result.success) {
      failed.push(result);
    } else if (result.repair_entry?.status === 'applied') {
      repaired.push(result);
    } else if (result.repair_entry?.status === 'pending_human_review') {
      escalated.push(result);
    }
  });

  return { repaired, escalated, failed };
}

/**
 * Get recent repair entries from ledger
 */
export function getRecentRepairs(limit: number = 10): AutonomousRepairEntry[] {
  const entries = readLedger('governance/ledger/ledger.jsonl');

  return entries
    .filter((e) => e.ledger_entry_type === 'autonomous_repair')
    .slice(-limit)
    .reverse() as unknown as AutonomousRepairEntry[];
}

/**
 * Get pending repair entries requiring human review
 */
export function getPendingRepairs(): AutonomousRepairEntry[] {
  const entries = readLedger('governance/ledger/ledger.jsonl');

  return entries.filter(
    (e) => e.ledger_entry_type === 'autonomous_repair' && e.status === 'pending_human_review',
  ) as unknown as AutonomousRepairEntry[];
}

/**
 * Count open issues by classification
 */
export function countOpenIssues(): Record<string, number> {
  const pending = getPendingRepairs();
  const counts: Record<string, number> = {};

  pending.forEach((entry) => {
    const classification = entry.issue_classification;
    counts[classification] = (counts[classification] || 0) + 1;
  });

  return counts;
}
