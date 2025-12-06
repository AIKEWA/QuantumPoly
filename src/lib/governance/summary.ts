/**
 * @fileoverview Governance Summary Logic
 * @module lib/governance/summary
 *
 * Shared logic for generating governance ledger summaries.
 * Used by both API endpoints and Server Components.
 */

import { verifyIntegrityLedger, getIntegrityLedger } from '@/lib/integrity';

export interface GovernanceSummary {
  latest: string;
  merkle_root: string;
  verified: boolean;
  totalEntries: number;
  lastUpdate: string;
  blocks: string[];
  recentChanges: Array<{
    block: string;
    timestamp: string;
    entryType: string;
    title: string;
  }>;
  timestamp: string;
}

/**
 * Generates a summary of the governance ledger.
 * @returns {Promise<GovernanceSummary>} The governance summary.
 */
export async function getGovernanceSummary(): Promise<GovernanceSummary> {
  try {
    // Verify ledger integrity
    const result = verifyIntegrityLedger('governance/ledger/ledger.jsonl');

    // Parse full ledger for block list
    const entries = getIntegrityLedger('governance/ledger/ledger.jsonl');

    // Extract block IDs in order
    const blocks = entries.map(
      (entry) =>
        (entry.blockId || entry.block_id || entry.id || entry.entry_id || 'unknown') as string,
    );

    // Determine latest block
    const latestEntry = entries[entries.length - 1];
    const latestBlock = (latestEntry?.id || latestEntry?.entry_id || 'unknown') as string;

    // Get recent changes (last 5 entries)
    const recentChanges = entries
      .slice(-5)
      .reverse()
      .map((entry) => {
        const summaryText = typeof entry.summary === 'string' ? entry.summary : '';
        const titleText =
          typeof entry.title === 'string'
            ? entry.title
            : summaryText.substring(0, 80) || 'No title';

        return {
          block: (entry.blockId ||
            entry.block_id ||
            entry.id ||
            entry.entry_id ||
            'unknown') as string,
          timestamp: entry.timestamp,
          entryType: (entry.entryType || entry.ledger_entry_type || 'unknown') as string,
          title: titleText,
        };
      });

    // Build response
    return {
      latest: latestBlock,
      merkle_root: result.merkleRoot,
      verified: result.verified,
      totalEntries: result.totalEntries,
      lastUpdate: result.lastUpdate,
      blocks,
      recentChanges,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error generating governance summary:', error);
    // Return fallback structure on error, consistent with original API behavior
    return {
      latest: 'unknown',
      merkle_root: '',
      verified: false,
      totalEntries: 0,
      lastUpdate: new Date().toISOString(),
      blocks: [],
      recentChanges: [],
      timestamp: new Date().toISOString(),
    };
  }
}
