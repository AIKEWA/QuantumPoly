/**
 * @fileoverview EWA Verification API
 * @module app/api/ewa/verify
 * @see BLOCK9.5_ETHICAL_AUTONOMY.md
 *
 * Public API endpoint for verifying autonomous_analysis ledger entries
 */

import crypto from 'crypto';

import { NextResponse } from 'next/server';

import { getIntegrityLedger } from '@/lib/integrity';

/**
 * GET /api/ewa/verify
 * Returns integrity proof for autonomous_analysis ledger entries
 */
export async function GET() {
  try {
    // Parse governance ledger
    const entries = getIntegrityLedger('governance/ledger/ledger.jsonl');

    // Filter autonomous_analysis entries
    const autonomousEntries = entries.filter((entry) => entry.entryType === 'autonomous_analysis');

    if (autonomousEntries.length === 0) {
      return NextResponse.json(
        {
          verified: true,
          total_entries: 0,
          message: 'No autonomous analysis entries found yet',
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=300',
            'Access-Control-Allow-Origin': '*',
          },
        },
      );
    }

    // Verify each entry's hash format
    const verificationResults = autonomousEntries.map((entry) => {
      const hashValid = /^[0-9a-f]{64}$/.test(entry.hash);
      const merkleRootValid = /^[0-9a-f]{64}$/.test(entry.merkleRoot);

      return {
        entry_id: entry.id,
        timestamp: entry.timestamp,
        hash_valid: hashValid,
        merkle_root_valid: merkleRootValid,
        has_signature: !!entry.signature,
        verified: hashValid && merkleRootValid,
      };
    });

    // Compute global Merkle root for autonomous entries
    const hashes = autonomousEntries.map((e) => e.hash);
    const globalMerkleRoot = computeGlobalMerkleRoot(hashes);

    // Get latest entry
    const latestEntry = autonomousEntries[autonomousEntries.length - 1];

    return NextResponse.json(
      {
        verified: verificationResults.every((r) => r.verified),
        total_entries: autonomousEntries.length,
        verification_results: verificationResults,
        global_merkle_root: globalMerkleRoot,
        latest_entry: {
          id: latestEntry.id,
          timestamp: latestEntry.timestamp,
          hash: latestEntry.hash,
          merkle_root: latestEntry.merkleRoot,
        },
        verification_timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      },
    );
  } catch (error) {
    console.error('Failed to verify autonomous analysis entries:', error);
    return NextResponse.json(
      {
        error: 'Verification failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

/**
 * Compute global Merkle root from array of hashes
 * @param hashes Array of SHA-256 hashes
 * @returns Global Merkle root
 */
function computeGlobalMerkleRoot(hashes: string[]): string {
  if (hashes.length === 0) return '';
  if (hashes.length === 1) return hashes[0];

  // Simple Merkle tree construction
  let currentLevel = hashes;

  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];

    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        // Combine pairs
        const combined = currentLevel[i] + currentLevel[i + 1];
        const hash = crypto.createHash('sha256').update(combined).digest('hex');
        nextLevel.push(hash);
      } else {
        // Odd one out, promote to next level
        nextLevel.push(currentLevel[i]);
      }
    }

    currentLevel = nextLevel;
  }

  return currentLevel[0];
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    },
  );
}
