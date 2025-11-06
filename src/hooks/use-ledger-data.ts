/**
 * @fileoverview Ledger Data Hook
 * @module hooks/useLedgerData
 * @see BLOCK10.4_DASHBOARD_REFINEMENT.md
 *
 * SWR-style hook for fetching and caching governance ledger data
 * with automatic polling, exponential backoff, and network awareness
 */

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Ledger entry interface matching API response
 */
export interface LedgerEntry {
  block: string;
  hash: string;
  timestamp: string;
  id: string;
  merkleRoot: string;
  entryType?: string;
  commit?: string;
  parent?: string;
  verified?: boolean;
}

/**
 * API response structure
 */
export interface LedgerResponse {
  entries: LedgerEntry[];
  latest: string;
  merkle_root: string;
  verified: boolean;
  totalEntries: number;
  returnedEntries: number;
  page: number;
  timestamp: string;
}

/**
 * Hook status states
 */
export type LedgerDataStatus = 'loading' | 'ready' | 'error' | 'stale';

/**
 * Hook options
 */
export interface UseLedgerDataOptions {
  refreshMs?: number;
  ledgerType?: 'governance' | 'consent' | 'federation';
  enabled?: boolean;
}

/**
 * Hook return value
 */
export interface UseLedgerDataReturn {
  data: LedgerResponse | null;
  status: LedgerDataStatus;
  error?: Error;
  refresh: () => void;
  lastUpdated: string | null;
}

/**
 * Custom hook for fetching ledger data with SWR-style caching
 *
 * @param options - Configuration options
 * @returns Ledger data, status, and control functions
 *
 * @example
 * ```tsx
 * const { data, status, error, refresh } = useLedgerData({ refreshMs: 15000 });
 *
 * if (status === 'loading') return <Spinner />;
 * if (status === 'error') return <Error message={error?.message} />;
 * if (status === 'stale') return <Warning>Data may be outdated</Warning>;
 *
 * return <Timeline entries={data.entries} />;
 * ```
 */
export function useLedgerData(options: UseLedgerDataOptions = {}): UseLedgerDataReturn {
  const { refreshMs = 15000, ledgerType = 'governance', enabled = true } = options;

  const [data, setData] = useState<LedgerResponse | null>(null);
  const [status, setStatus] = useState<LedgerDataStatus>('loading');
  const [error, setError] = useState<Error | undefined>(undefined);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const retryCount = useRef(0);
  const maxRetries = 5;
  const baseDelay = 1000; // 1 second
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const isOnline = useRef(true);

  /**
   * Calculate exponential backoff delay
   */
  const getBackoffDelay = useCallback((): number => {
    return Math.min(baseDelay * Math.pow(2, retryCount.current), 8000);
  }, []);

  /**
   * Fetch ledger data from API
   */
  const fetchLedger = useCallback(async () => {
    if (!enabled) return;

    try {
      const endpoint = `/api/ethics/ledger?ledger=${ledgerType}`;
      const response = await fetch(endpoint, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = (await response.json()) as LedgerResponse;

      setData(json);
      setStatus('ready');
      setError(undefined);
      setLastUpdated(new Date().toISOString());
      retryCount.current = 0;
      isOnline.current = true;
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(fetchError);

      // If we have cached data, mark as stale instead of error
      if (data) {
        setStatus('stale');
      } else {
        setStatus('error');
      }

      retryCount.current++;

      // Schedule retry with exponential backoff if under max retries
      if (retryCount.current < maxRetries) {
        const delay = getBackoffDelay();
        console.warn(
          `Ledger fetch failed. Retry ${retryCount.current}/${maxRetries} in ${delay}ms`,
          fetchError
        );
        setTimeout(fetchLedger, delay);
      } else {
        console.error('Max retries reached. Ledger fetch failed.', fetchError);
        isOnline.current = false;
      }
    }
  }, [enabled, ledgerType, data, getBackoffDelay]);

  /**
   * Manual refresh function
   */
  const refresh = useCallback(() => {
    retryCount.current = 0;
    setStatus('loading');
    fetchLedger();
  }, [fetchLedger]);

  /**
   * Set up polling and network status listeners
   */
  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchLedger();

    // Set up polling interval
    if (refreshMs > 0) {
      pollInterval.current = setInterval(fetchLedger, refreshMs);
    }

    // Network status listeners
    const handleOnline = () => {
      console.log('Network connection restored');
      isOnline.current = true;
      retryCount.current = 0;
      fetchLedger();
    };

    const handleOffline = () => {
      console.log('Network connection lost');
      isOnline.current = false;
      if (data) {
        setStatus('stale');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enabled, refreshMs, fetchLedger, data]);

  return {
    data,
    status,
    error,
    refresh,
    lastUpdated,
  };
}

