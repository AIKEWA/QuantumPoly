/**
 * @fileoverview Ethics Summary API
 * @module api/ethics/summary
 * @see BLOCK10.2_TRANSPARENCY_API_AND_PORTAL.md
 *
 * Public API endpoint providing summarized governance ledger information
 */

import { NextResponse } from 'next/server';

import { verifyIntegrityLedger, getIntegrityLedger } from '@/lib/integrity';

/**
 * GET /api/ethics/summary
 * Returns summary of governance ledger (blocks, hash chain, latest changes)
 *
 * Response schema:
 * {
 *   "latest": "block-id",
 *   "merkle_root": "hash",
 *   "verified": boolean,
 *   "totalEntries": number,
 *   "lastUpdate": "ISO-timestamp",
 *   "blocks": ["block-id", ...]
 * }
 */
export async function GET() {
  try {
    // Verify ledger integrity
    const result = verifyIntegrityLedger('governance/ledger/ledger.jsonl');

    // Parse full ledger for block list
    const entries = getIntegrityLedger('governance/ledger/ledger.jsonl');

    // Extract block IDs in order
    const blocks = entries.map(
      (entry) => entry.blockId || entry.block_id || entry.id || entry.entry_id || 'unknown',
    );

    // Determine latest block
    const latestEntry = entries[entries.length - 1];
    const latestBlock = latestEntry?.id || latestEntry?.entry_id || 'unknown';

    // Get recent changes (last 5 entries)
    const recentChanges = entries
      .slice(-5)
      .reverse()
      .map((entry) => ({
        block: entry.blockId || entry.block_id || entry.id || entry.entry_id,
        timestamp: entry.timestamp,
        entryType: entry.entryType || entry.ledger_entry_type || 'unknown',
        title: entry.title || (entry.summary as string)?.substring(0, 80) || 'No title',
      }));

    // Build response
    const response = {
      latest: latestBlock,
      merkle_root: result.merkleRoot,
      verified: result.verified,
      totalEntries: result.totalEntries,
      lastUpdate: result.lastUpdate,
      blocks,
      recentChanges,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300',
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  } catch (error) {
    console.error('Ethics Summary API error:', error);
    return NextResponse.json(
      {
        latest: 'unknown',
        merkle_root: '',
        verified: false,
        totalEntries: 0,
        lastUpdate: new Date().toISOString(),
        blocks: [],
        recentChanges: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

/**
 * OPTIONS /api/ethics/summary
 * CORS preflight handler
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
