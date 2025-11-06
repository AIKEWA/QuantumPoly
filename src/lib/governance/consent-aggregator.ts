/**
 * @fileoverview Consent Metrics Aggregator
 * @module lib/governance/consent-aggregator
 * @see BLOCK9.3_TRANSPARENCY_FRAMEWORK.md
 *
 * Aggregates consent data from consent ledger for transparency dashboard
 * Privacy-preserving: No individual user data exposed
 */

import fs from 'fs';
import path from 'path';

/**
 * Consent event types
 */
export enum ConsentEventType {
  ConsentGiven = 'consent_given',
  ConsentUpdated = 'consent_updated',
  ConsentRevoked = 'consent_revoked',
}

/**
 * Consent categories
 */
export enum ConsentCategory {
  Essential = 'essential',
  Analytics = 'analytics',
  Performance = 'performance',
}

/**
 * Consent ledger entry
 */
export interface ConsentLedgerEntry {
  timestamp: string;
  userId: string; // Pseudonymized
  event: ConsentEventType;
  preferences: {
    essential: boolean;
    analytics: boolean;
    performance: boolean;
  };
  policyVersion: string;
  userAgent?: string;
  ipHash?: string; // Hashed IP for privacy
}

/**
 * Aggregated consent metrics
 */
export interface ConsentMetrics {
  totalEvents: number;
  totalUsers: number; // Unique pseudonymized IDs
  consentGiven: number;
  consentRevoked: number;
  consentUpdated: number;
  categoryMetrics: {
    essential: { optIn: number; optOut: number; rate: number };
    analytics: { optIn: number; optOut: number; rate: number };
    performance: { optIn: number; optOut: number; rate: number };
  };
  timeSeriesData: Array<{
    date: string;
    consentGiven: number;
    consentRevoked: number;
    consentUpdated: number;
  }>;
  lastUpdate: string;
}

/**
 * Parse consent ledger
 * @param ledgerPath Path to consent ledger file
 * @returns Parsed consent entries
 */
export function parseConsentLedger(
  ledgerPath: string = 'governance/consent/ledger.jsonl'
): ConsentLedgerEntry[] {
  const fullPath = path.join(process.cwd(), ledgerPath);

  if (!fs.existsSync(fullPath)) {
    console.warn(`Consent ledger not found: ${fullPath}`);
    return [];
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);

    return lines.map((line, index) => {
      try {
        return JSON.parse(line) as ConsentLedgerEntry;
      } catch (error) {
        console.error(`Failed to parse consent ledger line ${index + 1}:`, error);
        throw new Error(`Invalid JSON at line ${index + 1}`);
      }
    });
  } catch (error) {
    console.error('Failed to read consent ledger:', error);
    return [];
  }
}

/**
 * Aggregate consent metrics
 * @param ledgerPath Path to consent ledger file
 * @returns Aggregated metrics
 */
export function aggregateConsentMetrics(
  ledgerPath: string = 'governance/consent/ledger.jsonl'
): ConsentMetrics {
  const entries = parseConsentLedger(ledgerPath);

  if (entries.length === 0) {
    return {
      totalEvents: 0,
      totalUsers: 0,
      consentGiven: 0,
      consentRevoked: 0,
      consentUpdated: 0,
      categoryMetrics: {
        essential: { optIn: 0, optOut: 0, rate: 0 },
        analytics: { optIn: 0, optOut: 0, rate: 0 },
        performance: { optIn: 0, optOut: 0, rate: 0 },
      },
      timeSeriesData: [],
      lastUpdate: new Date().toISOString(),
    };
  }

  // Count unique users (pseudonymized)
  const uniqueUsers = new Set(entries.map((e) => e.userId));

  // Count events by type
  const consentGiven = entries.filter((e) => e.event === ConsentEventType.ConsentGiven).length;
  const consentRevoked = entries.filter((e) => e.event === ConsentEventType.ConsentRevoked).length;
  const consentUpdated = entries.filter((e) => e.event === ConsentEventType.ConsentUpdated).length;

  // Get latest preference for each user
  const latestPreferences = new Map<string, ConsentLedgerEntry['preferences']>();
  for (const entry of entries) {
    latestPreferences.set(entry.userId, entry.preferences);
  }

  // Calculate category metrics
  const categoryMetrics = {
    essential: { optIn: 0, optOut: 0, rate: 0 },
    analytics: { optIn: 0, optOut: 0, rate: 0 },
    performance: { optIn: 0, optOut: 0, rate: 0 },
  };

  for (const prefs of latestPreferences.values()) {
    if (prefs.essential) categoryMetrics.essential.optIn++;
    else categoryMetrics.essential.optOut++;

    if (prefs.analytics) categoryMetrics.analytics.optIn++;
    else categoryMetrics.analytics.optOut++;

    if (prefs.performance) categoryMetrics.performance.optIn++;
    else categoryMetrics.performance.optOut++;
  }

  const totalUsers = uniqueUsers.size;
  categoryMetrics.essential.rate = totalUsers > 0 ? (categoryMetrics.essential.optIn / totalUsers) * 100 : 0;
  categoryMetrics.analytics.rate = totalUsers > 0 ? (categoryMetrics.analytics.optIn / totalUsers) * 100 : 0;
  categoryMetrics.performance.rate = totalUsers > 0 ? (categoryMetrics.performance.optIn / totalUsers) * 100 : 0;

  // Generate time series data (daily aggregates)
  const timeSeriesMap = new Map<string, { given: number; revoked: number; updated: number }>();
  for (const entry of entries) {
    const date = entry.timestamp.split('T')[0]; // Extract date (YYYY-MM-DD)
    const existing = timeSeriesMap.get(date) || { given: 0, revoked: 0, updated: 0 };

    if (entry.event === ConsentEventType.ConsentGiven) existing.given++;
    else if (entry.event === ConsentEventType.ConsentRevoked) existing.revoked++;
    else if (entry.event === ConsentEventType.ConsentUpdated) existing.updated++;

    timeSeriesMap.set(date, existing);
  }

  const timeSeriesData = Array.from(timeSeriesMap.entries())
    .map(([date, counts]) => ({
      date,
      consentGiven: counts.given,
      consentRevoked: counts.revoked,
      consentUpdated: counts.updated,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalEvents: entries.length,
    totalUsers,
    consentGiven,
    consentRevoked,
    consentUpdated,
    categoryMetrics,
    timeSeriesData,
    lastUpdate: entries[entries.length - 1].timestamp,
  };
}

/**
 * Get consent opt-in rate for a specific category
 * @param category Consent category
 * @param ledgerPath Path to consent ledger file
 * @returns Opt-in rate (0-100)
 */
export function getConsentOptInRate(
  category: ConsentCategory,
  ledgerPath: string = 'governance/consent/ledger.jsonl'
): number {
  const metrics = aggregateConsentMetrics(ledgerPath);
  return metrics.categoryMetrics[category].rate;
}

/**
 * Get recent consent events
 * @param limit Maximum number of events
 * @param ledgerPath Path to consent ledger file
 * @returns Recent events (newest first)
 */
export function getRecentConsentEvents(
  limit: number = 10,
  ledgerPath: string = 'governance/consent/ledger.jsonl'
): ConsentLedgerEntry[] {
  const entries = parseConsentLedger(ledgerPath);
  return entries.slice(-limit).reverse();
}

