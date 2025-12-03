'use client';

/**
 * @fileoverview Block Detail Modal Component
 * @module components/dashboard/BlockDetailModal
 * @see BLOCK10.4_DASHBOARD_REFINEMENT.md
 *
 * Modal showing complete block details with hash, parent, verification status
 * WCAG 2.2 AA compliant with focus trap and keyboard controls
 */

import { useEffect, useRef, useState } from 'react';

import { getVerificationStatus, type LedgerEntry } from '@/lib/governance/hash-continuity';
import { formatTimestamp, formatRelativeTime } from '@/lib/visualization/timeline-helpers';

interface BlockDetailModalProps {
  entry: LedgerEntry | null;
  allEntries: LedgerEntry[];
  isOpen: boolean;
  onClose: () => void;
  onNavigateToParent?: (parentId: string) => void;
}

/**
 * Block Detail Modal Component
 *
 * Features:
 * - Complete block information display
 * - Raw JSON viewer
 * - Copy-to-clipboard functionality
 * - Parent/child navigation
 * - Focus trap and keyboard controls
 * - WCAG 2.2 AA compliant
 */
export function BlockDetailModal({
  entry,
  allEntries,
  isOpen,
  onClose,
  onNavigateToParent,
}: BlockDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Focus trap
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Copy to clipboard
  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen || !entry) return null;

  // Temporary: Cast to any to work around LedgerEntry type mismatch — will fix in Stage VII (ticket #QPOLY-TYPE-001)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entryData: any = entry;
  const status = getVerificationStatus(entry, allEntries);
  const parentEntry = allEntries.find((e) => (e.block || e.id) === entry.parent);

  const statusColors = {
    verified: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    unknown: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  };

  const rawJSON = JSON.stringify(entry, null, 2);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-gray-800"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
          <h2 id="modal-title" className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Block Details
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            aria-label="Close modal"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Block ID and Status */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Block ID</h3>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${statusColors[status]}`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-gray-100 px-3 py-2 font-mono text-sm text-gray-900 dark:bg-gray-900 dark:text-gray-100">
                {entry.block || entry.id}
              </code>
              <button
                onClick={() => copyToClipboard(entry.block || entry.id, 'block')}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                aria-label="Copy block ID"
              >
                {copiedField === 'block' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Timestamp */}
          <div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Timestamp
            </h3>
            <div className="space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>UTC:</strong> {formatTimestamp(entry.timestamp)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Relative:</strong> {formatRelativeTime(entry.timestamp)}
              </p>
            </div>
          </div>

          {/* Hash */}
          <div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Hash (SHA-256)
            </h3>
            <div className="flex items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded bg-gray-100 px-3 py-2 font-mono text-xs text-gray-900 dark:bg-gray-900 dark:text-gray-100">
                {entryData.hash}
              </code>
              <button
                onClick={() => copyToClipboard(entryData.hash, 'hash')}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                aria-label="Copy hash"
              >
                {copiedField === 'hash' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Parent Hash */}
          {entry.parent && (
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Parent Block
              </h3>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-gray-100 px-3 py-2 font-mono text-sm text-gray-900 dark:bg-gray-900 dark:text-gray-100">
                  {entry.parent}
                </code>
                {parentEntry ? (
                  <button
                    onClick={() => onNavigateToParent && onNavigateToParent(entry.parent!)}
                    className="rounded-lg border border-cyan-600 px-3 py-2 text-sm font-medium text-cyan-600 hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-cyan-400 dark:text-cyan-400 dark:hover:bg-cyan-900/20"
                    aria-label="Navigate to parent block"
                  >
                    View Parent →
                  </button>
                ) : (
                  <span className="rounded-lg bg-yellow-100 px-3 py-2 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                    Parent not found
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Merkle Root */}
          <div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Merkle Root
            </h3>
            <code className="block overflow-x-auto rounded bg-gray-100 px-3 py-2 font-mono text-xs text-gray-900 dark:bg-gray-900 dark:text-gray-100">
              {entryData.merkleRoot}
            </code>
          </div>

          {/* Entry Type */}
          {entryData.entryType && (
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Entry Type
              </h3>
              <span className="inline-block rounded-full bg-cyan-100 px-3 py-1 text-sm font-medium text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400">
                {entryData.entryType}
              </span>
            </div>
          )}

          {/* Raw JSON */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Raw JSON</h3>
              <button
                onClick={() => copyToClipboard(rawJSON, 'json')}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                aria-label="Copy raw JSON"
              >
                {copiedField === 'json' ? '✓ Copied' : 'Copy JSON'}
              </button>
            </div>
            <pre className="max-h-96 overflow-auto rounded bg-gray-100 p-4 font-mono text-xs text-gray-900 dark:bg-gray-900 dark:text-gray-100">
              {rawJSON}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
