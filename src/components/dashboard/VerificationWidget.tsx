'use client';

/**
 * @fileoverview Ledger Verification Widget
 * @module components/dashboard/VerificationWidget
 * @see BLOCK9.3_TRANSPARENCY_FRAMEWORK.md
 *
 * Real-time ledger verification with hash checking
 */

import { useState } from 'react';

interface VerificationResult {
  verified: boolean;
  merkleRoot: string;
  entries: number;
  lastUpdate: string;
  scope: string;
  error?: string;
}

interface VerificationWidgetProps {
  initialData?: VerificationResult;
}

/**
 * Verification Widget Component
 * Allows users to verify ledger integrity on-demand
 */
export function VerificationWidget({ initialData }: VerificationWidgetProps) {
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(
    initialData || null
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  /**
   * Trigger ledger verification
   */
  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch('/api/governance/verify?full=true');
      if (!response.ok) {
        throw new Error('Verification failed');
      }
      const data = await response.json();
      setVerificationResult(data);
    } catch (error) {
      setVerificationResult({
        verified: false,
        merkleRoot: '',
        entries: 0,
        lastUpdate: new Date().toISOString(),
        scope: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Copy Merkle root to clipboard
   */
  const handleCopy = async () => {
    if (!verificationResult?.merkleRoot) return;
    
    try {
      await navigator.clipboard.writeText(verificationResult.merkleRoot);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Ledger Verification
        </h3>
        <button
          onClick={handleVerify}
          disabled={isVerifying}
          className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-cyan-500 dark:hover:bg-cyan-600"
          aria-label="Verify ledger integrity"
        >
          {isVerifying ? 'Verifying...' : 'Verify Now'}
        </button>
      </div>

      {verificationResult ? (
        <div className="space-y-4">
          {/* Verification Status */}
          <div
            className={`rounded-lg p-4 ${
              verificationResult.verified
                ? 'bg-green-50 dark:bg-green-900/20'
                : 'bg-red-50 dark:bg-red-900/20'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {verificationResult.verified ? '✅' : '❌'}
              </span>
              <div>
                <p
                  className={`font-semibold ${
                    verificationResult.verified
                      ? 'text-green-800 dark:text-green-400'
                      : 'text-red-800 dark:text-red-400'
                  }`}
                >
                  {verificationResult.verified
                    ? 'Ledger Integrity Verified'
                    : 'Verification Failed'}
                </p>
                {verificationResult.error && (
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {verificationResult.error}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Verification Details */}
          {verificationResult.verified && (
            <div className="space-y-3">
              <div className="rounded bg-gray-50 p-3 dark:bg-gray-900">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Verification Scope
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {verificationResult.scope}
                </p>
              </div>

              <div className="rounded bg-gray-50 p-3 dark:bg-gray-900">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Total Entries
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {verificationResult.entries}
                </p>
              </div>

              <div className="rounded bg-gray-50 p-3 dark:bg-gray-900">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Last Update
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {new Date(verificationResult.lastUpdate).toLocaleString()}
                </p>
              </div>

              <div className="rounded bg-gray-50 p-3 dark:bg-gray-900">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Global Merkle Root
                  </p>
                  <button
                    onClick={handleCopy}
                    className="text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                    aria-label="Copy Merkle root to clipboard"
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <code className="block break-all font-mono text-xs text-gray-900 dark:text-gray-100">
                  {verificationResult.merkleRoot}
                </code>
              </div>
            </div>
          )}

          {/* Verification Info */}
          <div className="rounded bg-blue-50 p-3 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
            <p className="font-semibold">What does this mean?</p>
            <p className="mt-1">
              This verification confirms that all governance and consent ledger entries are
              cryptographically consistent, chronologically ordered, and have not been tampered with.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="mb-2">Click "Verify Now" to check ledger integrity</p>
          <p className="text-xs">
            This will verify both governance and consent ledgers
          </p>
        </div>
      )}
    </div>
  );
}

