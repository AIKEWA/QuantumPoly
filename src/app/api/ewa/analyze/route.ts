/**
 * @fileoverview EWA Manual Analysis Trigger API
 * @module app/api/ewa/analyze
 * @see BLOCK9.5_ETHICAL_AUTONOMY.md
 *
 * Manual trigger endpoint for on-demand EWA v2 analysis
 */

import { NextResponse } from 'next/server';

import { runAnalysis } from '@/lib/ewa/engine';
import { generateRecommendations } from '@/lib/ewa/recommendations';

/**
 * Rate limiting configuration (stricter for manual trigger)
 */
const RATE_LIMIT = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5, // 5 requests per hour
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
 * POST /api/ewa/analyze
 * Manually trigger EWA v2 analysis
 */
export async function POST(request: Request) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Maximum 5 requests per hour.' },
      { status: 429 }
    );
  }

  // Optional API key authentication
  const apiKey = request.headers.get('x-api-key');
  const expectedApiKey = process.env.EWA_ANALYZE_API_KEY;

  if (expectedApiKey && apiKey !== expectedApiKey) {
    return NextResponse.json(
      { error: 'Unauthorized. Valid API key required.' },
      { status: 401 }
    );
  }

  try {
    // Parse request body
    const body = await request.json().catch(() => ({}));
    const { dry_run = false, enable_ml = false } = body;

    console.log('🔍 Manual EWA v2 analysis triggered');
    console.log(`   Dry Run: ${dry_run}`);
    console.log(`   ML Enabled: ${enable_ml}`);

    // Run analysis
    const result = await runAnalysis({
      governanceLedgerPath: 'governance/ledger/ledger.jsonl',
      consentLedgerPath: 'governance/consent/ledger.jsonl',
      enableML: enable_ml,
      dryRun: dry_run,
    });

    // Generate recommendations
    const recommendations = generateRecommendations(
      result.insights,
      result.statistical
    );

    // Summary statistics
    const criticalInsights = result.insights.filter(
      (i) => i.severity === 'critical'
    );
    const requiresReview = result.insights.filter(
      (i) => i.requires_human_review
    );

    return NextResponse.json(
      {
        success: true,
        timestamp: result.timestamp,
        dry_run,
        summary: {
          tti_score: result.trust_trajectory.tti_score,
          tti_trend: result.trust_trajectory.trend,
          total_insights: result.insights.length,
          critical_insights: criticalInsights.length,
          requires_review: requiresReview.length,
          total_recommendations: recommendations.length,
        },
        insights: result.insights,
        recommendations,
        trust_trajectory: result.trust_trajectory,
        statistical_analysis: result.statistical,
        ml_analysis: result.ml || null,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
        },
      }
    );
  } catch (error) {
    console.error('Failed to run manual analysis:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Analysis failed',
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
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
      },
    }
  );
}

