/**
 * @fileoverview Trust Proof Verification Logic
 * @module lib/trust/proof-verifier
 * @see BLOCK9.7_TRUST_PROOF_FRAMEWORK.md
 *
 * Core verification logic for trust proofs.
 * Checks tokens against ledger entries, validates hashes, and determines proof status.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import { verifyTrustToken, verifyAttestationPayload, getTrustProofConfig } from './token-generator';
import {
  TrustProofToken,
  TrustProofResponse,
  TrustProofStatus,
  TrustProofError,
  RevokedProofRecord,
  ActiveProofRecord,
  AttestationPayload,
} from './types';
import { parseLedger } from '../integrity/ledger/reader';

/**
 * Ledger entry with flexible fields for artifact verification
 */
interface ArtifactLedgerEntry {
  entry_id?: string;
  id?: string;
  hash?: string;
  pdf_hash?: string;
  documents?: string[];
  [key: string]: unknown;
}

/**
 * Type guard to check if object is a valid ledger entry
 */
function isArtifactLedgerEntry(obj: unknown): obj is ArtifactLedgerEntry {
  return typeof obj === 'object' && obj !== null;
}

/**
 * Get artifact entry from governance ledger
 *
 * @param artifactId - The artifact identifier to search for
 * @returns Ledger entry or null if not found
 */
export function getArtifactFromLedger(artifactId: string): ArtifactLedgerEntry | null {
  try {
    const ledgerPath = path.join(process.cwd(), 'governance', 'ledger', 'ledger.jsonl');
    const entries = parseLedger(ledgerPath);

    // Search for entry matching artifact ID
    const entry = entries.find((e: unknown) => {
      if (!isArtifactLedgerEntry(e)) {
        return false;
      }

      // Check if this is an ethics report entry
      if (e.entry_id === artifactId || e.id === artifactId) {
        return true;
      }

      // Check documents array for matching report
      if (e.documents && Array.isArray(e.documents)) {
        return e.documents.some((doc: string) => doc.includes(artifactId));
      }

      return false;
    });

    return isArtifactLedgerEntry(entry) ? entry : null;
  } catch (error) {
    console.error('[Trust Proof] Error reading ledger:', error);
    return null;
  }
}

/**
 * Validate artifact hash against ledger entry
 *
 * @param declaredHash - Hash from the trust token
 * @param ledgerEntry - Ledger entry containing the artifact
 * @returns True if hashes match
 */
export function validateArtifactHash(
  declaredHash: string,
  ledgerEntry: ArtifactLedgerEntry | null,
): boolean {
  if (!ledgerEntry) {
    return false;
  }

  // Check if ledger entry has a hash field
  if (typeof ledgerEntry.hash === 'string') {
    return ledgerEntry.hash === declaredHash;
  }

  // Check if ledger entry has a pdf_hash field (for reports)
  if (typeof ledgerEntry.pdf_hash === 'string') {
    return ledgerEntry.pdf_hash === declaredHash;
  }

  // If no hash in ledger, we cannot verify
  return false;
}

/**
 * Check if a proof has been revoked
 *
 * @param artifactId - Artifact identifier
 * @returns Revocation record if found, null otherwise
 */
export function checkRevocation(artifactId: string): RevokedProofRecord | null {
  try {
    const revokedPath = path.join(
      process.cwd(),
      'governance',
      'trust-proofs',
      'revoked-proofs.jsonl',
    );

    if (!fs.existsSync(revokedPath)) {
      return null;
    }

    const content = fs.readFileSync(revokedPath, 'utf-8');
    const lines = content
      .trim()
      .split('\n')
      .filter((line) => line.trim());

    for (const line of lines) {
      try {
        const record: RevokedProofRecord = JSON.parse(line);
        if (record.artifact_id === artifactId) {
          return record;
        }
      } catch (error) {
        console.error('[Trust Proof] Error parsing revoked proof:', error);
      }
    }

    return null;
  } catch (error) {
    console.error('[Trust Proof] Error checking revocation:', error);
    return null;
  }
}

/**
 * Get active proof record
 *
 * @param artifactId - Artifact identifier
 * @returns Active proof record if found, null otherwise
 */
