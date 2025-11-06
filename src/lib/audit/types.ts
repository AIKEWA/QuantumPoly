/**
 * @fileoverview Block 9.9 — Human Audit & Final Review Layer Types
 * @module lib/audit/types
 * @see BLOCK9.9_FINAL_AUDIT_AND_HANDOFF.md
 *
 * TypeScript definitions for human sign-off records, review states, and approval workflows
 */

/**
 * Required reviewer roles for final audit sign-off
 */
export type ReviewRole =
  | 'Lead Engineer'
  | 'Governance Officer'
  | 'Legal Counsel'
  | 'Accessibility Reviewer';

/**
 * Review decision types
 */
export type ReviewDecision = 'approved' | 'rejected' | 'approved_with_exceptions';

/**
 * System integrity states from Block 9.8
 */
export type SystemState = 'healthy' | 'degraded' | 'attention_required';

/**
 * Overall readiness state for release
 */
export type ReadinessState = 'ready_for_review' | 'blocked' | 'approved';

/**
 * Integrity snapshot from Block 9.8 API
 */
export interface IntegritySnapshot {
  timestamp: string;
  system_state: SystemState;
  last_verification: string;
  verification_scope: string;
  ledger_status: {
    governance: 'valid' | 'degraded' | 'critical';
    consent: 'valid' | 'degraded' | 'critical';
    federation: 'valid' | 'degraded' | 'critical';
    trust_proofs: 'valid' | 'degraded' | 'critical';
  };
  open_issues: Array<{
    classification: string;
    count: number;
    severity: string;
    summary: string;
  }>;
  recent_repairs: Array<{
    timestamp: string;
    classification: string;
    status: string;
    summary: string;
  }>;
  pending_human_reviews: number;
  global_merkle_root: string;
}

/**
 * Exception justification for conditional approval
 */
export interface ExceptionJustification {
  issue_description: string;
  rationale: string;
  mitigation_plan: string;
  mitigation_owner: string;
  deadline?: string;
}

/**
 * Individual sign-off record
 */
export interface SignOffRecord {
  review_id: string;
  reviewer_name: string;
  role: ReviewRole;
  review_scope: string[];
  decision: ReviewDecision;
  exceptions?: ExceptionJustification[];
  notes?: string;
  integrity_snapshot: IntegritySnapshot;
  timestamp: string;
  signature_hash: string;
}

/**
 * Public sign-off summary (no sensitive data)
 */
export interface PublicSignOffSummary {
  review_id: string;
  role: ReviewRole;
  decision: ReviewDecision;
  review_scope: string[];
  timestamp: string;
  has_exceptions: boolean;
}

/**
 * Audit status response
 */
export interface AuditStatusResponse {
  release_candidate: string;
  commit_hash: string;
  readiness_state: ReadinessState;
  integrity_state: SystemState;
  required_signoffs: ReviewRole[];
  completed_signoffs: ReviewRole[];
  blocking_issues: string[];
  last_review: string | null;
  integrity_snapshot?: IntegritySnapshot;
}

/**
 * Sign-off submission request
 */
export interface SignOffSubmission {
  reviewer_name: string;
  role: ReviewRole;
  review_scope: string[];
  decision: ReviewDecision;
  exceptions?: ExceptionJustification[];
  notes?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Ledger entry for final audit sign-off (Block 9.9)
 */
export interface FinalAuditLedgerEntry {
  entry_id: string;
  ledger_entry_type: 'final_audit_signoff';
  block_id: '9.9';
  title: string;
  status: 'approved_for_release' | 'rejected' | 'approved_with_conditions';
  approved_at: string;
  release_version: string;
  commit_hash: string;
  integrity_reference: string;
  signoffs: Array<{
    role: ReviewRole;
    name: string;
    timestamp: string;
    scope: string;
    decision: ReviewDecision;
  }>;
  unresolved_risks: Array<{
    description: string;
    mitigation_plan_owner: string;
    deadline?: string;
  }>;
  escalation_path_after_release: string;
  notes?: string;
  hash: string;
  merkleRoot: string;
  signature: string | null;
}

/**
 * Governance milestone status
 */
export interface GovernanceMilestone {
  block_id: string;
  title: string;
  status: 'complete' | 'in_progress' | 'pending';
  completion_date?: string;
  documentation_url?: string;
}

