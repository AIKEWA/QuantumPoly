/**
 * @fileoverview Federation Record API
 * @module api/federation/record
 * @see BLOCK9.6_COLLECTIVE_ETHICS_GRAPH.md
 *
 * Exposes this instance's FederationRecord for partner verification.
 * This endpoint is fetched by other federation partners.
 */

import { NextRequest, NextResponse } from 'next/server';

import { FederationRecord } from '@/lib/federation/types';
import { getIntegrityLedger } from '@/lib/integrity';

/**
 * Rate limiting state
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 120; // 120 requests per minute (higher for partner polling)

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
 * GET /api/federation/record
 * Get this instance's FederationRecord
 *
 * Returns the current governance state as a FederationRecord
 * that other partners can fetch and verify.
 *
 * Security:
 * - Read-only
 * - Rate limited (120 req/min per IP)
 * - CORS enabled for federation partners
 * - Cache: 10 minutes
 * - Zero personal data exposure
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Maximum 120 requests per minute allowed',
          retry_after: 60,
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
            'X-RateLimit-Remaining': '0',
          },
        },
      );
    }

    // Get latest governance ledger entry
    let merkleRoot = '';
    let timestamp = new Date().toISOString();
    let complianceStage = 'Stage VI — Federated Transparency';

    try {
      const ledgerEntries = getIntegrityLedger('governance/ledger/ledger.jsonl');
      if (ledgerEntries.length > 0) {
        const latestEntry = ledgerEntries[ledgerEntries.length - 1];
        merkleRoot = latestEntry.merkleRoot || '';
        timestamp = latestEntry.timestamp;

        // Determine compliance stage from latest block
        const blockId = latestEntry.blockId || latestEntry.block_id;
        if (blockId) {
          if (blockId >= '9.6') {
            complianceStage = 'Stage VI — Federated Transparency';
          } else if (blockId >= '9.5') {
            complianceStage = 'Stage V — Cognitive Governance';
          } else if (blockId >= '9.4') {
            complianceStage = 'Stage IV — Autonomous Accountability';
          }
        }
      }
    } catch (error) {
      console.error('Failed to read governance ledger:', error);
      // Continue with defaults
    }

    // Build FederationRecord
    const federationRecord: FederationRecord = {
      partner_id: 'quantumpoly.ai',
      partner_display_name: 'QuantumPoly',
      merkle_root: merkleRoot,
      timestamp: timestamp,
      compliance_stage: complianceStage,
      signature: null, // Optional: implement GPG signing
      hash_algorithm: 'SHA-256',
      governance_endpoint: 'https://quantumpoly.ai/api/ethics/public',
    };

    return NextResponse.json(federationRecord, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=600', // 10 minutes
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow federation partners
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
        'X-RateLimit-Remaining': String(RATE_LIMIT_MAX - (rateLimitMap.get(ip)?.count || 0)),
      },
    });
  } catch (error) {
    console.error('Federation record API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to generate FederationRecord',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

/**
 * OPTIONS /api/federation/record
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
