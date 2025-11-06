/**
 * @fileoverview Trust Proof Token Generation & Verification
 * @module lib/trust/token-generator
 * @see BLOCK9.7_TRUST_PROOF_FRAMEWORK.md
 *
 * Cryptographic token generation and verification for trust proofs.
 * Uses HMAC-SHA256 for signing and URL-safe base64 encoding.
 */

import crypto from 'crypto';

import {
  TrustProofToken,
  TrustProofTokenPayload,
  TrustProofConfig,
  TrustProofError,
  AttestationPayload,
} from './types';

/**
 * Default configuration
 * Can be overridden via environment variables
 */
const DEFAULT_CONFIG: TrustProofConfig = {
  secret: process.env.TRUST_PROOF_SECRET || 'default-dev-secret-change-in-production',
  expiryDays: parseInt(process.env.TRUST_PROOF_EXPIRY_DAYS || '90', 10),
  issuer: process.env.TRUST_PROOF_ISSUER || 'trust-attestation-service@quantumpoly',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://www.quantumpoly.ai',
  governanceBlock: '9.7',
  complianceStage: 'Stage VII — Trust Proof & Attestation',
};

/**
 * Get trust proof configuration
 */
export function getTrustProofConfig(): TrustProofConfig {
  return { ...DEFAULT_CONFIG };
}

/**
 * Generate HMAC-SHA256 signature for a payload
 */
