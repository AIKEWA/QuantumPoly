/**
 * @fileoverview Sign-Off Form Component - Block 9.9
 * @module components/audit/SignOffForm
 * @see BLOCK9.9_FINAL_AUDIT_AND_HANDOFF.md
 *
 * Human sign-off input form with validation
 */

'use client';

import { useState } from 'react';

import type {
  ReviewRole,
  ReviewDecision,
  SignOffSubmission,
  ExceptionJustification,
  SystemState,
} from '@/lib/audit/types';

interface SignOffFormProps {
  integrityState: SystemState;
  apiKey: string;
  onSuccess: () => void;
}

const REVIEW_ROLES: ReviewRole[] = [
  'Lead Engineer',
  'Governance Officer',
  'Legal Counsel',
  'Accessibility Reviewer',
];

const REVIEW_SCOPES: Record<ReviewRole, string[]> = {
  'Lead Engineer': [
    'System Architecture & Security Baseline',
    'Block 9.0-9.8 Implementation Verification',
    'Technical Infrastructure',
  ],
  'Governance Officer': [
    'Policy Alignment & Ethical Compliance',
    'Risk Disclosure & Transparency',
    'Governance Framework Integrity',
  ],
  'Legal Counsel': [
    'Jurisdictional Compliance',
    'Liability Review',
    'Legal Obligations & Disclosures',
  ],
  'Accessibility Reviewer': [
    'WCAG 2.2 AA Compliance',
    'Inclusive Design Verification',
    'Assistive Technology Compatibility',
  ],
};

/**
 * Sign-Off Form Component
 */
