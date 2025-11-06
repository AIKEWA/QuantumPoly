/**
 * @fileoverview Federation Type Definitions
 * @module lib/federation/types
 * @see BLOCK9.6_COLLECTIVE_ETHICS_GRAPH.md
 *
 * Core type definitions for the Collective Ethics Graph federation system.
 * Defines FederationRecord schema, trust status enums, and verification results.
 */

/**
 * Trust status of a federation partner
 */
export enum TrustStatus {
  /** Proof consistent, no integrity violation detected */
  VALID = 'valid',
  /** No recent update, partner overdue */
  STALE = 'stale',
  /** Inconsistency detected, requires human review */
  FLAGGED = 'flagged',
  /** Unable to verify (network error, endpoint unreachable) */
  ERROR = 'error',
}

/**
 * Federation Record Schema
 * Canonical structure for describing and verifying a federation peer.
 */
export interface FederationRecord {
  /** Stable identifier for the partner instance (domain-like, org slug, or legal entity handle) */
  partner_id: string;
  
  /** Human-readable display name */
  partner_display_name: string;
  
  /** Cryptographic root summarizing partner's latest governance ledger */
  merkle_root: string;
  
  /** When this snapshot was last checked or consumed (ISO-8601) */
  timestamp: string;
  
  /** Partner's declared governance maturity (e.g. "Stage V — Cognitive Governance") */
  compliance_stage: string;
  
  /** Optional cryptographic signature from the partner (PGP/ed25519) */
  signature?: string | null;
  
  /** Hash algorithm used (default: SHA-256) */
  hash_algorithm: string;
  
  /** Where auditors can retrieve partner's public ethics data */
  governance_endpoint: string;
}

/**
 * Partner Configuration
 * Static or dynamic partner definition with verification settings.
 */
export interface PartnerConfig {
  /** Unique partner identifier */
  partner_id: string;
  
  /** Display name for UI/reports */
  partner_display_name: string;
  
  /** Endpoint to fetch partner's FederationRecord */
  governance_endpoint: string;
  
  /** Optional webhook URL for push notifications */
  webhook_url?: string;
  
  /** Optional HMAC secret for webhook verification */
  webhook_secret?: string;
  
  /** Custom staleness threshold in days (default: 30) */
  stale_threshold_days?: number;
  
  /** Whether this partner is currently active */
  active: boolean;
  
  /** When this partner was added to the federation */
  added_at: string;
  
  /** Optional notes about this partner */
  notes?: string;
}

/**
 * Verification Result
 * Result of verifying a single partner's FederationRecord.
 */
export interface VerificationResult {
  /** Partner identifier */
  partner_id: string;
  
  /** Partner display name */
  partner_display_name: string;
  
  /** Latest Merkle root received from partner */
  last_merkle_root: string;
  
  /** When verification was performed (ISO-8601) */
  last_verified_at: string;
  
  /** Trust status after verification */
  trust_status: TrustStatus;
  
  /** Human-readable notes about verification result */
  notes: string;
  
  /** Partner's compliance stage */
  compliance_stage?: string;
  
  /** Partner's governance endpoint */
  governance_endpoint: string;
  
  /** Optional error details if verification failed */
  error?: string;
}

/**
 * Network Trust Summary
 * Aggregate view of federation network health.
 */
export interface NetworkTrustSummary {
  /** When this summary was generated (ISO-8601) */
  timestamp: string;
  
  /** Total number of partners in federation */
  total_partners: number;
  
  /** Number of partners with valid trust status */
  valid_partners: number;
  
  /** Number of partners with stale trust status */
  stale_partners: number;
  
  /** Number of partners with flagged trust status */
  flagged_partners: number;
  
  /** Number of partners with error status */
  error_partners: number;
  
  /** Aggregate Merkle root of all partner roots */
  network_merkle_aggregate: string;
  
  /** Compliance baseline reference */
  compliance_baseline: string;
  
  /** Optional notes about network health */
  notes?: string;
}

/**
 * Federation Ledger Entry
 * Entry appended to governance/federation/ledger.jsonl
 */
export interface FederationLedgerEntry {
  /** Unique entry identifier */
  entry_id: string;
  
  /** Entry type */
  ledger_entry_type: 'federation_integration' | 'federation_verification' | 'partner_registration' | 'partner_update';
  
  /** Block identifier */
  block_id: string;
  
  /** Entry title */
  title: string;
  
  /** Entry status */
  status: 'approved' | 'pending' | 'flagged';
  
  /** Approval date (ISO-8601) */
  approved_date: string;
  
  /** Timestamp (ISO-8601) */
  timestamp: string;
  
  /** Responsible roles */
  responsible_roles: string[];
  
  /** Summary of entry */
  summary: string;
  
  /** Next review date (ISO-8601) */
  next_review: string;
  
  /** Verification results (for verification entries) */
  verification_results?: VerificationResult[];
  
  /** Partner details (for registration entries) */
  partner?: Partial<PartnerConfig>;
  
  /** SHA-256 hash of entry */
  hash: string;
  
  /** Merkle root */
  merkleRoot: string;
  
  /** Optional signature */
  signature?: string | null;
}

/**
 * Webhook Notification Payload
 * Payload structure for federation webhook notifications.
 */
export interface WebhookNotification {
  /** Partner sending the notification */
  partner_id: string;
  
  /** Event type */
  event_type: 'merkle_update' | 'trust_change' | 'partner_added' | 'partner_removed';
  
  /** Event timestamp (ISO-8601) */
  timestamp: string;
  
  /** Event-specific payload */
  payload: {
    merkle_root?: string;
    trust_status?: TrustStatus;
    partner_id?: string;
    [key: string]: any;
  };
  
  /** HMAC-SHA256 signature */
  signature: string;
}

