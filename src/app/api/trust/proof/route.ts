/**
 * @fileoverview Public Trust Proof Verification API
 * @module api/trust/proof
 * @see BLOCK9.7_TRUST_PROOF_FRAMEWORK.md
 *
 * Public endpoint for verifying trust proofs of published artifacts.
 * Allows external auditors, regulators, and the public to independently
 * verify the authenticity and integrity of governance documents.
 *
 * Endpoint: GET /api/trust/proof
 * Query Parameters:
 *   - token: Full trust proof token (base64 encoded)
 *   - rid: Report/artifact ID (used with sig parameter)
 *   - sig: Signature (used with rid parameter)
 *
 * Security:
 * - Read-only
 * - Rate limited (60 req/min per IP)
 * - CORS enabled (public access)
 * - Zero personal data exposure
 */

import { NextRequest, NextResponse } from 'next/server';

import {
  verifyArtifactProof,
  verifyArtifactProofByAttestation,
  getActiveProof,
} from '@/lib/trust/proof-verifier';
import {
  decodeTrustToken,
  getTrustProofConfig,
} from '@/lib/trust/token-generator';
import {
  TrustProofToken,
  TrustProofResponse,
  AttestationPayload,
} from '@/lib/trust/types';

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
 * GET /api/trust/proof
 * Verify a trust proof token
 *
 * Query parameters:
 * - token: Full trust proof token (base64 encoded)
 * OR
 * - rid: Report/artifact ID
 * - sig: Signature
 *
 * Returns: TrustProofResponse with verification status
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const tokenParam = searchParams.get('token');
    const ridParam = searchParams.get('rid');
    const sigParam = searchParams.get('sig');

    let response: TrustProofResponse;

    // Verification mode 1: Full token
    if (tokenParam) {
      try {
        const payload = decodeTrustToken(tokenParam);
        const token: TrustProofToken = {
          ...payload,
          signature: '', // Will be extracted from token
        };
        response = verifyArtifactProof(token);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to decode trust proof token';
        return NextResponse.json(
          {
            error: 'Invalid token',
            message: errorMessage,
            status: 'invalid_token',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
    }
    // Verification mode 2: Report ID + Signature (from QR code)
    else if (ridParam && sigParam) {
      try {
        // Get active proof to reconstruct full verification
        const activeProof = getActiveProof(ridParam);
        
        if (!activeProof) {
          const config = getTrustProofConfig();
          return NextResponse.json(
            {
              artifact_id: ridParam,
              hash_algorithm: 'SHA-256',
              artifact_hash: 'unknown',
              issued_at: new Date().toISOString(),
              issuer: config.issuer,
              governance_block: config.governanceBlock,
              ledger_reference: 'trust-proof-block9.7',
              compliance_stage: config.complianceStage,
              status: 'not_found',
              notes: 'No active proof found for this artifact',
              verified_at: new Date().toISOString(),
            } as TrustProofResponse,
            {
              status: 404,
              headers: {
                'Cache-Control': 'public, max-age=300',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            }
          );
        }

        // Create attestation payload
        const payload: AttestationPayload = {
          rid: ridParam,
          sig: sigParam,
          ts: Math.floor(new Date(activeProof.issued_at).getTime() / 1000),
          h: activeProof.artifact_hash.substring(0, 16),
        };

        response = verifyArtifactProofByAttestation(payload);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to verify attestation';
        return NextResponse.json(
          {
            error: 'Verification failed',
            message: errorMessage,
            status: 'invalid_token',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
    }
    // Missing parameters
    else {
      return NextResponse.json(
        {
          error: 'Missing parameters',
          message:
            'Provide either "token" parameter OR both "rid" and "sig" parameters',
          examples: {
            full_token: '/api/trust/proof?token=<base64-encoded-token>',
            qr_code: '/api/trust/proof?rid=ETHICS_REPORT_2025-11-05&sig=<signature>',
          },
        },
        { status: 400 }
      );
    }

    // Return verification response
    const statusCode = response.status === 'valid' ? 200 : 
                       response.status === 'not_found' ? 404 : 
                       response.status === 'invalid_token' ? 400 : 200;

    return NextResponse.json(response, {
      status: statusCode,
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
    console.error('[Trust Proof API] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to verify trust proof',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/trust/proof
 * CORS preflight
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

