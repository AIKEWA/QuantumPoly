/**
 * @fileoverview Sign-Off Submission API - Block 9.9
 * @module api/audit/sign-off
 * @see BLOCK9.9_FINAL_AUDIT_AND_HANDOFF.md
 *
 * POST endpoint for submitting human sign-offs (requires authentication)
 */

import { NextRequest, NextResponse } from 'next/server';

import { isAuthenticated } from '@/lib/audit/auth-validator';
import { fetchIntegrityStatus } from '@/lib/audit/integrity-checker';
import {
  validateSignOffSubmission,
  createSignOffRecord,
  writeSignOffRecord,
} from '@/lib/audit/sign-off-manager';
import type { SignOffSubmission } from '@/lib/audit/types';

/**
 * POST /api/audit/sign-off
 * Submit a human sign-off record
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Verify authentication
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: 'Valid API key required for sign-off submission',
        documentation: '/governance/review',
      },
      {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Bearer realm="Review Dashboard", charset="UTF-8"',
        },
      }
    );
  }

  try {
    // Parse request body
    const body = await request.json();
    const submission = body as SignOffSubmission;

    // Fetch current integrity status
    const integritySnapshot = await fetchIntegrityStatus();

    // Validate submission
    const validation = validateSignOffSubmission(submission, integritySnapshot);

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Sign-off submission validation failed',
          errors: validation.errors,
        },
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Create sign-off record
    const record = createSignOffRecord(submission, integritySnapshot);

    // Write to storage
    writeSignOffRecord(record);

    // Return created record
    return NextResponse.json(
      {
        success: true,
        message: 'Sign-off recorded successfully',
        record: {
          review_id: record.review_id,
          role: record.role,
          decision: record.decision,
          timestamp: record.timestamp,
          signature_hash: record.signature_hash,
        },
      },
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Location': `/api/audit/history?review_id=${record.review_id}`,
        },
      }
    );
  } catch (error) {
    console.error('Failed to process sign-off:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to process sign-off submission',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * OPTIONS /api/audit/sign-off
 * CORS preflight
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

