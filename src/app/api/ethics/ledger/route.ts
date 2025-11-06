/**
 * @fileoverview Ethics Ledger API
 * @module api/ethics/ledger
 * @see BLOCK10.2_TRANSPARENCY_API_AND_PORTAL.md
 *
 * Public API endpoint exposing full governance ledger for transparency and verification
 */

import { NextRequest, NextResponse } from "next/server";

import { verifyLedgerIntegrity } from "@/lib/governance/ledger-parser";

/**
 * GET /api/ethics/ledger
 * Returns full public governance ledger with hashes, checksums, and signatures
 *
 * Query parameters:
 * - page: number - Page number for pagination (default: 1)
 * - limit: number - Entries per page (default: all, max: 100)
 *
 * Response schema:
 * {
 *   "entries": [...],
 *   "latest": "block-id",
 *   "merkle_root": "hash",
 *   "verified": boolean
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse pagination parameters (accepted but optional to enforce)
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "0", 10);

    // Verify and parse ledger
    const result = verifyLedgerIntegrity("governance/ledger/ledger.jsonl");

    // Apply pagination if requested
    let entries = result.entries;
    if (limit > 0) {
      const maxLimit = Math.min(limit, 100);
      const startIndex = (page - 1) * maxLimit;
      entries = entries.slice(startIndex, startIndex + maxLimit);
    }

    // Determine latest block ID
    const latestEntry = result.entries[result.entries.length - 1];
    const latestBlock = latestEntry?.id || latestEntry?.entry_id || "unknown";

    // Build parent map for hash chain continuity
    const entryMap = new Map(result.entries.map((e, idx) => [e.id || e.entry_id, idx]));
    
    // Build response with parent relationships
    const response = {
      entries: entries.map((entry) => {
        // Find parent (previous entry in chain)
        const entryId = entry.id || entry.entry_id;
        const globalIdx = entryMap.get(entryId);
        let parent: string | undefined;
        
        if (globalIdx !== undefined && globalIdx > 0) {
          const prevEntry = result.entries[globalIdx - 1];
          parent = prevEntry?.blockId || prevEntry?.block_id || prevEntry?.id || prevEntry?.entry_id;
        }
        
        return {
          block: entry.blockId || entry.block_id || entry.id || entry.entry_id,
          hash: entry.hash,
          timestamp: entry.timestamp,
          id: entry.id || entry.entry_id,
          merkleRoot: entry.merkleRoot,
          entryType: entry.entryType || entry.ledger_entry_type,
          commit: entry.commit || entry.commit_hash,
          parent,
          verified: entry.verified !== undefined ? entry.verified : result.verified,
        };
      }),
      latest: latestBlock,
      merkle_root: result.merkleRoot,
      verified: result.verified,
      totalEntries: result.totalEntries,
      returnedEntries: entries.length,
      page: limit > 0 ? page : 1,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=300",
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_SITE_URL || "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    });
  } catch (error) {
    console.error("Ethics Ledger API error:", error);
    return NextResponse.json(
      {
        entries: [],
        latest: "unknown",
        merkle_root: "",
        verified: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/ethics/ledger
 * CORS preflight handler
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_SITE_URL || "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

