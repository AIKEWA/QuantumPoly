/**
 * @fileoverview Consent Metrics API
 * @module api/governance/consent-metrics
 * @see BLOCK9.3_TRANSPARENCY_FRAMEWORK.md
 *
 * Returns aggregated consent metrics (privacy-preserving)
 */

import { NextRequest, NextResponse } from 'next/server';

import { aggregateConsentMetrics } from '@/lib/governance/consent-aggregator';

/**
 * GET /api/governance/consent-metrics
 * Get aggregated consent metrics
 *
 * Privacy-preserving: No individual user data exposed
 */
export async function GET(_request: NextRequest) {
  try {
    const metrics = aggregateConsentMetrics('governance/consent/ledger.jsonl');

    // Build response
    const response = {
      metrics,
      timestamp: new Date().toISOString(),
      privacy: {
        note: 'All data is aggregated and anonymized. No individual user information is exposed.',
        compliance: ['GDPR Art. 5(1)(c)', 'DSG 2023 Art. 6'],
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Consent metrics API error:', error);
    return NextResponse.json(
      {
        metrics: {
          totalEvents: 0,
          totalUsers: 0,
          consentGiven: 0,
          consentRevoked: 0,
          consentUpdated: 0,
          categoryMetrics: {
            essential: { optIn: 0, optOut: 0, rate: 0 },
            analytics: { optIn: 0, optOut: 0, rate: 0 },
            performance: { optIn: 0, optOut: 0, rate: 0 },
          },
          timeSeriesData: [],
          lastUpdate: new Date().toISOString(),
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/governance/consent-metrics
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

