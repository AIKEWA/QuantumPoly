/**
 * @fileoverview Ethics Summary API
 * @module api/ethics/summary
 * @see BLOCK10.2_TRANSPARENCY_API_AND_PORTAL.md
 *
 * Public API endpoint providing summarized governance ledger information
 */

import { NextResponse } from 'next/server';

import { getGovernanceSummary } from '@/lib/governance/summary';

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
    const summary = await getGovernanceSummary();

    return NextResponse.json(summary, {
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
