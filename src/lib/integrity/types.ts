/**
 * @fileoverview Integrity Monitoring Type Definitions
 * @module lib/integrity/types
 * @see BLOCK9.8_CONTINUOUS_INTEGRITY.md
 *
 * Type definitions for the continuous integrity monitoring and self-healing system.
 */

/**
 * Issue classification for integrity problems
 */
export enum IssueClassification {
  MINOR_INCONSISTENCY = 'minor_inconsistency',      // Auto-repairable
  STALE_DATE = 'stale_date',                        // Auto-repairable
  HASH_MISMATCH = 'hash_mismatch',                  // Escalate
  MISSING_REFERENCE = 'missing_reference',          // Escalate
  INTEGRITY_BREAK = 'integrity_break',              // Escalate
  COMPLIANCE_DOWNGRADE = 'compliance_downgrade',    // Escalate
  ATTESTATION_EXPIRED = 'attestation_expired',      // Escalate
  FEDERATION_STALE = 'federation_stale',            // Escalate
}

/**
 * Severity level for issues
 */
export enum IssueSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Ledger health status
 */
export type LedgerHealth = 'valid' | 'degraded' | 'critical';

/**
 * System state
 */
export type SystemState = 'healthy' | 'degraded' | 'attention_required';

/**
 * Repair status
 */
export type RepairStatus = 'applied' | 'pending_human_review' | 'resolved' | 'rejected';

/**
 * Individual integrity issue
 */
export interface IntegrityIssue {
  /** Unique issue identifier */
  issue_id: string;
  
  /** Issue classification */
  classification: IssueClassification;
  
  /** Severity level */
  severity: IssueSeverity;
  
  /** Affected ledger */
  affected_ledger: 'governance' | 'consent' | 'federation' | 'trust_proofs';
  
  /** Entry ID that has the issue (if applicable) */
  entry_id?: string;
  
  /** Human-readable description */
  description: string;
  
  /** Detailed explanation */
  details: string;
  
  /** Whether this can be auto-repaired */
  auto_repairable: boolean;
  
  /** Original state (before repair) */
  original_state?: Record<string, unknown>;
  
  /** Proposed new state (if auto-repairable) */
  proposed_state?: Record<string, unknown>;
  
  /** Rationale for repair */
  rationale?: string;
  
  /** Timestamp when detected */
  detected_at: string;
}

/**
 * Comprehensive integrity report
 */
export interface IntegrityReport {
  /** Report timestamp */
  timestamp: string;
  
  /** Verification scope */
  verification_scope: string[];
  
  /** Total issues found */
  total_issues: number;
  
  /** Number of auto-repaired issues */
  auto_repaired: number;
  
  /** Number requiring human review */
  requires_human_review: number;
  
  /** List of all issues */
  issues: IntegrityIssue[];
  
  /** Per-ledger status */
  ledger_status: {
    governance: LedgerHealth;
    consent: LedgerHealth;
    federation: LedgerHealth;
    trust_proofs: LedgerHealth;
  };
  
  /** Global Merkle root across all ledgers */
  global_merkle_root: string;
  
  /** Overall system state */
  system_state: SystemState;
}

/**
 * Autonomous repair ledger entry
 */
export interface AutonomousRepairEntry {
  /** Entry identifier */
  entry_id: string;
  
  /** Entry type */
  ledger_entry_type: 'autonomous_repair';
  
  /** Block identifier */
  block_id: '9.8';
  
  /** Entry title */
  title: string;
  
  /** Repair status */
  status: RepairStatus;
  
  /** When repair was applied */
  applied_at: string;
  
  /** Responsible roles */
  responsible_roles: string[];
  
  /** Issue classification */
  issue_classification: IssueClassification;
  
  /** Original state before repair */
  original_state: Record<string, unknown>;
  
  /** New state after repair */
  new_state: Record<string, unknown>;
  
  /** Rationale for repair */
  rationale: string;
  
  /** Follow-up deadline (if pending review) */
  requires_followup_by?: string;
  
  /** Follow-up owner (if pending review) */
  followup_owner?: string;
  
  /** SHA-256 hash */
  hash: string;
  
  /** Merkle root */
  merkleRoot: string;
  
  /** GPG signature (optional) */
  signature: string | null;
}

/**
 * Public integrity status API response
 */
export interface IntegrityStatusResponse {
  /** Response timestamp */
  timestamp: string;
  
  /** Overall system state */
  system_state: SystemState;
  
  /** Last verification timestamp */
  last_verification: string;
  
  /** Verification scope */
  verification_scope: string[];
  
  /** Per-ledger status */
  ledger_status: {
    governance: LedgerHealth;
    consent: LedgerHealth;
    federation: LedgerHealth;
    trust_proofs: LedgerHealth;
  };
  
  /** Open issues summary */
  open_issues: {
    classification: string;
    count: number;
    severity: string;
    summary: string;
  }[];
  
  /** Recent repairs */
  recent_repairs: {
    timestamp: string;
    classification: string;
    status: string;
    summary: string;
  }[];
  
  /** Number of issues pending human review */
  pending_human_reviews: number;
  
  /** Global Merkle root */
  global_merkle_root: string;
  
  /** Compliance baseline */
  compliance_baseline: string;
  
  /** Privacy notice */
  privacy_notice: string;
  
  /** Documentation URL */
  documentation_url: string;
}

/**
 * Email notification payload
 */
export interface EmailNotification {
  /** Recipient email */
  to: string;
  
  /** Email subject */
  subject: string;
  
  /** Email body */
  body: {
    issue_classification: string;
    severity: IssueSeverity;
    detected_at: string;
    description: string;
    affected_ledgers: string[];
    action_required: string;
    review_url: string;
    ledger_entry_id: string;
  };
}

/**
 * Webhook notification payload
 */
export interface WebhookPayload {
  /** Event type */
  event_type: 'integrity_issue_detected';
  
  /** Event timestamp */
  timestamp: string;
  
  /** Issue severity */
  severity: IssueSeverity;
  
  /** Issue details */
  issue: IntegrityIssue;
  
  /** Repair entry ID */
  repair_entry_id: string;
  
  /** HMAC-SHA256 signature */
  signature: string;
}

/**
 * Verification configuration
 */
export interface VerificationConfig {
  /** Verification scope */
  scope: 'governance' | 'consent' | 'federation' | 'trust' | 'all';
  
  /** Dry run mode (no repairs) */
  dryRun: boolean;
  
  /** Send notifications */
  notify: boolean;
  
  /** Verbose output */
  verbose: boolean;
  
  /** Report output path */
  reportPath?: string;
}

/**
 * Repair result
 */
export interface RepairResult {
  /** Whether repair was successful */
  success: boolean;
  
  /** Repair entry created */
  repair_entry?: AutonomousRepairEntry;
  
  /** Error message (if failed) */
  error?: string;
}

