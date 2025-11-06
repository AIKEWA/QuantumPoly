/**
 * @fileoverview EWA Insights API
 * @module app/api/ewa/insights
 * @see BLOCK9.5_ETHICAL_AUTONOMY.md
 *
 * Public API endpoint for retrieving ethical insights
 */

import { NextResponse } from 'next/server';

import { runAnalysis } from '@/lib/ewa/engine';
import { sortInsightsByPriority } from '@/lib/ewa/insights';

/**
 * Rate limiting configuration
 */
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
};

// Simple in-memory rate limiting (production should use Redis/similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
    return true;
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * GET /api/ewa/insights
 * Returns latest ethical insights from EWA v2 analysis
 */
export async function GET(request: Request) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Maximum 60 requests per minute.' },
      { status: 429 }
    );
  }

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const severity = searchParams.get('severity') as
      | 'low'
      | 'moderate'
      | 'critical'
      | null;

    // Run analysis
    const result = await runAnalysis({
      governanceLedgerPath: 'governance/ledger/ledger.jsonl',
      consentLedgerPath: 'governance/consent/ledger.jsonl',
    });

    // Filter and sort insights
    let insights = sortInsightsByPriority(result.insights);

    if (severity) {
      insights = insights.filter((i) => i.severity === severity);
    }

    insights = insights.slice(0, limit);

    return NextResponse.json(
      {
        timestamp: result.timestamp,
        insights,
        total_count: result.insights.length,
        filtered_count: insights.length,
        trust_trajectory: result.trust_trajectory,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5 min cache
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error) {
    console.error('Failed to generate insights:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate insights',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
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
    }
  );
}

