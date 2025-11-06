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
export function ReviewDashboard({
  initialStatus,
  initialHistory,
  apiKey,
}: ReviewDashboardProps) {
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
      <div className="rounded-lg border-2 border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
          System Overview
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Release Candidate
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {status.release_candidate}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Commit Hash
            </p>
            <p className="font-mono text-sm text-gray-900 dark:text-gray-100">
              {status.commit_hash}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Readiness State
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {status.readiness_state.replace(/_/g, ' ').toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Sign-Off Progress */}
      <div className="rounded-lg border-2 border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
          Sign-Off Progress
        </h2>
        <div className="space-y-2">
          {status.required_signoffs.map((role) => {
            const isComplete = status.completed_signoffs.includes(role);
            return (
              <div
                key={role}
                className="flex items-center justify-between rounded-md border border-gray-200 p-3 dark:border-gray-700"
              >
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {role}
                </span>
                {isComplete ? (
                  <span className="text-green-600 dark:text-green-400">
                    ✅ Complete
                  </span>
                ) : (
                  <span className="text-gray-500 dark:text-gray-500">
                    ⏳ Pending
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Integrity Status */}
      {status.integrity_snapshot && (
        <IntegrityStatusPanel snapshot={status.integrity_snapshot} />
      )}

      {/* Blocking Issues */}
      {status.blocking_issues.length > 0 && (
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
          <h2 className="mb-4 text-xl font-bold text-red-800 dark:text-red-300">
            ⚠️ Blocking Issues
          </h2>
          <ul className="list-inside list-disc space-y-2 text-sm text-red-700 dark:text-red-400">
            {status.blocking_issues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {/* API Key Input (if not authenticated) */}
      {showApiKeyInput && !apiKey && (
        <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
          <h2 className="mb-4 text-xl font-bold text-blue-800 dark:text-blue-300">
            Authentication Required
          </h2>
          <p className="mb-4 text-sm text-blue-700 dark:text-blue-400">
            Enter your API key to submit sign-offs. Contact governance team if
            you don't have a key.
          </p>
          <div className="flex space-x-2">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Enter API key"
              className="flex-1 rounded-md border border-blue-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-blue-700 dark:bg-gray-800 dark:text-gray-100"
            />
            <button
              onClick={() => setShowApiKeyInput(false)}
              className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Set Key
            </button>
          </div>
        </div>
      )}

      {/* Sign-Off Form */}
      {currentApiKey && status.integrity_snapshot && (
        <SignOffForm
          integrityState={status.integrity_snapshot.system_state}
          apiKey={currentApiKey}
          onSuccess={handleSignOffSuccess}
        />
      )}

      {/* Review History */}
      <ReviewHistory signoffs={history} />
    </div>
  );
}

