/**
 * @fileoverview Sign-Off Manager for Block 9.9
 * @module lib/audit/sign-off-manager
 * @see BLOCK9.9_FINAL_AUDIT_AND_HANDOFF.md
 *
 * CRUD operations for sign-off records with validation logic
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import type {
  SignOffRecord,
  SignOffSubmission,
  PublicSignOffSummary,
  ValidationResult,
  ReviewRole,
  IntegritySnapshot,
} from './types';

const SIGNOFFS_FILE = path.join(process.cwd(), 'governance/audits/signoffs.jsonl');

/**
 * Generate unique review ID
 */
export function generateReviewId(role: ReviewRole): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const random = crypto.randomBytes(4).toString('hex');
  return `review-${role.toLowerCase().replace(/\s+/g, '-')}-${timestamp}-${random}`;
}

/**
 * Compute signature hash for sign-off record
 */
export function computeSignatureHash(record: Omit<SignOffRecord, 'signature_hash'>): string {
  const data = {
    review_id: record.review_id,
    reviewer_name: record.reviewer_name,
    role: record.role,
    review_scope: record.review_scope,
    decision: record.decision,
    timestamp: record.timestamp,
    integrity_snapshot_hash: crypto
      .createHash('sha256')
      .update(JSON.stringify(record.integrity_snapshot))
      .digest('hex'),
  };

  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

/**
 * Validate sign-off submission
 */
export function validateSignOffSubmission(
  submission: SignOffSubmission,
  integritySnapshot: IntegritySnapshot
): ValidationResult {
  const errors: string[] = [];

  // Validate required fields
  if (!submission.reviewer_name || submission.reviewer_name.trim().length === 0) {
    errors.push('Reviewer name is required');
  }

  if (!submission.role) {
    errors.push('Reviewer role is required');
  }

  if (!submission.review_scope || submission.review_scope.length === 0) {
    errors.push('Review scope is required');
  }

  if (!submission.decision) {
    errors.push('Review decision is required');
  }

  // Validate conditional approval logic
  if (
    integritySnapshot.system_state === 'attention_required' &&
    submission.decision === 'approved'
  ) {
    if (!submission.exceptions || submission.exceptions.length === 0) {
      errors.push(
        'Exception justification is required when approving with attention_required integrity state'
      );
    } else {
      // Validate exception justifications
      submission.exceptions.forEach((exception, index) => {
        if (!exception.issue_description || exception.issue_description.trim().length === 0) {
          errors.push(`Exception ${index + 1}: Issue description is required`);
        }
        if (!exception.rationale || exception.rationale.trim().length === 0) {
          errors.push(`Exception ${index + 1}: Rationale is required`);
        }
        if (!exception.mitigation_plan || exception.mitigation_plan.trim().length === 0) {
          errors.push(`Exception ${index + 1}: Mitigation plan is required`);
        }
        if (!exception.mitigation_owner || exception.mitigation_owner.trim().length === 0) {
          errors.push(`Exception ${index + 1}: Mitigation owner is required`);
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create sign-off record from submission
 */
export function createSignOffRecord(
  submission: SignOffSubmission,
  integritySnapshot: IntegritySnapshot
): SignOffRecord {
  const review_id = generateReviewId(submission.role);
  const timestamp = new Date().toISOString();

  const recordWithoutHash: Omit<SignOffRecord, 'signature_hash'> = {
    review_id,
    reviewer_name: submission.reviewer_name.trim(),
    role: submission.role,
    review_scope: submission.review_scope,
    decision: submission.decision,
    exceptions: submission.exceptions,
    notes: submission.notes?.trim(),
    integrity_snapshot: integritySnapshot,
    timestamp,
  };

  const signature_hash = computeSignatureHash(recordWithoutHash);

  return {
    ...recordWithoutHash,
    signature_hash,
  };
}

/**
 * Ensure signoffs directory exists
 */
function ensureSignoffsDirectory(): void {
  const dir = path.dirname(SIGNOFFS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Write sign-off record to storage
 */
export function writeSignOffRecord(record: SignOffRecord): void {
  ensureSignoffsDirectory();

  const line = JSON.stringify(record) + '\n';
  fs.appendFileSync(SIGNOFFS_FILE, line, 'utf-8');
}

/**
 * Read all sign-off records
 */
export function readSignOffRecords(): SignOffRecord[] {
  if (!fs.existsSync(SIGNOFFS_FILE)) {
    return [];
  }

  try {
    const content = fs.readFileSync(SIGNOFFS_FILE, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);

    return lines.map((line, index) => {
      try {
        return JSON.parse(line) as SignOffRecord;
      } catch (error) {
        console.error(`Failed to parse sign-off record at line ${index + 1}:`, error);
        throw new Error(`Invalid JSON at line ${index + 1}`);
      }
    });
  } catch (error) {
    console.error('Failed to read sign-off records:', error);
    return [];
  }
}

/**
 * Get sign-off records for current release
 * (filters by records from last 7 days)
 */
export function getCurrentReleaseSignOffs(): SignOffRecord[] {
  const allRecords = readSignOffRecords();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return allRecords.filter((record) => {
    const recordDate = new Date(record.timestamp);
    return recordDate >= sevenDaysAgo;
  });
}

/**
 * Get completed sign-off roles for current release
 */
export function getCompletedSignOffRoles(): ReviewRole[] {
  const currentRecords = getCurrentReleaseSignOffs();
  const approvedRoles = new Set<ReviewRole>();

  currentRecords.forEach((record) => {
    if (record.decision === 'approved' || record.decision === 'approved_with_exceptions') {
      approvedRoles.add(record.role);
    }
  });

  return Array.from(approvedRoles);
}

/**
 * Check if all required sign-offs are complete
 */
export function areAllSignOffsComplete(): boolean {
  const requiredRoles: ReviewRole[] = [
    'Lead Engineer',
    'Governance Officer',
    'Legal Counsel',
    'Accessibility Reviewer',
  ];

  const completedRoles = getCompletedSignOffRoles();

  return requiredRoles.every((role) => completedRoles.includes(role));
}

/**
 * Convert sign-off record to public summary (no sensitive data)
 */
export function toPublicSummary(record: SignOffRecord): PublicSignOffSummary {
  return {
    review_id: record.review_id,
    role: record.role,
    decision: record.decision,
    review_scope: record.review_scope,
    timestamp: record.timestamp,
    has_exceptions: !!record.exceptions && record.exceptions.length > 0,
  };
}

/**
 * Get recent public sign-off summaries
 */
export function getRecentPublicSignOffs(limit: number = 10): PublicSignOffSummary[] {
  const allRecords = readSignOffRecords();
  const recentRecords = allRecords.slice(-limit).reverse();
  return recentRecords.map(toPublicSummary);
}

/**
 * Verify sign-off record integrity
 */
export function verifySignOffIntegrity(record: SignOffRecord): boolean {
  const recordWithoutHash: Omit<SignOffRecord, 'signature_hash'> = {
    review_id: record.review_id,
    reviewer_name: record.reviewer_name,
    role: record.role,
    review_scope: record.review_scope,
    decision: record.decision,
    exceptions: record.exceptions,
    notes: record.notes,
    integrity_snapshot: record.integrity_snapshot,
    timestamp: record.timestamp,
  };

  const computedHash = computeSignatureHash(recordWithoutHash);
  return computedHash === record.signature_hash;
}

/**
 * Get sign-off statistics
 */
export function getSignOffStatistics(): {
  total: number;
  approved: number;
  rejected: number;
  approved_with_exceptions: number;
  by_role: Record<ReviewRole, number>;
} {
  const records = readSignOffRecords();

  const stats = {
    total: records.length,
    approved: 0,
    rejected: 0,
    approved_with_exceptions: 0,
    by_role: {
      'Lead Engineer': 0,
      'Governance Officer': 0,
      'Legal Counsel': 0,
      'Accessibility Reviewer': 0,
    } as Record<ReviewRole, number>,
  };

  records.forEach((record) => {
    if (record.decision === 'approved') stats.approved++;
    if (record.decision === 'rejected') stats.rejected++;
    if (record.decision === 'approved_with_exceptions') stats.approved_with_exceptions++;
    stats.by_role[record.role]++;
  });

  return stats;
}