function generateHMAC(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Verify HMAC-SHA256 signature
 */
function verifyHMAC(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = generateHMAC(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

/**
 * Encode payload to URL-safe base64
 */
export function encodeTrustToken(payload: TrustProofTokenPayload): string {
  const json = JSON.stringify(payload);
  return Buffer.from(json, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Decode URL-safe base64 to payload
 */
export function decodeTrustToken(encoded: string): TrustProofTokenPayload {
  try {
    // Add padding back
    const padded = encoded + '=='.slice(0, (4 - (encoded.length % 4)) % 4);
    // Replace URL-safe chars
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
    // Decode
    const json = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(json);
  } catch (error) {
    throw new TrustProofError(
      'Invalid token encoding',
      'INVALID_ENCODING',
      'invalid_token'
    );
  }
}

/**
 * Generate a trust proof token
 * 
 * @param artifactId - Unique identifier for the artifact
 * @param artifactHash - SHA-256 hash of the artifact
 * @param metadata - Optional metadata to include in the token
 * @returns Complete trust proof token with signature
 */
export function generateTrustToken(
  artifactId: string,
  artifactHash: string,
  metadata?: Record<string, unknown>
): TrustProofToken {
  const config = getTrustProofConfig();
  const now = new Date();
  const expiryDate = new Date(now.getTime() + config.expiryDays * 24 * 60 * 60 * 1000);

  const payload: TrustProofTokenPayload = {
    artifact_id: artifactId,
    artifact_hash: artifactHash,
    issued_at: now.toISOString(),
    issuer: config.issuer,
    governance_block: config.governanceBlock,
    ledger_reference: 'trust-proof-block9.7',
    compliance_stage: config.complianceStage,
    expires_at: expiryDate.toISOString(),
    metadata: metadata || {},
  };

  // Generate signature
  const payloadString = JSON.stringify(payload);
  const signature = generateHMAC(payloadString, config.secret);

  return {
    ...payload,
    signature,
  };
}

/**
 * Verify a trust proof token's signature and structure
 * 
 * @param token - The trust proof token to verify
 * @returns True if signature is valid and token structure is correct
 * @throws TrustProofError if verification fails
 */
export function verifyTrustToken(token: TrustProofToken): boolean {
  const config = getTrustProofConfig();

  // Validate required fields
  if (!token.artifact_id || !token.artifact_hash || !token.signature) {
    throw new TrustProofError(
      'Token missing required fields',
      'INVALID_TOKEN_STRUCTURE',
      'invalid_token'
    );
  }

  // Reconstruct payload without signature
  const { signature, ...payload } = token;
  const payloadString = JSON.stringify(payload);

  // Verify signature
  try {
    const isValid = verifyHMAC(payloadString, signature, config.secret);
    if (!isValid) {
      throw new TrustProofError(
        'Invalid token signature',
        'INVALID_SIGNATURE',
        'invalid_token'
      );
    }
  } catch (error) {
    if (error instanceof TrustProofError) throw error;
    throw new TrustProofError(
      'Signature verification failed',
      'VERIFICATION_ERROR',
      'invalid_token'
    );
  }

  // Check expiry
  const expiryDate = new Date(token.expires_at);
  const now = new Date();
  if (now > expiryDate) {
    throw new TrustProofError(
      'Token has expired',
      'TOKEN_EXPIRED',
      'expired'
    );
  }

  return true;
}

/**
 * Generate a compact attestation payload for QR codes
 * 
 * @param artifactId - Artifact identifier
 * @param artifactHash - Artifact hash
 * @returns Compact attestation payload
 */
export function generateAttestationPayload(
  artifactId: string,
  artifactHash: string
): AttestationPayload {
  const config = getTrustProofConfig();
  const now = Math.floor(Date.now() / 1000); // Unix timestamp

  // Create compact payload
  const compactPayload = `${artifactId}:${artifactHash.substring(0, 16)}:${now}`;
  const signature = generateHMAC(compactPayload, config.secret);

  return {
    rid: artifactId,
    sig: signature.substring(0, 32), // First 32 chars for QR space efficiency
    ts: now,
    h: artifactHash.substring(0, 16), // First 16 chars of hash
  };
}

/**
 * Verify an attestation payload from a QR code
 * 
 * @param payload - The attestation payload to verify
 * @param fullHash - The full artifact hash to compare against
 * @returns True if payload is valid
 */
export function verifyAttestationPayload(
  payload: AttestationPayload,
  fullHash: string
): boolean {
  const config = getTrustProofConfig();

  // Reconstruct the compact payload
  const compactPayload = `${payload.rid}:${payload.h}:${payload.ts}`;
  const expectedSig = generateHMAC(compactPayload, config.secret).substring(0, 32);

  // Verify signature
  if (payload.sig !== expectedSig) {
    throw new TrustProofError(
      'Invalid attestation signature',
      'INVALID_ATTESTATION',
      'invalid_token'
    );
  }

  // Verify hash prefix matches
  if (payload.h !== fullHash.substring(0, 16)) {
    throw new TrustProofError(
      'Hash mismatch in attestation',
      'HASH_MISMATCH',
      'mismatch'
    );
  }

  // Check timestamp is not too old (90 days)
  const now = Math.floor(Date.now() / 1000);
  const maxAge = config.expiryDays * 24 * 60 * 60;
  if (now - payload.ts > maxAge) {
    throw new TrustProofError(
      'Attestation has expired',
      'ATTESTATION_EXPIRED',
      'expired'
    );
  }

  return true;
}

/**
 * Create a verification URL for an artifact
 * 
 * @param artifactId - Artifact identifier
 * @param signature - Signature to include in URL
 * @returns Full verification URL
 */
export function createVerificationURL(artifactId: string, signature: string): string {
  const config = getTrustProofConfig();
  return `${config.baseUrl}/api/trust/proof?rid=${encodeURIComponent(artifactId)}&sig=${encodeURIComponent(signature)}`;
}

/**
 * Parse verification URL parameters
 * 
 * @param url - The verification URL or query string
 * @returns Parsed artifact ID and signature
 */
export function parseVerificationURL(url: string): { rid: string; sig: string } {
  try {
    const urlObj = new URL(url);
    const rid = urlObj.searchParams.get('rid');
    const sig = urlObj.searchParams.get('sig');

    if (!rid || !sig) {
      throw new Error('Missing required parameters');
    }

    return { rid, sig };
  } catch (error) {
    throw new TrustProofError(
      'Invalid verification URL',
      'INVALID_URL',
      'invalid_token'
    );
  }
}

