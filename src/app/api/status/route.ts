/**
 * @fileoverview System Status API
 * @module api/status
 * @see BLOCK10.3_IMPLEMENTATION_SUMMARY.md
 *
 * Public health check endpoint exposing real-time operational state
 * Part of "The System That Watches Itself" autonomous monitoring framework
 */

import fs from 'fs';
import path from 'path';

import { NextRequest, NextResponse } from 'next/server';

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
 * Get system uptime from process
 */
function getSystemUptime(): number {
  return Math.floor(process.uptime());
}

/**
 * Get system version from package.json
 */
function getSystemVersion(): string {
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return packageJson.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Get latest integrity state from reports
 */
function getIntegrityState(): {
  state: 'healthy' | 'degraded' | 'attention_required' | 'unknown';
  lastVerification: string;
  merkleRoot: string;
} {
  try {
    const reportsDir = path.join(process.cwd(), 'governance/integrity/reports');
    if (!fs.existsSync(reportsDir)) {
      return {
        state: 'unknown',
        lastVerification: 'never',
        merkleRoot: '',
      };
    }

    const files = fs.readdirSync(reportsDir).filter(f => f.endsWith('.json'));
    if (files.length === 0) {
      return {
        state: 'unknown',
        lastVerification: 'never',
        merkleRoot: '',
      };
    }

    // Get most recent report
    const latestFile = files.sort().reverse()[0];
    const reportPath = path.join(reportsDir, latestFile);
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8')) as {
      system_state?: string;
      timestamp?: string;
      global_merkle_root?: string;
    };

    return {
      state: (report.system_state as 'healthy' | 'degraded' | 'attention_required') || 'unknown',
      lastVerification: report.timestamp || 'unknown',
      merkleRoot: report.global_merkle_root || '',
    };
  } catch (error) {
    console.error('Failed to read integrity state:', error);
    return {
      state: 'unknown',
      lastVerification: 'error',
      merkleRoot: '',
    };
  }
}

/**
 * Check endpoint health
 */
async function checkEndpointHealth(
  baseUrl: string,
  endpoint: string
): Promise<{
  url: string;
  available: boolean;
  responseTime: number;
  statusCode: number | null;
  error: string | null;
}> {
  const startTime = Date.now();
  const fullUrl = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(fullUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    return {
      url: endpoint,
      available: response.ok,
      responseTime: Date.now() - startTime,
      statusCode: response.status,
      error: null,
    };
  } catch (error) {
    return {
      url: endpoint,
      available: false,
      responseTime: Date.now() - startTime,
      statusCode: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Determine overall system state
 */
function determineSystemState(
  endpointResults: Array<{ available: boolean; responseTime: number }>,
  integrityState: string
): 'healthy' | 'degraded' | 'warning' {
  // Critical degradation: integrity is attention_required or degraded
  if (integrityState === 'attention_required' || integrityState === 'degraded') {
    return 'degraded';
  }

  // Check endpoint availability
  const unavailableEndpoints = endpointResults.filter(r => !r.available).length;
  if (unavailableEndpoints > 0) {
    return 'degraded';
  }

  // Check response times - warning if any exceed 5000ms
  const slowEndpoints = endpointResults.filter(r => r.responseTime > 5000).length;
  if (slowEndpoints > 0) {
    return 'warning';
  }

  return 'healthy';
}

/**
 * GET /api/status
 * Returns current system operational status
 *
 * Response schema:
 * {
 *   timestamp: string;
 *   system_state: 'healthy' | 'degraded' | 'warning';
 *   uptime_seconds: number;
 *   version: string;
 *   endpoints: Array<{
 *     url: string;
 *     available: boolean;
 *     response_time_ms: number;
 *     status_code: number | null;
 *   }>;
 *   integrity: {
 *     state: string;
 *     last_verification: string;
 *     merkle_root: string;
 *   };
 *   monitoring: {
 *     documentation_url: string;
 *     api_version: string;
 *   };
 * }
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

    // Get base URL from environment or request
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    // Check critical endpoints
    const criticalEndpoints = [
      '/',
      '/api/ethics/summary',
      '/api/ethics/public',
      '/api/integrity/status',
    ];

    const endpointChecks = await Promise.all(
      criticalEndpoints.map(endpoint => checkEndpointHealth(baseUrl, endpoint))
    );

    // Get system metrics
    const uptime = getSystemUptime();
    const version = getSystemVersion();
    const integrity = getIntegrityState();

    // Determine overall state
    const systemState = determineSystemState(endpointChecks, integrity.state);

    // Build response
    const response = {
      timestamp: new Date().toISOString(),
      system_state: systemState,
      uptime_seconds: uptime,
      version,
      endpoints: endpointChecks.map(check => ({
        url: check.url,
        available: check.available,
        response_time_ms: check.responseTime,
        status_code: check.statusCode,
        error: check.error,
      })),
      integrity: {
        state: integrity.state,
        last_verification: integrity.lastVerification,
        merkle_root: integrity.merkleRoot,
      },
      monitoring: {
        documentation_url: '/docs/monitoring/OPERATIONAL_RUNBOOK.md',
        api_version: '1.0.0',
      },
      privacy_notice: 'This endpoint exposes aggregate system health only. No personal data is included.',
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=60', // 1 minute cache
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
    console.error('System status API error:', error);
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        system_state: 'degraded',
        error: 'Failed to retrieve system status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/status
 * CORS preflight handler
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

