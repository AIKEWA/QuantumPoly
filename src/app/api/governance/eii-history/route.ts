/**
 * @fileoverview EII History API
 * @module api/governance/eii-history
 * @see BLOCK9.3_TRANSPARENCY_FRAMEWORK.md
 *
 * Returns EII history with 90-day rolling average
 */

import { NextRequest, NextResponse } from 'next/server';

import {
  getIntegrityEIIHistory,
  getIntegrityCurrentEII,
  getIntegrityEIIBreakdown,
} from '@/lib/integrity';

/**
 * GET /api/governance/eii-history
 * Get EII history and metrics
 *
 * Query parameters:
 * - days: number - Number of days to include (default: 90)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const daysParam = searchParams.get('days');
    const days = parseInt(daysParam || '90', 10);

    // Get EII history
    const history = getIntegrityEIIHistory('governance/ledger/ledger.jsonl', days);

    // Get current EII and breakdown
    const currentEII = getIntegrityCurrentEII();
    const breakdown = getIntegrityEIIBreakdown();

    // Build response
    const response = {
      current: {
        eii: currentEII,
        breakdown,
      },
      history: {
        dataPoints: history.dataPoints,
        rollingAverage: history.rollingAverage,
        statistics: {
          average: history.average,
          min: history.min,
          max: history.max,
          trend: history.trend,
        },
      },
      period: {
        days,
        startDate: history.dataPoints[0]?.date || null,
        endDate: history.dataPoints[history.dataPoints.length - 1]?.date || null,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('EII history API error:', error);
    return NextResponse.json(
      {
        current: { eii: 0, breakdown: {} },
        history: {
          dataPoints: [],
          rollingAverage: [],
          statistics: { average: 0, min: 0, max: 0, trend: 'stable' },
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

/**
 * OPTIONS /api/governance/eii-history
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
