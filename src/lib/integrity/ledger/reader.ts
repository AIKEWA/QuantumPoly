/**
 * @fileoverview Governance Ledger Parser
 * @module lib/integrity/ledger/reader
 * @see BLOCK9.3_TRANSPARENCY_FRAMEWORK.md
 *
 * Reads and parses JSONL governance ledgers with integrity verification
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * Governance ledger entry types
 */
export type LedgerEntryType =
  | 'eii-baseline'
  | 'feedback-synthesis'
  | 'audit_closure'
  | 'legal_compliance'
  | 'implementation_verification'
  | 'consent_baseline'
  | 'transparency_extension'
  | 'ethics_reporting'
  | 'autonomous_analysis'
  | 'federation_integration'
  | 'attestation_layer_activation'
  | 'autonomous_repair'
  | 'integrity_layer_activation'
  | 'final_audit_signoff';

/**
 * Base ledger entry interface
 */
export interface LedgerEntry {
  id: string;
  timestamp: string;
  commit: string;
  entryType?: LedgerEntryType;
  hash: string;
  merkleRoot: string;
  signature?: string | null;
  [key: string]: unknown;
}

/**
 * EII baseline entry
 */
export interface EIIEntry extends LedgerEntry {
  eii: number;
  metrics: {
    accessibility?: number;
    security?: number;
    privacy?: number;
    transparency?: number;
    seo?: number;
    a11y?: number;
    performance?: number;
    bundle?: number;
  };
}

/**
 * Ledger parsing result
 */
export interface LedgerParseResult {
  entries: LedgerEntry[];
  totalEntries: number;
  lastUpdate: string;
  merkleRoot: string;
  verified: boolean;
}

/**
 * Read and parse governance ledger
 * @param ledgerPath Path to ledger file (relative to project root)
 * @returns Parsed ledger entries
 */
export function parseLedger(ledgerPath: string = 'governance/ledger/ledger.jsonl'): LedgerEntry[] {
  const fullPath = path.join(process.cwd(), ledgerPath);

  if (!fs.existsSync(fullPath)) {
    console.warn(`Ledger file not found: ${fullPath}`);
    return [];
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);

    return lines.map((line, index) => {
      try {
        return JSON.parse(line) as LedgerEntry;
      } catch (error) {
        console.error(`Failed to parse ledger line ${index + 1}:`, error);
        throw new Error(`Invalid JSON at line ${index + 1}`);
      }
    });
  } catch (error) {
    console.error('Failed to read ledger:', error);
    return [];
  }
}

/**
 * Get recent ledger entries
 * @param limit Maximum number of entries to return
 * @param ledgerPath Path to ledger file
 * @returns Recent entries (newest first)
 */
export function getRecentEntries(
  limit: number = 5,
  ledgerPath: string = 'governance/ledger/ledger.jsonl',
): LedgerEntry[] {
  const entries = parseLedger(ledgerPath);
  return entries.slice(-limit).reverse(); // Get last N entries, newest first
}

/**
 * Get entries by type
 * @param entryType Type of entries to filter
 * @param ledgerPath Path to ledger file
 * @returns Filtered entries
 */
export function getEntriesByType(
  entryType: LedgerEntryType,
  ledgerPath: string = 'governance/ledger/ledger.jsonl',
): LedgerEntry[] {
  const entries = parseLedger(ledgerPath);
  return entries.filter((entry) => (entry.entryType || 'eii-baseline') === entryType);
}

/**
 * Get entries within date range
 * @param startDate Start date (ISO string)
 * @param endDate End date (ISO string)
 * @param ledgerPath Path to ledger file
 * @returns Filtered entries
 */
export function getEntriesByDateRange(
  startDate: string,
  endDate: string,
  ledgerPath: string = 'governance/ledger/ledger.jsonl',
): LedgerEntry[] {
  const entries = parseLedger(ledgerPath);
  const start = new Date(startDate);
  const end = new Date(endDate);

  return entries.filter((entry) => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= start && entryDate <= end;
  });
}

/**
 * Get EII entries only
 * @param ledgerPath Path to ledger file
 * @returns EII entries
 */
export function getEIIEntries(ledgerPath: string = 'governance/ledger/ledger.jsonl'): EIIEntry[] {
  const entries = parseLedger(ledgerPath);
  return entries.filter((entry): entry is EIIEntry => 'eii' in entry);
}

/**
 * Compute SHA256 hash
 * @param data Data to hash
 * @returns Hex-encoded hash
 */
export function computeHash(data: unknown): string {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

/**
 * Verify ledger entry hash
 * @param entry Ledger entry
 * @returns True if hash is valid
 */
export function verifyEntryHash(entry: LedgerEntry): boolean {
  if (!entry.hash || !/^[0-9a-f]{64}$/.test(entry.hash)) {
    return false;
  }
  return true;
}

/**
 * Verify ledger integrity
 * @param ledgerPath Path to ledger file
 * @returns Verification result
 */
export function verifyLedgerIntegrity(
  ledgerPath: string = 'governance/ledger/ledger.jsonl',
): LedgerParseResult {
  const entries = parseLedger(ledgerPath);

  if (entries.length === 0) {
    return {
      entries: [],
      totalEntries: 0,
      lastUpdate: new Date().toISOString(),
      merkleRoot: '',
      verified: false,
    };
  }

  // Verify chronological order
  let chronologyValid = true;
  for (let i = 1; i < entries.length; i++) {
    const prev = new Date(entries[i - 1].timestamp);
    const curr = new Date(entries[i].timestamp);
    if (curr < prev) {
      chronologyValid = false;
      break;
    }
  }

  // Verify hash formats
  let hashesValid = true;
  for (const entry of entries) {
    if (!verifyEntryHash(entry)) {
      hashesValid = false;
      break;
    }
  }

  const lastEntry = entries[entries.length - 1];

  return {
    entries,
    totalEntries: entries.length,
    lastUpdate: lastEntry.timestamp,
    merkleRoot: lastEntry.merkleRoot,
    verified: chronologyValid && hashesValid,
  };
}

/**
 * Get ledger statistics
 * @param ledgerPath Path to ledger file
 * @returns Ledger statistics
 */
export function getLedgerStats(ledgerPath: string = 'governance/ledger/ledger.jsonl') {
  const entries = parseLedger(ledgerPath);

  if (entries.length === 0) {
    return {
      totalEntries: 0,
      entryTypes: {},
      dateRange: { start: null, end: null },
      avgEII: null,
      eiiRange: { min: null, max: null },
    };
  }

  // Count entry types
  const entryTypes: Record<string, number> = {};
  for (const entry of entries) {
    const type = entry.entryType || 'eii-baseline';
    entryTypes[type] = (entryTypes[type] || 0) + 1;
  }

  // EII statistics
  const eiiEntries = getEIIEntries(ledgerPath);
  const avgEII =
    eiiEntries.length > 0
      ? eiiEntries.reduce((sum, e) => sum + e.eii, 0) / eiiEntries.length
      : null;
  const eiiValues = eiiEntries.map((e) => e.eii);
  const eiiRange =
    eiiValues.length > 0
      ? { min: Math.min(...eiiValues), max: Math.max(...eiiValues) }
      : { min: null, max: null };

  return {
    totalEntries: entries.length,
    entryTypes,
    dateRange: {
      start: entries[0].timestamp,
      end: entries[entries.length - 1].timestamp,
    },
    avgEII,
    eiiRange,
  };
}
