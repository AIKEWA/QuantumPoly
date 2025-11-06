/**
 * @fileoverview Review Queue Management
 * @module lib/ewa/review-queue
 * @see BLOCK9.5_ETHICAL_AUTONOMY.md
 *
 * Manages approval workflow for critical insights requiring human review
 */

import fs from 'fs';
import path from 'path';

import type { ReviewQueueEntry, EthicalInsight } from './types';

const REVIEW_QUEUE_PATH = 'governance/ewa/review-queue.jsonl';

/**
 * Add insight to review queue
 * @param insight Ethical insight requiring review
 * @returns Review queue entry
 */
export function addToReviewQueue(insight: EthicalInsight): ReviewQueueEntry {
  const entry: ReviewQueueEntry = {
    entry_id: `review-${insight.insight_id}`,
    timestamp: new Date().toISOString(),
    insight,
    status: 'pending',
  };

  // Append to review queue file
  const queuePath = path.join(process.cwd(), REVIEW_QUEUE_PATH);

  // Ensure directory exists
  const queueDir = path.dirname(queuePath);
  if (!fs.existsSync(queueDir)) {
    fs.mkdirSync(queueDir, { recursive: true });
  }

  // Append entry
  fs.appendFileSync(queuePath, JSON.stringify(entry) + '\n', 'utf-8');

  console.log(`📝 Added insight ${insight.insight_id} to review queue`);

  return entry;
}

/**
 * Get all pending review entries
 * @returns Array of pending review entries
 */
export function getPendingReviews(): ReviewQueueEntry[] {
  const queuePath = path.join(process.cwd(), REVIEW_QUEUE_PATH);

  if (!fs.existsSync(queuePath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(queuePath, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);

    const entries = lines.map((line) => JSON.parse(line) as ReviewQueueEntry);

    return entries.filter((entry) => entry.status === 'pending');
  } catch (error) {
    console.error('Failed to read review queue:', error);
    return [];
  }
}

/**
 * Approve a review entry
 * @param entryId Review entry ID
 * @param reviewedBy Reviewer name
 * @param notes Optional review notes
 * @returns Updated entry
 */
export function approveReview(
  entryId: string,
  reviewedBy: string,
  notes?: string
): ReviewQueueEntry | null {
  return updateReviewStatus(entryId, 'approved', reviewedBy, notes);
}

/**
 * Reject a review entry
 * @param entryId Review entry ID
 * @param reviewedBy Reviewer name
 * @param notes Rejection reason
 * @returns Updated entry
 */
export function rejectReview(
  entryId: string,
  reviewedBy: string,
  notes: string
): ReviewQueueEntry | null {
  return updateReviewStatus(entryId, 'rejected', reviewedBy, notes);
}

/**
 * Update review entry status
 * @param entryId Review entry ID
 * @param status New status
 * @param reviewedBy Reviewer name
 * @param notes Optional notes
 * @returns Updated entry or null if not found
 */
function updateReviewStatus(
  entryId: string,
  status: 'approved' | 'rejected',
  reviewedBy: string,
  notes?: string
): ReviewQueueEntry | null {
  const queuePath = path.join(process.cwd(), REVIEW_QUEUE_PATH);

  if (!fs.existsSync(queuePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(queuePath, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);

    const entries = lines.map((line) => JSON.parse(line) as ReviewQueueEntry);

    // Find and update entry
    const entryIndex = entries.findIndex((e) => e.entry_id === entryId);
    if (entryIndex === -1) {
      console.error(`Review entry ${entryId} not found`);
      return null;
    }

    const updatedEntry: ReviewQueueEntry = {
      ...entries[entryIndex],
      status,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      notes,
    };

    entries[entryIndex] = updatedEntry;

    // Write back to file
    const newContent = entries.map((e) => JSON.stringify(e)).join('\n') + '\n';
    fs.writeFileSync(queuePath, newContent, 'utf-8');

    console.log(`✅ Review entry ${entryId} ${status} by ${reviewedBy}`);

    return updatedEntry;
  } catch (error) {
    console.error('Failed to update review status:', error);
    return null;
  }
}

/**
 * Get review statistics
 * @returns Review queue statistics
 */
export function getReviewStats(): {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
} {
  const queuePath = path.join(process.cwd(), REVIEW_QUEUE_PATH);

  if (!fs.existsSync(queuePath)) {
    return { total: 0, pending: 0, approved: 0, rejected: 0 };
  }

  try {
    const content = fs.readFileSync(queuePath, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);

    const entries = lines.map((line) => JSON.parse(line) as ReviewQueueEntry);

    return {
      total: entries.length,
      pending: entries.filter((e) => e.status === 'pending').length,
      approved: entries.filter((e) => e.status === 'approved').length,
      rejected: entries.filter((e) => e.status === 'rejected').length,
    };
  } catch (error) {
    console.error('Failed to get review stats:', error);
    return { total: 0, pending: 0, approved: 0, rejected: 0 };
  }
}

/**
 * Clear approved/rejected entries older than specified days
 * @param days Number of days to retain
 * @returns Number of entries cleared
 */
export function clearOldReviews(days: number = 90): number {
  const queuePath = path.join(process.cwd(), REVIEW_QUEUE_PATH);

  if (!fs.existsSync(queuePath)) {
    return 0;
  }

  try {
    const content = fs.readFileSync(queuePath, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);

    const entries = lines.map((line) => JSON.parse(line) as ReviewQueueEntry);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Keep pending entries and recent approved/rejected entries
    const filteredEntries = entries.filter((entry) => {
      if (entry.status === 'pending') return true;

      const reviewDate = entry.reviewed_at
        ? new Date(entry.reviewed_at)
        : new Date(entry.timestamp);

      return reviewDate >= cutoffDate;
    });

    const clearedCount = entries.length - filteredEntries.length;

    if (clearedCount > 0) {
      const newContent =
        filteredEntries.map((e) => JSON.stringify(e)).join('\n') + '\n';
      fs.writeFileSync(queuePath, newContent, 'utf-8');

      console.log(`🗑️  Cleared ${clearedCount} old review entries`);
    }

    return clearedCount;
  } catch (error) {
    console.error('Failed to clear old reviews:', error);
    return 0;
  }
}

