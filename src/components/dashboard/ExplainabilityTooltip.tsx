'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface ExplainabilityTooltipProps {
  metric: 'eii' | 'seo' | 'a11y' | 'performance' | 'bundle';
  className?: string;
}

/**
 * ExplainabilityTooltip Component
 *
 * Provides accessible, collapsible explanations for ethical metrics.
 * Implements WCAG 2.2 AA with keyboard navigation and ARIA labels.
 */
export function ExplainabilityTooltip({ metric, className = '' }: ExplainabilityTooltipProps) {
  const t = useTranslations('dashboard.explainability');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={`explainability-tooltip ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Hide' : 'Show'} explanation for ${metric}`}
        className="explainability-toggle inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <svg
          className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{isExpanded ? 'Hide explanation' : 'What does this mean?'}</span>
      </button>

      {isExpanded && (
        <div
          className="explainability-content mt-4 space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4"
          role="region"
          aria-label={`Explanation for ${metric}`}
        >
          <section>
            <h4 className="mb-2 font-semibold text-gray-900">What this metric means</h4>
            <p className="text-sm leading-relaxed text-gray-700">{t(`${metric}.what`)}</p>
          </section>

          <section>
            <h4 className="mb-2 font-semibold text-gray-900">How we calculate it</h4>
            <p className="text-sm leading-relaxed text-gray-700">{t(`${metric}.how`)}</p>
          </section>

          <section>
            <h4 className="mb-2 font-semibold text-gray-900">Why it matters</h4>
            <p className="text-sm leading-relaxed text-gray-700">{t(`${metric}.why`)}</p>
          </section>
        </div>
      )}
    </div>
  );
}
