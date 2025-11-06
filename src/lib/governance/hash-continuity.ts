/**
 * @fileoverview Hash Chain Continuity Verification
 * @module lib/governance/hash-continuity
 * @see BLOCK10.4_DASHBOARD_REFINEMENT.md
 *
 * Utilities for verifying hash chain integrity and detecting continuity gaps
 * in the governance ledger
 */

export interface LedgerEntry {
  block: string;
  hash: string;
  timestamp: string;
  id: string;
  parent?: string;
  verified?: boolean;
  [key: string]: unknown;
}

/**
 * Verification status for a ledger entry
 */
export type VerificationStatus = 'verified' | 'warning' | 'error' | 'unknown';

/**
 * Continuity gap information
 */
export interface ContinuityGap {
  block: string;
  id: string;
  missingParent: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'medium';
}

/**
 * Hash chain verification result
 */
export interface HashChainResult {
  valid: boolean;
  totalEntries: number;
  verifiedEntries: number;
  gaps: ContinuityGap[];
  brokenChains: number;
}

/**
 * Verify the complete hash chain continuity across all entries
 *
 * @param entries - Array of ledger entries to verify
 * @returns Verification result with gap details
 *
 * @example
 * ```ts
 * const result = verifyHashChain(ledgerEntries);
 * if (!result.valid) {
 *   console.error(`Found ${result.gaps.length} continuity gaps`);
 *   result.gaps.forEach(gap => {
 *     console.log(`Block ${gap.block} missing parent ${gap.missingParent}`);
 *   });
 * }
 * ```
 */
export function verifyHashChain(entries: LedgerEntry[]): HashChainResult {
  if (entries.length === 0) {
    return {
      valid: true,
      totalEntries: 0,
      verifiedEntries: 0,
      gaps: [],
      brokenChains: 0,
    };
  }

  // Create a map of block ID to entry for quick lookup
  const entryMap = new Map<string, LedgerEntry>();
  for (const entry of entries) {
    const blockId = entry.block || entry.id;
    entryMap.set(blockId, entry);
  }

  let verifiedEntries = 0;
  const gaps: ContinuityGap[] = [];

  // Verify each entry's parent relationship
  for (const entry of entries) {
    const blockId = entry.block || entry.id;

    // Skip first entry (genesis block has no parent)
    if (!entry.parent) {
      verifiedEntries++;
      continue;
    }

    // Check if parent exists
    const parentExists = entryMap.has(entry.parent);

    if (parentExists) {
      verifiedEntries++;
    } else {
      // Parent is missing - continuity break
      gaps.push({
        block: blockId,
        id: entry.id,
        missingParent: entry.parent,
        timestamp: entry.timestamp,
        severity: 'critical',
      });
    }
  }

  return {
    valid: gaps.length === 0,
    totalEntries: entries.length,
    verifiedEntries,
    gaps,
    brokenChains: gaps.length,
  };
}

/**
 * Find all continuity gaps in the ledger
 *
 * @param entries - Array of ledger entries
 * @returns Array of gaps with details
 */
export function findContinuityGaps(entries: LedgerEntry[]): ContinuityGap[] {
  const result = verifyHashChain(entries);
  return result.gaps;
}

/**
 * Get verification status for a single entry
 *
 * @param entry - Ledger entry to check
 * @param allEntries - Complete ledger for parent lookup
 * @returns Verification status
 *
 * @example
 * ```ts
 * const status = getVerificationStatus(entry, allEntries);
 * const color = status === 'verified' ? 'green' : status === 'warning' ? 'yellow' : 'red';
 * ```
 */
export function getVerificationStatus(
  entry: LedgerEntry,
  allEntries: LedgerEntry[]
): VerificationStatus {
  // Check if hash format is valid (64 hex characters)
  if (!entry.hash || !/^[0-9a-f]{64}$/i.test(entry.hash)) {
    return 'error';
  }

  // If no parent specified (genesis block), it's verified
  if (!entry.parent) {
    return 'verified';
  }

  // Check if parent exists in the ledger
  const parentExists = allEntries.some((e) => {
    const blockId = e.block || e.id;
    return blockId === entry.parent;
  });

  if (parentExists) {
    return 'verified';
  }

  // Parent is missing
  return 'warning';
}

/**
 * Check if an entry has valid hash format
 *
 * @param hash - Hash string to validate
 * @returns True if hash is valid SHA-256 format
 */
export function isValidHashFormat(hash: string): boolean {
  return /^[0-9a-f]{64}$/i.test(hash);
}

/**
 * Get verification statistics for the entire ledger
 *
 * @param entries - Array of ledger entries
 * @returns Statistics object
 */
export function getVerificationStats(entries: LedgerEntry[]) {
  const result = verifyHashChain(entries);

  const statusCounts = {
    verified: 0,
    warning: 0,
    error: 0,
    unknown: 0,
  };

  for (const entry of entries) {
    const status = getVerificationStatus(entry, entries);
    statusCounts[status]++;
  }

  return {
    total: entries.length,
    verified: result.verifiedEntries,
    gaps: result.gaps.length,
    verificationRate: entries.length > 0 ? (result.verifiedEntries / entries.length) * 100 : 0,
    statusCounts,
  };
}

/**
 * Find the parent entry for a given entry
 *
 * @param entry - Entry to find parent for
 * @param allEntries - Complete ledger
 * @returns Parent entry or undefined if not found
 */
export function findParentEntry(
  entry: LedgerEntry,
  allEntries: LedgerEntry[]
): LedgerEntry | undefined {
  if (!entry.parent) return undefined;

  return allEntries.find((e) => {
    const blockId = e.block || e.id;
    return blockId === entry.parent;
  });
}

/**
 * Find all children of a given entry
 *
 * @param entry - Entry to find children for
 * @param allEntries - Complete ledger
 * @returns Array of child entries
 */
export function findChildEntries(entry: LedgerEntry, allEntries: LedgerEntry[]): LedgerEntry[] {
  const blockId = entry.block || entry.id;

  return allEntries.filter((e) => e.parent === blockId);
}

/**
 * Build a complete chain from a given entry back to genesis
 *
 * @param entry - Starting entry
 * @param allEntries - Complete ledger
 * @returns Array of entries from genesis to current (ordered)
 */
export function buildChainToGenesis(entry: LedgerEntry, allEntries: LedgerEntry[]): LedgerEntry[] {
  const chain: LedgerEntry[] = [entry];
  let current = entry;

  while (current.parent) {
    const parent = findParentEntry(current, allEntries);
    if (!parent) break;
    chain.unshift(parent);
    current = parent;
  }

  return chain;
}

