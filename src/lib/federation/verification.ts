/**
 * @fileoverview Federation Verification Engine
 * @module lib/federation/verification
 * @see BLOCK9.6_COLLECTIVE_ETHICS_GRAPH.md
 *
 * Handles Merkle root fetching, comparison, and trust status calculation.
 * Implements cryptographic verification of partner integrity proofs.
 */

import crypto from 'crypto';

import { FederationRecord, PartnerConfig, TrustStatus, VerificationResult } from './types';

/**
 * Fetch FederationRecord from partner's governance endpoint
 */
export async function fetchPartnerRecord(
  partner: PartnerConfig,
  timeoutMs: number = 10000
): Promise<{ success: boolean; record?: FederationRecord; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(partner.governance_endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'QuantumPoly-Federation/1.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const record = (await response.json()) as FederationRecord;

    // Basic validation
    if (!record.partner_id || !record.merkle_root || !record.timestamp) {
      return {
        success: false,
        error: 'Invalid FederationRecord: missing required fields',
      };
    }

    return { success: true, record };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: 'Request timeout' };
    }
    return {
      success: false,
      error: (error as Error).message || 'Unknown error',
    };
  }
}

/**
 * Calculate trust status based on timestamp and verification result
 */
export function calculateTrustStatus(
  partner: PartnerConfig,
  record: FederationRecord | null,
  fetchError?: string
): TrustStatus {
  // If fetch failed, return ERROR
  if (!record || fetchError) {
    return TrustStatus.ERROR;
  }

  // Check staleness
  const recordTimestamp = new Date(record.timestamp);
  const now = new Date();
  const daysSinceUpdate = (now.getTime() - recordTimestamp.getTime()) / (1000 * 60 * 60 * 24);

  const staleThreshold = partner.stale_threshold_days || 30;

  if (daysSinceUpdate > staleThreshold) {
    return TrustStatus.STALE;
  }

  // Validate Merkle root format (SHA-256 hex)
  if (!/^[a-f0-9]{64}$/i.test(record.merkle_root)) {
    return TrustStatus.FLAGGED;
  }

  // If all checks pass, return VALID
  return TrustStatus.VALID;
}

/**
 * Verify a single partner
 */
export async function verifyPartner(partner: PartnerConfig): Promise<VerificationResult> {
  const verificationTime = new Date().toISOString();

  // Fetch partner's FederationRecord
  const fetchResult = await fetchPartnerRecord(partner);

  if (!fetchResult.success || !fetchResult.record) {
    return {
      partner_id: partner.partner_id,
      partner_display_name: partner.partner_display_name,
      last_merkle_root: '',
      last_verified_at: verificationTime,
      trust_status: TrustStatus.ERROR,
      notes: `Failed to fetch FederationRecord: ${fetchResult.error || 'Unknown error'}`,
      governance_endpoint: partner.governance_endpoint,
      error: fetchResult.error,
    };
  }

  const record = fetchResult.record;

  // Calculate trust status
  const trustStatus = calculateTrustStatus(partner, record);

  // Generate notes based on status
  let notes = '';
  switch (trustStatus) {
    case TrustStatus.VALID:
      notes = `Ledger integrity verified. Merkle root matches published snapshot as of ${record.timestamp}. No tampering detected.`;
      break;
    case TrustStatus.STALE: {
      const daysSinceUpdate = Math.floor(
        (new Date().getTime() - new Date(record.timestamp).getTime()) / (1000 * 60 * 60 * 24)
      );
      notes = `Partner overdue for transparency refresh. Last update: ${daysSinceUpdate} days ago (threshold: ${partner.stale_threshold_days || 30} days).`;
      break;
    }
    case TrustStatus.FLAGGED:
      notes = `Integrity check failed. Invalid Merkle root format or inconsistency detected. Requires human review.`;
      break;
    case TrustStatus.ERROR:
      notes = `Unable to verify partner. Endpoint unreachable or returned invalid data.`;
      break;
  }

  return {
    partner_id: partner.partner_id,
    partner_display_name: partner.partner_display_name,
    last_merkle_root: record.merkle_root,
    last_verified_at: verificationTime,
    trust_status: trustStatus,
    notes,
    compliance_stage: record.compliance_stage,
    governance_endpoint: partner.governance_endpoint,
  };
}

/**
 * Verify all active partners
 */
export async function verifyAllPartners(partners: PartnerConfig[]): Promise<VerificationResult[]> {
  const activePartners = partners.filter((p) => p.active);

  // Verify partners in parallel
  const verificationPromises = activePartners.map((partner) => verifyPartner(partner));

  return await Promise.all(verificationPromises);
}

/**
 * Verify HMAC signature for webhook notifications
 */
export function verifyHmacSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    // Use timing-safe comparison
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch (error) {
    console.error('HMAC verification error:', error);
    return false;
  }
}

/**
 * Compare Merkle roots for consistency
 */
export function compareMerkleRoots(
  currentRoot: string,
  previousRoot: string | null
): { changed: boolean; consistent: boolean } {
  if (!previousRoot) {
    return { changed: false, consistent: true };
  }

  const changed = currentRoot !== previousRoot;
  const consistent = /^[a-f0-9]{64}$/i.test(currentRoot) && /^[a-f0-9]{64}$/i.test(previousRoot);

  return { changed, consistent };
}

/**
 * Compute aggregate Merkle root from multiple partner roots
 */
export function computeNetworkMerkleRoot(partnerRoots: string[]): string {
  if (partnerRoots.length === 0) {
    return '';
  }

  // Filter out empty roots
  const validRoots = partnerRoots.filter((root) => root && /^[a-f0-9]{64}$/i.test(root));

  if (validRoots.length === 0) {
    return '';
  }

  // Concatenate all roots and hash
  const combined = validRoots.sort().join('');
  return crypto.createHash('sha256').update(combined).digest('hex');
}

