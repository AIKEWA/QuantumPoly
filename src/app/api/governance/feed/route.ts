/**
 * @fileoverview Governance Feed API
 * @module api/governance/feed
 * @see BLOCK9.3_TRANSPARENCY_FRAMEWORK.md
 *
 * Returns recent governance ledger entries with filtering
 */

import { NextRequest, NextResponse } from 'next/server';

import {
  getRecentEntries,
  getEntriesByType,
  getEntriesByDateRange,
  type LedgerEntryType,
} from '@/lib/governance/ledger-parser';

/**
 * GET /api/governance/feed
 * Get recent governance ledger entries
 *
 * Query parameters:
 * - limit: number - Maximum entries to return (default: 10, max: 50)
 * - type: string - Filter by entry type
 * - startDate: string - Filter by start date (ISO format)
 * - endDate: string - Filter by end date (ISO format)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse parameters
    const limitParam = searchParams.get('limit');
    const limit = Math.min(parseInt(limitParam || '10', 10), 50);
    const type = searchParams.get('type') as LedgerEntryType | null;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let entries;

    // Apply filters
    if (startDate && endDate) {
      entries = getEntriesByDateRange(startDate, endDate);
    } else if (type) {
      entries = getEntriesByType(type);
    } else {
      entries = getRecentEntries(limit);
    }

    // Limit results
    const limitedEntries = entries.slice(0, limit);

    // Build response
    const response = {
      entries: limitedEntries,
      count: limitedEntries.length,
      total: entries.length,
      limit,
      filters: {
        type: type || null,
        startDate: startDate || null,
        endDate: endDate || null,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Public API
      },
    });
  } catch (error) {
    console.error('Feed API error:', error);
    return NextResponse.json(
      {
        entries: [],
        count: 0,
        total: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/governance/feed
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

