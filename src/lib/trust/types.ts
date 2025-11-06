/**
 * @fileoverview Trust Proof Type Definitions
 * @module lib/trust/types
 * @see BLOCK9.7_TRUST_PROOF_FRAMEWORK.md
 *
 * Type definitions for the Ethical Trust Proof & Attestation Layer.
 * These types define the structure of trust tokens, verification responses,
 * and attestation payloads used throughout the trust proof system.
 */

/**
 * Trust Proof Token
 * 
 * Represents a cryptographically signed token that attests to the
 * authenticity and integrity of a published artifact.
 */
export interface TrustProofToken {
  /** Unique identifier for the artifact (e.g., "ETHICS_REPORT_2025-11-05") */
  artifact_id: string;
  
  /** SHA-256 hash of the artifact content */
  artifact_hash: string;
  
  /** ISO 8601 timestamp when the proof was generated */
  issued_at: string;
  
  /** Identifier of the issuing service */
  issuer: string;
  
  /** Governance block that activated this proof system */
  governance_block: string;
  
  /** Reference to the ledger entry that records this proof */
  ledger_reference: string;
  
  /** Current compliance stage of the system */
  compliance_stage: string;
  
  /** HMAC-SHA256 signature of the token payload */
  signature: string;
  
  /** Token expiry timestamp (ISO 8601) */
  expires_at: string;
  
  /** Optional metadata */
  metadata?: {
    report_type?: string;
    block_id?: string;
    version?: string;
  };
}

/**
 * Trust Proof Token Payload (before signing)
 */
export interface TrustProofTokenPayload {
  artifact_id: string;
  artifact_hash: string;
  issued_at: string;
  issuer: string;
  governance_block: string;
  ledger_reference: string;
  compliance_stage: string;
  expires_at: string;
  metadata?: Record<string, unknown>;
}

/**
 * Trust Proof Verification Status
 */
export type TrustProofStatus = 
  | 'valid'           // Signature matches, hash matches, not expired
  | 'expired'         // Token has passed expiry date
  | 'revoked'         // Proof has been explicitly revoked
  | 'mismatch'        // Artifact hash doesn't match ledger
  | 'not_found'       // Artifact not found in ledger
  | 'invalid_token'   // Token structure or signature invalid
  | 'unverified';     // Unable to verify (system error)

/**
 * Trust Proof Verification Response
 * 
 * Returned by /api/trust/proof endpoint
 */
export interface TrustProofResponse {
  /** Artifact identifier */
  artifact_id: string;
  
  /** Hash algorithm used (always SHA-256) */
  hash_algorithm: 'SHA-256';
  
  /** Artifact hash from the proof token */
  artifact_hash: string;
  
  /** When the proof was issued */
  issued_at: string;
  
  /** Issuing service identifier */
  issuer: string;
  
  /** Governance block reference */
  governance_block: string;
  
  /** Ledger entry that records this artifact */
  ledger_reference: string;
  
  /** Current compliance stage */
  compliance_stage: string;
  
  /** Verification status */
  status: TrustProofStatus;
  
  /** Human-readable notes about the verification */
  notes: string;
  
  /** Timestamp when verification was performed */
  verified_at: string;
  
  /** Token expiry date (if applicable) */
  expires_at?: string;
  
  /** Revocation reason (if status is 'revoked') */
  revocation_reason?: string;
  
  /** Revocation timestamp (if status is 'revoked') */
  revoked_at?: string;
}

/**
 * Attestation Payload for QR Code
 * 
 * Compact structure embedded in QR codes
 */
export interface AttestationPayload {
  /** Report/artifact identifier */
  rid: string;
  
  /** Cryptographic signature (HMAC-SHA256) */
  sig: string;
  
  /** Issued timestamp (Unix epoch seconds) */
  ts: number;
  
  /** Optional: artifact hash (first 16 chars for space efficiency) */
  h?: string;
}

/**
 * Trust Proof Configuration
 */
export interface TrustProofConfig {
  /** HMAC secret key for token signing */
  secret: string;
  
  /** Token expiry duration in days */
  expiryDays: number;
  
  /** Issuer identifier */
  issuer: string;
  
  /** Base URL for verification */
  baseUrl: string;
  
  /** Governance block reference */
  governanceBlock: string;
  
  /** Compliance stage */
  complianceStage: string;
}

/**
 * Revoked Proof Record
 * 
 * Stored in governance/trust-proofs/revoked-proofs.jsonl
 */
export interface RevokedProofRecord {
  /** Artifact identifier */
  artifact_id: string;
  
  /** Original proof token */
  original_token: string;
  
  /** Revocation timestamp */
  revoked_at: string;
  
  /** Reason for revocation */
  reason: string;
  
  /** Who authorized the revocation */
  revoked_by: string;
  
  /** Optional: replacement artifact ID */
  replacement_artifact_id?: string;
  
  /** Ledger entry recording the revocation */
  ledger_reference: string;
}

/**
 * Active Proof Record
 * 
 * Stored in governance/trust-proofs/active-proofs.jsonl
 */
export interface ActiveProofRecord {
  /** Artifact identifier */
  artifact_id: string;
  
  /** Artifact hash */
  artifact_hash: string;
  
  /** Proof token */
  token: string;
  
  /** Issued timestamp */
  issued_at: string;
  
  /** Expiry timestamp */
  expires_at: string;
  
  /** Ledger entry reference */
  ledger_reference: string;
  
  /** Proof status */
  status: 'active' | 'expired';
  
  /** Artifact type (e.g., "ethics_report", "federation_proof") */
  artifact_type: string;
  
  /** File path to the artifact */
  file_path: string;
}

/**
 * Trust Proof Error
 */
export class TrustProofError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: TrustProofStatus = 'unverified'
  ) {
    super(message);
    this.name = 'TrustProofError';
  }
}

