/**
 * @fileoverview Public Integrity Status API
 * @module api/integrity/status
 * @see BLOCK9.8_CONTINUOUS_INTEGRITY.md
 *
 * Public read-only endpoint exposing current governance integrity health.
 * Returns system state, ledger status, open issues, and recent repairs.
 */

import fs from 'fs';
import path from 'path';

import { NextRequest, NextResponse } from 'next/server';

import { getRecentRepairs, getPendingRepairs, countOpenIssues } from '@/lib/integrity/repair-manager';
import { type IntegrityStatusResponse, type LedgerHealth } from '@/lib/integrity/types';

/**
 * Rate limiting state (in-memory)
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
 * Get latest integrity report
 */
function getLatestReport(): unknown | null {
  const reportsDir = path.join(process.cwd(), 'governance/integrity/reports');
  
  if (!fs.existsSync(reportsDir)) {
    return null;
  }

  const files = fs.readdirSync(reportsDir)
    .filter(f => f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    return null;
  }

  const latestFile = path.join(reportsDir, files[0]);
  const content = fs.readFileSync(latestFile, 'utf8');
  
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Determine system state from report
 */
function determineSystemState(report: unknown, pendingCount: number): 'healthy' | 'degraded' | 'attention_required' {
  if (!report) {
    return 'attention_required';
  }

  // Critical if any ledger is critical
  const ledgerStatus = (report && typeof report === 'object' && 'ledger_status' in report) 
    ? (report.ledger_status as Record<string, unknown>) 
    : {};
  if (
    ledgerStatus.governance === 'critical' ||
    ledgerStatus.consent === 'critical' ||
    ledgerStatus.federation === 'critical' ||
    ledgerStatus.trust_proofs === 'critical'
  ) {
    return 'attention_required';
  }

  // Attention required if pending human reviews
  if (pendingCount > 0) {
    return 'attention_required';
  }

  // Degraded if any ledger is degraded
  if (
    ledgerStatus.governance === 'degraded' ||
    ledgerStatus.consent === 'degraded' ||
    ledgerStatus.federation === 'degraded' ||
    ledgerStatus.trust_proofs === 'degraded'
  ) {
    return 'degraded';
  }

  return 'healthy';
}

/**
 * GET /api/integrity/status
 * Public integrity status endpoint
 *
 * Returns current governance integrity health including:
 * - Overall system state
 * - Per-ledger health status
 * - Open issues summary
 * - Recent repairs
 * - Pending human reviews
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

    // Get latest integrity report
    const report = getLatestReport();
    
    // Get pending repairs
    const pendingRepairs = getPendingRepairs();
    const pendingCount = pendingRepairs.length;

    // Get recent repairs
    const recentRepairs = getRecentRepairs(10);

    // Count open issues by classification
    const openIssueCounts = countOpenIssues();

    // Determine system state
    const systemState = determineSystemState(report, pendingCount);

    // Build open issues summary (anonymized)
    const openIssues = Object.entries(openIssueCounts).map(([classification, count]) => ({
      classification,
      count,
      severity: classification.includes('critical') || classification.includes('break') ? 'high' : 'medium',
      summary: `${count} issue(s) of type ${classification} pending review`,
    }));

    // Build recent repairs summary
    const recentRepairsSummary = recentRepairs.map(repair => ({
      timestamp: repair.applied_at,
      classification: repair.issue_classification,
      status: repair.status,
      summary: repair.title,
    }));

    // Build response
    const reportObj = (report && typeof report === 'object') ? report as Record<string, unknown> : {};
    const response: IntegrityStatusResponse = {
      timestamp: new Date().toISOString(),
      system_state: systemState,
      last_verification: (reportObj.timestamp as string) || 'Never',
      verification_scope: (reportObj.verification_scope as string[]) || ['all'],
      ledger_status: (reportObj.ledger_status as { governance: LedgerHealth; consent: LedgerHealth; federation: LedgerHealth; trust_proofs: LedgerHealth }) || {
        governance: 'valid' as LedgerHealth,
        consent: 'valid' as LedgerHealth,
        federation: 'valid' as LedgerHealth,
        trust_proofs: 'valid' as LedgerHealth,
      },
      open_issues: openIssues,
      recent_repairs: recentRepairsSummary,
      pending_human_reviews: pendingCount,
      global_merkle_root: (reportObj.global_merkle_root as string) || '',
      compliance_baseline: 'Stage VIII — Continuous Integrity',
      privacy_notice: 'All data is aggregated and anonymized. No personal information is exposed.',
      documentation_url: '/governance/integrity',
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
    console.error('Integrity Status API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to retrieve integrity status',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/integrity/status
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

