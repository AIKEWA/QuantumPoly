/**
 * @fileoverview Review Dashboard Container - Block 9.9
 * @module components/audit/ReviewDashboard
 * @see BLOCK9.9_FINAL_AUDIT_AND_HANDOFF.md
 *
 * Main dashboard container component
 */

'use client';

import { useState } from 'react';

import type { AuditStatusResponse, PublicSignOffSummary } from '@/lib/audit/types';

import { IntegrityStatusPanel } from './IntegrityStatusPanel';
import { ReviewHistory } from './ReviewHistory';
import { SignOffForm } from './SignOffForm';

interface ReviewDashboardProps {
  initialStatus: AuditStatusResponse;
  initialHistory: PublicSignOffSummary[];
  apiKey: string | null;
}

/**
 * Review Dashboard Component
 */
export function ReviewDashboard({ initialStatus, initialHistory, apiKey }: ReviewDashboardProps) {
  const [status, setStatus] = useState(initialStatus);
  const [history, setHistory] = useState(initialHistory);
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey);
  const [apiKeyInput, setApiKeyInput] = useState('');

  const refreshData = async () => {
    try {
      // Refresh status
      const statusRes = await fetch('/api/audit/status', { cache: 'no-store' });
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setStatus(statusData);
      }

      // Refresh history
      const historyRes = await fetch('/api/audit/history', { cache: 'no-store' });
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData.signoffs);
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  const handleSignOffSuccess = () => {
    refreshData();
  };

  const currentApiKey = apiKey || apiKeyInput;

  return (
    <div className="space-y-8">
      {/* System Overview */}
      <section
        className="rounded-lg border-2 border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
        aria-labelledby="system-overview-heading"
      >
        <h2
          id="system-overview-heading"
          className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100"
        >
          System Overview
        </h2>
        <dl className="grid gap-4 md:grid-cols-3" role="status" aria-live="polite">
          <div>
            <dt className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Release Candidate
            </dt>
            <dd className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {status.release_candidate}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-700 dark:text-gray-300">Commit Hash</dt>
            <dd className="font-mono text-sm text-gray-900 dark:text-gray-100">
              {status.commit_hash}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Readiness State
            </dt>
            <dd className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {status.readiness_state.replace(/_/g, ' ').toUpperCase()}
            </dd>
          </div>
        </dl>
      </section>

      {/* Sign-Off Progress */}
      <section
        className="rounded-lg border-2 border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
        aria-labelledby="sign-off-progress-heading"
      >
        <h2
          id="sign-off-progress-heading"
          className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100"
        >
          Sign-Off Progress
        </h2>
        <ul className="space-y-2" aria-live="polite">
          {status.required_signoffs.map((role) => {
            const isComplete = status.completed_signoffs.includes(role);
            return (
              <li
                key={role}
                className="flex items-center justify-between rounded-md border border-gray-200 p-3 dark:border-gray-700"
              >
                <span className="font-medium text-gray-900 dark:text-gray-100">{role}</span>
                {isComplete ? (
                  <span className="text-green-600 dark:text-green-400">
                    <span aria-hidden="true">✅</span> Complete
                  </span>
                ) : (
                  <span className="text-gray-500 dark:text-gray-500">
                    <span aria-hidden="true">⏳</span> Pending
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Integrity Status */}
      {status.integrity_snapshot && <IntegrityStatusPanel snapshot={status.integrity_snapshot} />}

      {/* Blocking Issues */}
      {status.blocking_issues.length > 0 && (
        <section
          className="rounded-lg border-2 border-red-300 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20"
          aria-labelledby="blocking-issues-heading"
          role="alert"
          aria-live="assertive"
        >
          <h2
            id="blocking-issues-heading"
            className="mb-4 text-xl font-bold text-red-800 dark:text-red-300"
          >
            ⚠️ Blocking Issues
          </h2>
          <ul className="list-inside list-disc space-y-2 text-sm text-red-700 dark:text-red-400">
            {status.blocking_issues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </section>
      )}

      {/* API Key Input (if not authenticated) */}
      {showApiKeyInput && !apiKey && (
        <section
          className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20"
          aria-labelledby="auth-heading"
        >
          <h2 id="auth-heading" className="mb-4 text-xl font-bold text-blue-800 dark:text-blue-300">
            Authentication Required
          </h2>
          <p className="mb-4 text-sm text-blue-700 dark:text-blue-400" id="auth-description">
            Enter your API key to submit sign-offs. Contact governance team if you don't have a key.
          </p>
          <div className="flex space-x-2">
            <input
              type="password"
              aria-label="API Key"
              aria-describedby="auth-description"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Enter API key"
              className="flex-1 rounded-md border border-blue-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-blue-700 dark:bg-gray-800 dark:text-gray-100"
            />
            <button
              onClick={() => {
                setShowApiKeyInput(false);
                // Announce unlock status if needed via a live region elsewhere
              }}
              className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Set Key
            </button>
          </div>
        </section>
      )}

      {/* Sign-Off Form */}
      {currentApiKey && status.integrity_snapshot && (
        <>
          <div role="status" aria-live="polite" className="sr-only">
            Sign-off form unlocked and available.
          </div>
          <SignOffForm
            integrityState={status.integrity_snapshot.system_state}
            apiKey={currentApiKey}
            onSuccess={handleSignOffSuccess}
          />
        </>
      )}

      {/* Review History */}
      <ReviewHistory signoffs={history} />
    </div>
  );
}
