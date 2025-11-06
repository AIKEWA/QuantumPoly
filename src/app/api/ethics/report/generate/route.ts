/**
 * @fileoverview Manual Ethics Report Generation API
 * @module api/ethics/report/generate
 * @see BLOCK9.4_PUBLIC_ETHICS_API.md
 *
 * POST endpoint for manual ethics report generation
 * Invokes autonomous-report.mjs script and returns report metadata
 *
 * Security:
 * - Rate limited: 1 request per hour per IP
 * - Optional API key authentication
 * - All requests logged
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate limiting state (in-memory)
 * Production: use Redis or similar
 */
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
// const RATE_LIMIT_MAX = 1; // 1 request per hour (reserved for future use)

/**
 * Check rate limit
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimitMap.get(ip);

  if (!lastRequest || now - lastRequest > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, now);
    return true;
  }

  return false;
}

/**
 * Verify optional API key
 */
function verifyApiKey(request: NextRequest): boolean {
  const apiKey = process.env.ETHICS_REPORT_API_KEY;
  
  // If no API key configured, allow all requests (rely on rate limiting only)
  if (!apiKey) {
    return true;
  }

  const providedKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');
  return providedKey === apiKey;
}

/**
 * POST /api/ethics/report/generate
 * Generate ethics report manually
 *
 * Request body (optional):
 * {
 *   "sign": boolean,  // Enable GPG signing
 *   "dryRun": boolean // Dry run mode
 * }
 *
 * Response:
 * {
 *   "status": "success",
 *   "report": {
 *     "date": "YYYY-MM-DD",
 *     "json_url": "/reports/ethics/...",
 *     "pdf_url": "/reports/ethics/...",
 *     "hash": "...",
 *     "signature": "..."
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Maximum 1 report generation per hour allowed',
          retry_after: 3600,
        },
        {
          status: 429,
          headers: {
            'Retry-After': '3600',
          },
        }
      );
    }

    // API key verification (if configured)
    if (!verifyApiKey(request)) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Invalid or missing API key',
        },
        { status: 401 }
      );
    }

    // Parse request body
    let body: { sign?: boolean; dryRun?: boolean } = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is fine
    }

    const shouldSign = body.sign === true;
    const isDryRun = body.dryRun === true;

    // Log request
    console.log(`[Ethics Report] Manual generation requested by ${ip}`);
    console.log(`[Ethics Report] Options: sign=${shouldSign}, dryRun=${isDryRun}`);

    // Build command
    const scriptPath = path.join(process.cwd(), 'scripts', 'autonomous-report.mjs');
    let command = `node ${scriptPath}`;
    
    if (isDryRun) {
      command += ' --dry-run';
    }
    if (shouldSign) {
      command += ' --sign';
    }

    // Execute report generation
    console.log(`[Ethics Report] Executing: ${command}`);
    
    let output: string;
    try {
      output = execSync(command, {
        cwd: process.cwd(),
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024, // 10MB
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Ethics Report] Generation failed:', errorMessage);
      const errorOutput = 
        (error && typeof error === 'object' && 'stdout' in error) 
          ? String((error as { stdout?: unknown }).stdout || '') 
          : '';
      const errorStderr = 
        (error && typeof error === 'object' && 'stderr' in error) 
          ? String((error as { stderr?: unknown }).stderr || '') 
          : '';
      return NextResponse.json(
        {
          error: 'Report generation failed',
          message: errorMessage,
          output: errorOutput || errorStderr,
        },
        { status: 500 }
      );
    }

    console.log(`[Ethics Report] Generation complete`);

    // Parse report metadata
    const reportDate = new Date().toISOString().split('T')[0];
    const jsonPath = `/reports/ethics/ETHICS_REPORT_${reportDate}.json`;
    const pdfPath = `/reports/ethics/ETHICS_REPORT_${reportDate}.pdf`;
    const sigPath = `/reports/ethics/ETHICS_REPORT_${reportDate}.pdf.sig`;

    // Read report hash from file (if not dry run)
    let jsonHash = null;
    let pdfHash = null;
    let hasSignature = false;

    if (!isDryRun) {
      try {
        const jsonFullPath = path.join(process.cwd(), 'reports', 'ethics', `ETHICS_REPORT_${reportDate}.json`);
        const pdfFullPath = path.join(process.cwd(), 'reports', 'ethics', `ETHICS_REPORT_${reportDate}.pdf`);
        const sigFullPath = path.join(process.cwd(), 'reports', 'ethics', `ETHICS_REPORT_${reportDate}.pdf.sig`);

        if (fs.existsSync(jsonFullPath)) {
          const crypto = await import('crypto');
          const jsonBuffer = fs.readFileSync(jsonFullPath);
          jsonHash = crypto.createHash('sha256').update(jsonBuffer).digest('hex');
        }

        if (fs.existsSync(pdfFullPath)) {
          const crypto = await import('crypto');
          const pdfBuffer = fs.readFileSync(pdfFullPath);
          pdfHash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');
        }

        hasSignature = fs.existsSync(sigFullPath);
      } catch (error) {
        console.error('[Ethics Report] Failed to read report files:', error);
      }
    }

    // Build response
    const response = {
      status: 'success',
      message: isDryRun ? 'Dry run completed successfully' : 'Report generated successfully',
      report: {
        date: reportDate,
        json_url: jsonPath,
        pdf_url: pdfPath,
        signature_url: hasSignature ? sigPath : null,
        json_hash: jsonHash,
        pdf_hash: pdfHash,
      },
      execution: {
        dry_run: isDryRun,
        signed: shouldSign && hasSignature,
        timestamp: new Date().toISOString(),
      },
      output: output.split('\n').slice(-10).join('\n'), // Last 10 lines
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[Ethics Report] API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ethics/report/generate
 * Get information about report generation endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/ethics/report/generate',
    method: 'POST',
    description: 'Manually trigger ethics report generation',
    rate_limit: '1 request per hour per IP',
    authentication: process.env.ETHICS_REPORT_API_KEY ? 'API key required' : 'No authentication required',
    request_body: {
      sign: 'boolean (optional) - Enable GPG signing',
      dryRun: 'boolean (optional) - Dry run mode (no files saved)',
    },
    example: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'your-api-key-here (if configured)',
      },
      body: {
        sign: true,
        dryRun: false,
      },
    },
  });
}

/**
 * OPTIONS /api/ethics/report/generate
 * CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Authorization',
    },
  });
}

