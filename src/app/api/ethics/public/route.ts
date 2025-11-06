/**
 * @fileoverview Public Ethics API
 * @module api/ethics/public
 * @see BLOCK9.4_PUBLIC_ETHICS_API.md
 *
 * Exposes unified public ethics endpoint aggregating:
 * - Governance ledger summary
 * - Consent statistics
 * - Ethics Integrity Index (EII)
 * - Cryptographic verification proof
 * - System version
 *
 * This API provides real-time access to the platform's ethical state
 * for external auditors, regulators, and public transparency.
 */

import fs from 'fs';
import path from 'path';

import { NextRequest, NextResponse } from 'next/server';

import { aggregateConsentMetrics } from '@/lib/governance/consent-aggregator';
import { getCurrentEII, getEIIHistory } from '@/lib/governance/eii-calculator';
import { getRecentEntries, verifyLedgerIntegrity } from '@/lib/governance/ledger-parser';

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
 * GET /api/ethics/public
 * Public ethics transparency endpoint
 *
 * Returns unified view of platform's ethical state:
 * - Recent governance ledger entries
 * - Aggregated consent statistics
 * - Current and historical EII scores
 * - Cryptographic verification proof
 * - System version and compliance baseline
 *
 * Security:
 * - Read-only
 * - Rate limited (60 req/min per IP)
 * - CORS enabled for public access
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

    // 1. Get ledger summary (last 5 entries)
    let ledgerSummary: Array<{
      id: string;
      timestamp: string;
      type: string;
      block: string | null;
      title: string | null;
      status: string | null;
    }> = [];
    try {
      const entries = getRecentEntries(5);
      ledgerSummary = entries.map((entry) => ({
        id: entry.id,
        timestamp: entry.timestamp,
        type: entry.entryType || entry.ledger_entry_type || 'unknown',
        block: entry.blockId || entry.block_id || null,
        title: entry.title || null,
        status: entry.status || null,
      }));
    } catch (error) {
      console.error('Failed to fetch ledger summary:', error);
      ledgerSummary = [];
    }

    // 2. Get consent statistics (aggregated, privacy-preserving)
    let consentStats = { analytics: 0, performance: 0, essential: 1 };
    try {
      const metrics = aggregateConsentMetrics('governance/consent/ledger.jsonl');
      consentStats = {
        analytics: metrics.categoryMetrics.analytics?.rate || 0,
        performance: metrics.categoryMetrics.performance?.rate || 0,
        essential: metrics.categoryMetrics.essential?.rate || 1,
      };
    } catch (error) {
      console.error('Failed to fetch consent stats:', error);
    }

    // 3. Get EII score (current + 90-day average)
    let eiiScore = { current: 0, avg90d: 0, trend: 'stable' };
    try {
      const currentEII = getCurrentEII();
      const history = getEIIHistory('governance/ledger/ledger.jsonl', 90);
      eiiScore = {
        current: currentEII,
        avg90d: history.average || currentEII,
        trend: history.trend || 'stable',
      };
    } catch (error) {
      console.error('Failed to fetch EII score:', error);
    }

    // 4. Get hash proof (Merkle root from verification)
    let hashProof = '';
    let lastVerification = new Date().toISOString();
    try {
      const verification = verifyLedgerIntegrity('governance/ledger/ledger.jsonl');
      hashProof = verification.merkleRoot;
      const entries = getRecentEntries(1);
      if (entries.length > 0) {
        lastVerification = entries[0].timestamp;
      }
    } catch (error) {
      console.error('Failed to fetch hash proof:', error);
    }

    // 5. Get system version
    let systemVersion = 'unknown';
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      systemVersion = `Transparency Framework v${packageJson.version}`;
    } catch (error) {
      console.error('Failed to fetch system version:', error);
    }

    // Build response
    const response = {
      timestamp: new Date().toISOString(),
      ledger_summary: ledgerSummary,
      consent_stats: consentStats,
      eii_score: eiiScore,
      hash_proof: hashProof,
      last_verification: lastVerification,
      version: systemVersion,
      compliance_baseline: {
        blocks: ['8.8', '9.0', '9.1', '9.2', '9.3', '9.4', '9.5', '9.6'],
        regulations: ['GDPR 2016/679', 'DSG 2023', 'ePrivacy Directive'],
        status: 'operational',
        stage: 'Stage VI — Federated Transparency',
      },
      federation: {
        enabled: true,
        verification_url: '/api/federation/verify',
        trust_url: '/api/federation/trust',
      },
      privacy_notice: 'All data is aggregated and anonymized. No personal information is exposed.',
      verification_url: '/api/governance/verify',
      documentation_url: '/governance/dashboard',
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // 5 minutes
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Public API
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
        'X-RateLimit-Remaining': String(
          RATE_LIMIT_MAX - (rateLimitMap.get(ip)?.count || 0)
        ),
      },
    });
  } catch (error) {
    console.error('Public Ethics API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to generate ethics report',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/ethics/public
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

