/**
 * @fileoverview EWA Recommendations API
 * @module app/api/ewa/recommendations
 * @see BLOCK9.5_ETHICAL_AUTONOMY.md
 *
 * Public API endpoint for retrieving actionable recommendations
 */

import { NextResponse } from 'next/server';

import { runAnalysis } from '@/lib/ewa/engine';
import {
  generateRecommendations,
  getTopRecommendations,
  generateExecutiveSummary,
} from '@/lib/ewa/recommendations';

/**
 * Rate limiting configuration
 */
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60,
};

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
 * GET /api/ewa/recommendations
 * Returns actionable recommendations based on current governance state
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
    const limit = parseInt(searchParams.get('limit') || '5', 10);
    const priority = searchParams.get('priority') as
      | 'high'
      | 'medium'
      | 'low'
      | null;

    // Run analysis
    const result = await runAnalysis({
      governanceLedgerPath: 'governance/ledger/ledger.jsonl',
      consentLedgerPath: 'governance/consent/ledger.jsonl',
    });

    // Generate recommendations
    let recommendations = generateRecommendations(
      result.insights,
      result.statistical
    );

    // Filter by priority if specified
    if (priority) {
      recommendations = recommendations.filter((r) => r.priority === priority);
    }

    // Get top recommendations
    const topRecommendations = getTopRecommendations(recommendations, limit);

    // Generate executive summary
    const executiveSummary = generateExecutiveSummary(recommendations);

    return NextResponse.json(
      {
        timestamp: result.timestamp,
        executive_summary: executiveSummary,
        recommendations: topRecommendations,
        total_count: recommendations.length,
        filtered_count: topRecommendations.length,
        trust_trajectory: result.trust_trajectory,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error) {
    console.error('Failed to generate recommendations:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate recommendations',
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

