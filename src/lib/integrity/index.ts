/**
 * @fileoverview Integrity Module Public API
 * @module lib/integrity
 *
 * Centralized access point for all integrity and governance verification logic.
 * Serves as the single source of truth for dashboard and audit components.
 */

// Internal Imports
import {
  getRecentEntries,
  parseLedger,
  getEntriesByType,
  getEntriesByDateRange,
  verifyLedgerIntegrity,
  getLedgerStats,
} from './ledger/reader';
import {
  aggregateConsentMetrics,
  getConsentOptInRate,
  getRecentConsentEvents,
} from './metrics/consent';
import {
  getEIIHistory,
  getEIIBreakdown,
  getCurrentEII,
  calculateEII,
  formatEII,
} from './metrics/eii';

// Export Types
export * from './types';
export * from './ledger/reader'; // Export ledger types
export * from './metrics/eii'; // Export EII types
export * from './metrics/consent'; // Export Consent types

// Export Core Engine
export { runIntegrityVerification } from './engine';

// Export Ledger Functions (Renamed for Integrity Context)
export const getIntegrityRecentEntries = getRecentEntries;
export const getIntegrityLedger = parseLedger;
export const getIntegrityEntriesByType = getEntriesByType;
export const getIntegrityEntriesByDateRange = getEntriesByDateRange;
export const verifyIntegrityLedger = verifyLedgerIntegrity;
export const getIntegrityLedgerStats = getLedgerStats;

// Export Metrics Functions (Renamed for Integrity Context)
export const getIntegrityConsentMetrics = aggregateConsentMetrics;
export const getIntegrityConsentOptInRate = getConsentOptInRate;
export const getIntegrityRecentConsentEvents = getRecentConsentEvents;

export const getIntegrityEIIHistory = getEIIHistory;
export const getIntegrityEIIBreakdown = getEIIBreakdown;
export const getIntegrityCurrentEII = getCurrentEII;
export const calculateIntegrityEII = calculateEII;
export const formatIntegrityEII = formatEII;
