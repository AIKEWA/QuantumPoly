/**
 * @fileoverview Audit History API - Block 9.9
 * @module api/audit/history
 * @see BLOCK9.9_FINAL_AUDIT_AND_HANDOFF.md
 *
 * GET endpoint for sign-off history (public, no PII)
 */

import { NextRequest, NextResponse } from 'next/server';

import { getRecentPublicSignOffs } from '@/lib/audit/sign-off-manager';

/**
 * GET /api/audit/history
 * Returns recent sign-off history (public summaries only)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 50) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Limit must be between 1 and 50',
        },
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Get recent public sign-offs
    const signoffs = getRecentPublicSignOffs(limit);

    return NextResponse.json(
      {
        total: signoffs.length,
        limit,
        signoffs,
        privacy_notice:
          'This endpoint returns public summaries only. Reviewer names and sensitive notes are not exposed.',
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300, s-maxage=300', // 5 minutes
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        },
      }
    );
  } catch (error) {
    console.error('Failed to fetch audit history:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch audit history',
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * OPTIONS /api/audit/history
 * CORS preflight
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