export function SignOffForm({ integrityState, apiKey, onSuccess }: SignOffFormProps) {
  const [reviewerName, setReviewerName] = useState('');
  const [role, setRole] = useState<ReviewRole>('Lead Engineer');
  const [decision, setDecision] = useState<ReviewDecision>('approved');
  const [notes, setNotes] = useState('');
  const [exceptions, setExceptions] = useState<ExceptionJustification[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requiresExceptions = integrityState === 'attention_required' && decision === 'approved';

  const handleAddException = () => {
    setExceptions([
      ...exceptions,
      {
        issue_description: '',
        rationale: '',
        mitigation_plan: '',
        mitigation_owner: '',
        deadline: '',
      },
    ]);
  };

  const handleRemoveException = (index: number) => {
    setExceptions(exceptions.filter((_, i) => i !== index));
    // Focus management would ideally go here or via useEffect to focus the previous element
  };

  const handleExceptionChange = (
    index: number,
    field: keyof ExceptionJustification,
    value: string,
  ) => {
    const updated = [...exceptions];
    updated[index] = { ...updated[index], [field]: value };
    setExceptions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const submission: SignOffSubmission = {
        reviewer_name: reviewerName.trim(),
        role,
        review_scope: REVIEW_SCOPES[role],
        decision,
        notes: notes.trim() || undefined,
        exceptions: exceptions.length > 0 ? exceptions : undefined,
      };

      const response = await fetch('/api/audit/sign-off', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(submission),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit sign-off');
      }

      // Success
      onSuccess();

      // Reset form
      setReviewerName('');
      setNotes('');
      setExceptions([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section
        className="rounded-lg border-2 border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
        aria-labelledby="signoff-form-heading"
      >
        <h2
          id="signoff-form-heading"
          className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100"
        >
          Submit Sign-Off
        </h2>
        <p id="form-description" className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Please review the integrity state and provide your formal sign-off. Fields marked with an
          asterisk (*) are required.
        </p>

        {/* Reviewer Name */}
        <div className="mb-4">
          <label
            htmlFor="reviewer-name"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Reviewer Name{' '}
            <span className="text-red-600" aria-hidden="true">
              *
            </span>
          </label>
          <input
            type="text"
            id="reviewer-name"
            name="reviewer-name"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            required
            aria-required="true"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            placeholder="Enter your full name"
          />
        </div>

        {/* Role */}
        <div className="mb-4">
          <label
            htmlFor="role"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Role{' '}
            <span className="text-red-600" aria-hidden="true">
              *
            </span>
          </label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as ReviewRole)}
            required
            aria-required="true"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          >
            {REVIEW_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Review Scope (Display Only) */}
        <div className="mb-4">
          <p
            id="review-scope-label"
            className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Review Scope
          </p>
          <ul
            aria-labelledby="review-scope-label"
            className="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400"
          >
            {REVIEW_SCOPES[role].map((scope) => (
              <li key={scope}>{scope}</li>
            ))}
          </ul>
        </div>

        {/* Decision */}
        <div className="mb-4">
          <label
            htmlFor="decision"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Decision{' '}
            <span className="text-red-600" aria-hidden="true">
              *
            </span>
          </label>
          <select
            id="decision"
            name="decision"
            value={decision}
            onChange={(e) => setDecision(e.target.value as ReviewDecision)}
            required
            aria-required="true"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="approved">Approved</option>
            <option value="approved_with_exceptions">Approved with Exceptions</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Exception Justifications */}
        <div aria-live="polite">
          {requiresExceptions && (
            <div
              className="mb-4 rounded-md border-2 border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20"
              role="region"
              aria-label="Exception Requirement"
            >
              <p className="mb-2 text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                ⚠️ Exception Justification Required
              </p>
              <p className="mb-3 text-sm text-yellow-700 dark:text-yellow-400">
                System integrity requires attention. You must document exceptions to approve.
              </p>

              {exceptions.map((exception, index) => (
                <fieldset
                  key={index}
                  className="mb-4 rounded border border-yellow-300 bg-white p-3 dark:border-yellow-700 dark:bg-gray-800"
                >
                  <legend className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                    Exception {index + 1}
                  </legend>
                  <div className="mb-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveException(index)}
                      aria-label={`Remove exception ${index + 1}`}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label htmlFor={`exception-${index}-desc`} className="sr-only">
                        Issue Description
                      </label>
                      <input
                        type="text"
                        id={`exception-${index}-desc`}
                        placeholder="Issue description *"
                        value={exception.issue_description}
                        onChange={(e) =>
                          handleExceptionChange(index, 'issue_description', e.target.value)
                        }
                        required
                        aria-required="true"
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label htmlFor={`exception-${index}-rationale`} className="sr-only">
                        Rationale
                      </label>
                      <textarea
                        id={`exception-${index}-rationale`}
                        placeholder="Rationale *"
                        value={exception.rationale}
                        onChange={(e) => handleExceptionChange(index, 'rationale', e.target.value)}
                        required
                        aria-required="true"
                        rows={2}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label htmlFor={`exception-${index}-mitigation`} className="sr-only">
                        Mitigation Plan
                      </label>
                      <textarea
                        id={`exception-${index}-mitigation`}
                        placeholder="Mitigation plan *"
                        value={exception.mitigation_plan}
                        onChange={(e) =>
                          handleExceptionChange(index, 'mitigation_plan', e.target.value)
                        }
                        required
                        aria-required="true"
                        rows={2}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label htmlFor={`exception-${index}-owner`} className="sr-only">
                        Mitigation Owner
                      </label>
                      <input
                        type="text"
                        id={`exception-${index}-owner`}
                        placeholder="Mitigation owner *"
                        value={exception.mitigation_owner}
                        onChange={(e) =>
                          handleExceptionChange(index, 'mitigation_owner', e.target.value)
                        }
                        required
                        aria-required="true"
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label htmlFor={`exception-${index}-deadline`} className="sr-only">
                        Deadline
                      </label>
                      <input
                        type="date"
                        id={`exception-${index}-deadline`}
                        placeholder="Deadline (optional)"
                        value={exception.deadline}
                        onChange={(e) => handleExceptionChange(index, 'deadline', e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </fieldset>
              ))}

              <button
                type="button"
                onClick={handleAddException}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                + Add Exception
              </button>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label
            htmlFor="notes"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            placeholder="Additional comments or observations"
          />
        </div>

        {/* Error Display */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 rounded-md bg-red-50 p-3 dark:bg-red-900/20"
          >
            <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div>
          {requiresExceptions && exceptions.length === 0 && (
            <p id="submit-disabled-reason" className="mb-2 text-sm text-red-600 dark:text-red-400">
              Exceptions are required for approval when system integrity needs attention.
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting || (requiresExceptions && exceptions.length === 0)}
            aria-describedby={
              requiresExceptions && exceptions.length === 0 ? 'submit-disabled-reason' : undefined
            }
            className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Sign-Off'}
          </button>
        </div>
      </section>
    </form>
  );
}
