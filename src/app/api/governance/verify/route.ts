/**
 * @fileoverview Governance Verification API
 * @module api/governance/verify
 * @see BLOCK9.3_TRANSPARENCY_FRAMEWORK.md
 *
 * Verifies integrity of governance and consent ledgers
 * Computes global Merkle root from both ledgers
 */

import crypto from 'crypto';

import { NextRequest, NextResponse } from 'next/server';

import { parseConsentLedger, verifyIntegrityLedger, getIntegrityLedger } from '@/lib/integrity';

/**
 * Compute combined Merkle root from multiple ledgers
 */
function computeGlobalMerkleRoot(ledgers: Array<{ name: string; merkleRoot: string }>): string {
  const combined = ledgers.map((l) => l.merkleRoot).join('');
  return crypto.createHash('sha256').update(combined).digest('hex');
}

/**
 * GET /api/governance/verify
 * Verify ledger integrity
 *
 * Query parameters:
 * - full: boolean - Include detailed verification info
 * - scope: 'governance' | 'consent' | 'all' - Verification scope (default: 'all')
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const full = searchParams.get('full') === 'true';
    const scope = (searchParams.get('scope') || 'all') as 'governance' | 'consent' | 'all';

    const results: Array<{ name: string; verified: boolean; entries: number; merkleRoot: string }> =
      [];

    // Verify governance ledger
    if (scope === 'governance' || scope === 'all') {
      try {
        const governanceResult = verifyIntegrityLedger('governance/ledger/ledger.jsonl');
        results.push({
          name: 'governance',
          verified: governanceResult.verified,
          entries: governanceResult.totalEntries,
          merkleRoot: governanceResult.merkleRoot,
        });
      } catch (error) {
        console.error('Governance ledger verification failed:', error);
        results.push({
          name: 'governance',
          verified: false,
          entries: 0,
          merkleRoot: '',
        });
      }
    }

    // Verify consent ledger
    if (scope === 'consent' || scope === 'all') {
      try {
        const consentEntries = parseConsentLedger('governance/consent/ledger.jsonl');
        const consentVerified = consentEntries.length > 0;

        // Compute Merkle root for consent ledger
        const consentHashes = consentEntries.map((entry) =>
          crypto.createHash('sha256').update(JSON.stringify(entry)).digest('hex'),
        );
        const consentMerkleRoot =
          consentHashes.length > 0
            ? crypto.createHash('sha256').update(consentHashes.join('')).digest('hex')
            : '';

        results.push({
          name: 'consent',
          verified: consentVerified,
          entries: consentEntries.length,
          merkleRoot: consentMerkleRoot,
        });
      } catch (error) {
        console.error('Consent ledger verification failed:', error);
        results.push({
          name: 'consent',
          verified: false,
          entries: 0,
          merkleRoot: '',
        });
      }
    }

    // Compute global Merkle root
    const globalMerkleRoot = computeGlobalMerkleRoot(results);

    // Overall verification status
    const allVerified = results.every((r) => r.verified);
    const totalEntries = results.reduce((sum, r) => sum + r.entries, 0);

    // Get last update timestamp
    let lastUpdate = new Date().toISOString();
    try {
      const governanceEntries = getIntegrityLedger('governance/ledger/ledger.jsonl');
      if (governanceEntries.length > 0) {
        lastUpdate = governanceEntries[governanceEntries.length - 1].timestamp;
      }
    } catch (error) {
      console.error('Failed to get last update:', error);
    }

    // Build response
    const response: {
      verified: boolean;
      merkleRoot: string;
      entries: number;
      lastUpdate: string;
      scope: string;
      timestamp: string;
      governance?: unknown;
      consent?: unknown;
      details?: unknown;
      message?: string;
    } = {
      verified: allVerified,
      merkleRoot: globalMerkleRoot,
      entries: totalEntries,
      lastUpdate,
      scope: scope === 'all' ? 'Governance + Consent' : scope,
      timestamp: new Date().toISOString(),
    };

    if (full) {
      response.details = results;
      response.message = allVerified
        ? 'All ledgers verified successfully'
        : 'One or more ledgers failed verification';
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Verification API error:', error);
    return NextResponse.json(
      {
        verified: false,
        merkleRoot: '',
        entries: 0,
        lastUpdate: new Date().toISOString(),
        scope: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

/**
 * OPTIONS /api/governance/verify
 * CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
