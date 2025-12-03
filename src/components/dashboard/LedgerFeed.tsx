'use client';

/**
 * @fileoverview Governance Ledger Feed Component
 * @module components/dashboard/LedgerFeed
 * @see BLOCK9.3_TRANSPARENCY_FRAMEWORK.md
 * @see BLOCK10.4_DASHBOARD_REFINEMENT.md
 *
 * Enhanced ledger feed with filtering, virtualization, deep linking, and copy-to-clipboard
 */

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';

interface LedgerEntry {
  id: string;
  timestamp: string;
  entryType?: string;
  blockId?: string;
  block?: string;
  status?: string;
  title?: string;
  hash: string;
  merkleRoot: string;
}

interface LedgerFeedProps {
  entries: LedgerEntry[];
  locale?: string;
  maxEntries?: number;
  showFilters?: boolean;
  onEntryClick?: (entry: LedgerEntry) => void;
}

/**
 * Format entry type for display
 */
function formatEntryType(type?: string): string {
  if (!type) return 'EII Baseline';

  const typeMap: Record<string, string> = {
    'eii-baseline': 'EII Baseline',
    'feedback-synthesis': 'Feedback Synthesis',
    audit_closure: 'Audit Closure',
    legal_compliance: 'Legal Compliance',
    implementation_verification: 'Implementation Verification',
    consent_baseline: 'Consent Management',
    transparency_extension: 'Transparency Framework',
  };

  return typeMap[type] || type;
}

/**
 * Get status badge color
 */
function getStatusColor(status?: string): string {
  if (!status) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

  const colorMap: Record<string, string> = {
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    approved_with_conditions: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  };

  return colorMap[status] || colorMap.approved;
}

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Ledger Feed Component
 * Enhanced with filtering, deep linking, and copy-to-clipboard
 */
export function LedgerFeed({
  entries,
  locale = 'en',
  maxEntries = 5,
  showFilters = false,
  onEntryClick,
}: LedgerFeedProps) {
  const searchParams = useSearchParams();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [highlightedBlock, setHighlightedBlock] = useState<string | null>(null);

  // Deep linking: highlight block from URL
  useEffect(() => {
    const blockParam = searchParams?.get('block');
    if (blockParam) {
      setHighlightedBlock(blockParam);
      // Scroll to highlighted entry
      setTimeout(() => {
        const element = document.getElementById(`entry-${blockParam}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [searchParams]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    let filtered = entries;

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((e) => e.entryType === typeFilter);
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.id.toLowerCase().includes(query) ||
          (e.blockId || e.block || '').toLowerCase().includes(query) ||
          e.hash.toLowerCase().includes(query) ||
          (e.title || '').toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [entries, typeFilter, searchQuery]);

  const displayEntries = maxEntries > 0 ? filteredEntries.slice(0, maxEntries) : filteredEntries;

  // Get unique entry types for filter
  const entryTypes = useMemo(() => {
    const types = new Set(entries.map((e) => e.entryType).filter(Boolean));
    return Array.from(types);
  }, [entries]);

  // Copy to clipboard
  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Recent Governance Entries
        </h3>
        <p className="text-gray-500 dark:text-gray-400">No ledger entries available</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      role="feed"
      aria-label="Governance ledger feed"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Recent Governance Entries
        </h3>
        <Link
          href={`/${locale}/dashboard/ledger`}
          className="text-sm font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
        >
          View Full Ledger →
        </Link>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="min-w-[200px] flex-1">
            <label htmlFor="search" className="sr-only">
              Search entries
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search by ID, block, hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label htmlFor="type-filter" className="sr-only">
              Filter by type
            </label>
            <select
              id="type-filter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="all">All Types</option>
              {entryTypes.map((type) => (
                <option key={type} value={type}>
                  {formatEntryType(type)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {displayEntries.length === 0 ? (
        <p className="py-8 text-center text-gray-500 dark:text-gray-400">
          No entries match your filters
        </p>
      ) : (
        <div className="space-y-4">
          {displayEntries.map((entry, index) => {
            const blockId = entry.blockId || entry.block || entry.id;
            const isHighlighted = highlightedBlock === blockId;

            return (
              // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-tabindex
              <div
                key={entry.id}
                id={`entry-${blockId}`}
                className={`rounded-lg border p-4 transition-all ${
                  isHighlighted
                    ? 'border-cyan-500 bg-cyan-50 shadow-lg dark:border-cyan-400 dark:bg-cyan-900/20'
                    : 'border-gray-200 bg-gray-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-900'
                } ${onEntryClick ? 'cursor-pointer' : ''}`}
                onClick={() => onEntryClick && onEntryClick(entry)}
                onKeyDown={(e) => {
                  if (onEntryClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onEntryClick(entry);
                  }
                }}
                // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                tabIndex={onEntryClick ? 0 : undefined}
                role={onEntryClick ? 'button' : 'article'}
                aria-posinset={index + 1}
                aria-setsize={displayEntries.length}
              >
                {/* Header */}
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {formatEntryType(entry.entryType)}
                      </span>
                      {blockId && (
                        <span className="rounded bg-cyan-100 px-2 py-0.5 text-xs font-medium text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400">
                          Block {blockId}
                        </span>
                      )}
                      {entry.status && (
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${getStatusColor(entry.status)}`}
                        >
                          {entry.status.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                    {entry.title && (
                      <p className="text-sm text-gray-700 dark:text-gray-300">{entry.title}</p>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="mb-2 text-xs text-gray-600 dark:text-gray-400">
                  <p>
                    <span className="font-medium">ID:</span> {entry.id}
                  </p>
                  <p>
                    <span className="font-medium">Timestamp:</span>{' '}
                    {formatTimestamp(entry.timestamp)}
                  </p>
                </div>

                {/* Hash with copy button */}
                <div className="rounded bg-white p-2 dark:bg-gray-800">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Hash:</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(entry.hash, `hash-${entry.id}`);
                      }}
                      className="text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400"
                      aria-label="Copy hash to clipboard"
                    >
                      {copiedField === `hash-${entry.id}` ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <code className="block overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs text-gray-900 dark:text-gray-100">
                    {entry.hash}
                  </code>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 border-t border-gray-200 pt-4 text-center dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Showing {displayEntries.length} of {filteredEntries.length} entries
          {filteredEntries.length < entries.length && ` (filtered from ${entries.length})`}
        </p>
      </div>
    </div>
  );
}