export function getActiveProof(artifactId: string): ActiveProofRecord | null {
  try {
    const activePath = path.join(
      process.cwd(),
      'governance',
      'trust-proofs',
      'active-proofs.jsonl',
    );

    if (!fs.existsSync(activePath)) {
      return null;
    }

    const content = fs.readFileSync(activePath, 'utf-8');
    const lines = content
      .trim()
      .split('\n')
      .filter((line) => line.trim());

    for (const line of lines) {
      try {
        const record: ActiveProofRecord = JSON.parse(line);
        if (record.artifact_id === artifactId) {
          return record;
        }
      } catch (error) {
        console.error('[Trust Proof] Error parsing active proof:', error);
      }
    }

    return null;
  } catch (error) {
    console.error('[Trust Proof] Error reading active proofs:', error);
    return null;
  }
}

/**
 * Check proof status
 *
 * @param token - Trust proof token
 * @returns Proof status
 */
export function checkProofStatus(token: TrustProofToken): TrustProofStatus {
  // Check if revoked
  const revocation = checkRevocation(token.artifact_id);
  if (revocation) {
    return 'revoked';
  }

  // Check if expired
  const expiryDate = new Date(token.expires_at);
  const now = new Date();
  if (now > expiryDate) {
    return 'expired';
  }

  // Check if artifact exists in ledger
  const ledgerEntry = getArtifactFromLedger(token.artifact_id);
  if (!ledgerEntry) {
    return 'not_found';
  }

  // Validate hash
  const hashValid = validateArtifactHash(token.artifact_hash, ledgerEntry);
  if (!hashValid) {
    return 'mismatch';
  }

  return 'valid';
}

/**
 * Verify artifact proof (main verification function)
 *
 * @param token - Trust proof token to verify
 * @returns Trust proof response with verification result
 */
export function verifyArtifactProof(token: TrustProofToken): TrustProofResponse {
  const config = getTrustProofConfig();
  const now = new Date().toISOString();

  try {
    // Step 1: Verify token signature and structure
    verifyTrustToken(token);

    // Step 2: Check proof status
    const status = checkProofStatus(token);

    // Step 3: Get additional context
    const revocation = status === 'revoked' ? checkRevocation(token.artifact_id) : null;
    const ledgerEntry = getArtifactFromLedger(token.artifact_id);

    // Step 4: Build response
    const response: TrustProofResponse = {
      artifact_id: token.artifact_id,
      hash_algorithm: 'SHA-256',
      artifact_hash: token.artifact_hash,
      issued_at: token.issued_at,
      issuer: token.issuer,
      governance_block: token.governance_block,
      ledger_reference: token.ledger_reference,
      compliance_stage: token.compliance_stage,
      status,
      notes: getStatusNotes(status, ledgerEntry, revocation),
      verified_at: now,
      expires_at: token.expires_at,
    };

    // Add revocation details if applicable
    if (revocation) {
      response.revocation_reason = revocation.reason;
      response.revoked_at = revocation.revoked_at;
    }

    return response;
  } catch (error) {
    if (error instanceof TrustProofError) {
      return {
        artifact_id: token.artifact_id || 'unknown',
        hash_algorithm: 'SHA-256',
        artifact_hash: token.artifact_hash || 'unknown',
        issued_at: token.issued_at || now,
        issuer: token.issuer || config.issuer,
        governance_block: token.governance_block || config.governanceBlock,
        ledger_reference: token.ledger_reference || 'trust-proof-block9.7',
        compliance_stage: token.compliance_stage || config.complianceStage,
        status: error.status,
        notes: error.message,
        verified_at: now,
      };
    }

    // Unknown error
    return {
      artifact_id: token.artifact_id || 'unknown',
      hash_algorithm: 'SHA-256',
      artifact_hash: token.artifact_hash || 'unknown',
      issued_at: token.issued_at || now,
      issuer: config.issuer,
      governance_block: config.governanceBlock,
      ledger_reference: 'trust-proof-block9.7',
      compliance_stage: config.complianceStage,
      status: 'unverified',
      notes: 'Verification failed due to system error',
      verified_at: now,
    };
  }
}

/**
 * Verify artifact proof by attestation payload (from QR code)
 *
 * @param payload - Attestation payload from QR code
 * @returns Trust proof response
 */
