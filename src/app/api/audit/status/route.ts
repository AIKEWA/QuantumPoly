/**
 * @fileoverview Audit Status API - Block 9.9
 * @module api/audit/status
 * @see BLOCK9.9_FINAL_AUDIT_AND_HANDOFF.md
 *
 * GET endpoint returning current review readiness state
 */

import { NextResponse } from 'next/server';

import {
  fetchIntegrityStatus,
  assessBlockingIssues,
  determineReadinessState,
} from '@/lib/audit/integrity-checker';
import { getCompletedSignOffRoles, getCurrentReleaseSignOffs } from '@/lib/audit/sign-off-manager';
import type { AuditStatusResponse, ReviewRole } from '@/lib/audit/types';

/**
 * Required reviewer roles
 */
const REQUIRED_SIGNOFFS: ReviewRole[] = [
  'Lead Engineer',
  'Governance Officer',
  'Legal Counsel',
  'Accessibility Reviewer',
];

/**
 * Get current release version from package.json
 */
function getReleaseVersion(): string {
  try {
    // In production, this would read from package.json or environment variable
    return process.env.RELEASE_VERSION || 'v1.0.0-rc1';
  } catch {
    return 'unknown';
  }
}

/**
 * Get current commit hash
 */
function getCommitHash(): string {
  try {
    // In production, this would be set during build
    return process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 12) || 'local-dev';
  } catch {
    return 'unknown';
  }
}

/**
 * GET /api/audit/status
 * Returns current audit readiness state
 */
export async function GET() {
  try {
    // Fetch current integrity status
    const integritySnapshot = await fetchIntegrityStatus();

    // Get completed sign-offs
    const completedSignoffs = getCompletedSignOffRoles();

    // Assess blocking issues
    const blockingIssues = assessBlockingIssues(integritySnapshot);

    // Determine readiness state
    const readinessState = determineReadinessState(
      integritySnapshot.system_state,
      completedSignoffs,
      REQUIRED_SIGNOFFS
    );

    // Get last review timestamp
    const currentSignoffs = getCurrentReleaseSignOffs();
    const lastReview =
      currentSignoffs.length > 0
        ? currentSignoffs[currentSignoffs.length - 1].timestamp
        : null;

    const response: AuditStatusResponse = {
      release_candidate: getReleaseVersion(),
      commit_hash: getCommitHash(),
      readiness_state: readinessState,
      integrity_state: integritySnapshot.system_state,
      required_signoffs: REQUIRED_SIGNOFFS,
      completed_signoffs: completedSignoffs,
      blocking_issues: blockingIssues,
      last_review: lastReview,
      integrity_snapshot: integritySnapshot,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, s-maxage=300', // 5 minutes
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  } catch (error) {
    console.error('Failed to fetch audit status:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch audit status',
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
 * OPTIONS /api/audit/status
 * CORS preflight
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

