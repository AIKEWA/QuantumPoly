/**
 * @fileoverview Federation Trust API
 * @module api/federation/trust
 * @see BLOCK9.6_COLLECTIVE_ETHICS_GRAPH.md
 *
 * Returns network-level trust summary for federation health monitoring.
 * Public, read-only endpoint for dashboards and auditors.
 */

import { NextRequest, NextResponse } from 'next/server';

import { getActivePartners } from '@/lib/federation/partner-manager';
import { calculateNetworkTrust, calculateTrustScore, getNetworkHealthStatus } from '@/lib/federation/trust-calculator';
import { verifyAllPartners } from '@/lib/federation/verification';

/**
 * Rate limiting state (in-memory, simple implementation)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 60; // 60 requests per minute

/**
 * Simple rate limiter
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * GET /api/federation/trust
 * Get network-level trust summary
 *
 * Security:
 * - Read-only
 * - Rate limited (60 req/min per IP)
 * - CORS enabled for public access
 * - Cache: 5 minutes
 * - Zero personal data exposure
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Maximum 60 requests per minute allowed',
          retry_after: 60,
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // Get active partners
    const partners = getActivePartners();

    // Verify all partners
    const verificationResults = await verifyAllPartners(partners);

    // Calculate network trust summary
    const networkTrust = calculateNetworkTrust(verificationResults);
    const trustScore = calculateTrustScore(networkTrust);
    const healthStatus = getNetworkHealthStatus(networkTrust);

    // Build response
    const response = {
      timestamp: networkTrust.timestamp,
      total_partners: networkTrust.total_partners,
      valid_partners: networkTrust.valid_partners,
      stale_partners: networkTrust.stale_partners,
      flagged_partners: networkTrust.flagged_partners,
      error_partners: networkTrust.error_partners,
      network_merkle_aggregate: networkTrust.network_merkle_aggregate,
      trust_score: trustScore,
      health_status: healthStatus,
      compliance_baseline: networkTrust.compliance_baseline,
      notes: networkTrust.notes,
      privacy_notice: 'All data is aggregated. No personal information is exposed.',
      verification_url: '/api/federation/verify',
      documentation_url: '/governance/federation',
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // 5 minutes
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Public API
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
        'X-RateLimit-Remaining': String(RATE_LIMIT_MAX - (rateLimitMap.get(ip)?.count || 0)),
      },
    });
  } catch (error) {
    console.error('Federation trust API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to calculate network trust',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/federation/trust
 * CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