export function verifyArtifactProofByAttestation(payload: AttestationPayload): TrustProofResponse {
  const config = getTrustProofConfig();
  const now = new Date().toISOString();

  try {
    // Get active proof record
    const activeProof = getActiveProof(payload.rid);
    if (!activeProof) {
      throw new TrustProofError(
        'No active proof found for this artifact',
        'NOT_FOUND',
        'not_found',
      );
    }

    // Verify attestation payload
    verifyAttestationPayload(payload, activeProof.artifact_hash);

    // Check if revoked
    const revocation = checkRevocation(payload.rid);
    if (revocation) {
      return {
        artifact_id: payload.rid,
        hash_algorithm: 'SHA-256',
        artifact_hash: activeProof.artifact_hash,
        issued_at: activeProof.issued_at,
        issuer: config.issuer,
        governance_block: config.governanceBlock,
        ledger_reference: activeProof.ledger_reference,
        compliance_stage: config.complianceStage,
        status: 'revoked',
        notes: `Proof has been revoked: ${revocation.reason}`,
        verified_at: now,
        revocation_reason: revocation.reason,
        revoked_at: revocation.revoked_at,
      };
    }

    // Check expiry
    const expiryDate = new Date(activeProof.expires_at);
    if (new Date() > expiryDate) {
      return {
        artifact_id: payload.rid,
        hash_algorithm: 'SHA-256',
        artifact_hash: activeProof.artifact_hash,
        issued_at: activeProof.issued_at,
        issuer: config.issuer,
        governance_block: config.governanceBlock,
        ledger_reference: activeProof.ledger_reference,
        compliance_stage: config.complianceStage,
        status: 'expired',
        notes: 'Proof has expired',
        verified_at: now,
        expires_at: activeProof.expires_at,
      };
    }

    // Valid proof
    return {
      artifact_id: payload.rid,
      hash_algorithm: 'SHA-256',
      artifact_hash: activeProof.artifact_hash,
      issued_at: activeProof.issued_at,
      issuer: config.issuer,
      governance_block: config.governanceBlock,
      ledger_reference: activeProof.ledger_reference,
      compliance_stage: config.complianceStage,
      status: 'valid',
      notes: 'Signature matches ledger entry and current key material.',
      verified_at: now,
      expires_at: activeProof.expires_at,
    };
  } catch (error) {
    if (error instanceof TrustProofError) {
      return {
        artifact_id: payload.rid,
        hash_algorithm: 'SHA-256',
        artifact_hash: payload.h || 'unknown',
        issued_at: new Date(payload.ts * 1000).toISOString(),
        issuer: config.issuer,
        governance_block: config.governanceBlock,
        ledger_reference: 'trust-proof-block9.7',
        compliance_stage: config.complianceStage,
        status: error.status,
        notes: error.message,
        verified_at: now,
      };
    }

    return {
      artifact_id: payload.rid,
      hash_algorithm: 'SHA-256',
      artifact_hash: payload.h || 'unknown',
      issued_at: new Date(payload.ts * 1000).toISOString(),
      issuer: config.issuer,
      governance_block: config.governanceBlock,
      ledger_reference: 'trust-proof-block9.7',
      compliance_stage: config.complianceStage,
      status: 'unverified',
      notes: 'Verification failed due to system error',
      verified_at: now,
    };
  }
}

/**
 * Get human-readable notes for a status
 */
function getStatusNotes(
  status: TrustProofStatus,
  ledgerEntry: ArtifactLedgerEntry | null,
  revocation: RevokedProofRecord | null,
): string {
  switch (status) {
    case 'valid':
      return 'Signature matches ledger entry and current key material.';
    case 'expired':
      return 'Proof has expired. The artifact may still be valid, but the attestation is stale.';
    case 'revoked':
      return revocation
        ? `Proof has been revoked: ${revocation.reason}`
        : 'Proof has been revoked.';
    case 'mismatch':
      return 'Artifact hash does not match ledger entry. The artifact may have been tampered with.';
    case 'not_found':
      return 'Artifact not found in governance ledger. This may be a forged proof.';
    case 'invalid_token':
      return 'Token signature is invalid or token structure is malformed.';
    case 'unverified':
      return 'Unable to verify proof due to system error.';
    default:
      return 'Unknown verification status.';
  }
}

/**
 * Compute SHA-256 hash of a file
 *
 * @param filePath - Path to the file
 * @returns SHA-256 hash as hex string
 */
export function computeFileHash(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}
