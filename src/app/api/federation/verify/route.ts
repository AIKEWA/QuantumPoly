/**
 * @fileoverview Federation Verification API
 * @module api/federation/verify
 * @see BLOCK9.6_COLLECTIVE_ETHICS_GRAPH.md
 *
 * Returns per-partner trust states with verification timestamps.
 * Public, read-only endpoint for external auditors and monitoring.
 */

import { NextRequest, NextResponse } from 'next/server';

import { getActivePartners } from '@/lib/federation/partner-manager';
import { verifyAllPartners } from '@/lib/federation/verification';

/**
 * Rate limiting state (in-memory, simple implementation)
 * Production: use Redis or similar
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
 * GET /api/federation/verify
 * Verify all federation partners and return trust states
 *
 * Query parameters:
 * - partner_id: string (optional) - Verify specific partner only
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const partnerIdFilter = searchParams.get('partner_id');

    // Get active partners
    let partners = getActivePartners();

    // Filter by partner_id if specified
    if (partnerIdFilter) {
      partners = partners.filter((p) => p.partner_id === partnerIdFilter);
      if (partners.length === 0) {
        return NextResponse.json(
          {
            error: 'Partner not found',
            message: `No active partner found with ID: ${partnerIdFilter}`,
          },
          { status: 404 }
        );
      }
    }

    // Verify all partners
    const verificationResults = await verifyAllPartners(partners);

    // Build response
    const response = {
      timestamp: new Date().toISOString(),
      total_partners: verificationResults.length,
      partners: verificationResults.map((result) => ({
        partner_id: result.partner_id,
        partner_display_name: result.partner_display_name,
        last_merkle_root: result.last_merkle_root,
        last_verified_at: result.last_verified_at,
        trust_status: result.trust_status,
        notes: result.notes,
        compliance_stage: result.compliance_stage,
        governance_endpoint: result.governance_endpoint,
      })),
      compliance_baseline: 'Stage VI — Federated Transparency',
      privacy_notice: 'All data is aggregated. No personal information is exposed.',
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
    console.error('Federation verification API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to verify federation partners',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/federation/verify
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

