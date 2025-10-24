import type { ReactNode } from 'react';

import type { TocItem } from '@/lib/policies/extract-toc';
import type { PolicyMetadata } from '@/lib/policies/policy-schema';

interface PolicyLayoutProps {
  /** Validated policy metadata */
  metadata: PolicyMetadata;
  /** Policy content (rendered HTML or React nodes) */
  children: ReactNode;
  /** Optional table of contents */
  toc?: TocItem[];
  /** Whether English fallback is being used */
  isFallback?: boolean;
  /** Locale for date formatting (defaults to 'en') */
  locale?: string;
}

/**
 * Get status badge styling based on policy status.
 * Uses theme-safe tokens for dark mode compatibility.
 */
function getStatusBadgeClass(status: PolicyMetadata['status']): string {
  switch (status) {
    case 'published':
      return 'bg-surface-secondary text-primary border-primary';
    case 'in-progress':
      return 'bg-surface-secondary text-text border-gray-300';
    case 'draft':
      return 'bg-surface text-text-muted border-gray-200';
    default:
      return 'bg-surface text-text-muted border-gray-200';
  }
}

/**
 * Format an ISO date string for display using Intl API.
 * @param isoDate - ISO date string (YYYY-MM-DD)
 * @param locale - Locale for formatting (defaults to 'en')
 */
function formatDate(isoDate: string, locale = 'en'): string {
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

/**
 * Accessible layout for policy pages with metadata display and optional TOC.
 * Uses semantic HTML and ARIA landmarks for screen reader navigation.
 */
export function PolicyLayout({
  metadata,
  children,
  toc,
  isFallback = false,
  locale = 'en',
}: PolicyLayoutProps) {
  const { title, summary, status, owner, lastReviewed, nextReviewDue, version } = metadata;
  const isOverdue = new Date(nextReviewDue) < new Date();

  return (
    <div className="min-h-screen bg-surface font-sans">
      {/* Skip to main content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Translation fallback notice */}
      {isFallback && (
        <div
          role="status"
          aria-live="polite"
          className="border-b border-gray-300 bg-surface-secondary px-4 py-3 text-center"
        >
          <p className="text-body-sm text-text">
            <span className="font-medium">Translation in progress</span> — Showing English content
            for now. We're working on bringing you this page in your preferred language.
          </p>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1fr,18rem]">
          {/* Main content area */}
          <main id="main-content" aria-labelledby="page-title">
            {/* Page header with metadata */}
            <header className="mb-8 border-b border-gray-200 pb-6">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-md border px-3 py-1 text-body-sm font-medium ${getStatusBadgeClass(status)}`}
                  aria-label={`Status: ${status}`}
                >
                  {status === 'in-progress'
                    ? 'In Progress'
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
                <span
                  className="inline-flex items-center rounded-md border border-gray-200 bg-surface-secondary px-3 py-1 font-mono text-body-sm text-text-muted"
                  aria-label={`Version ${version}`}
                >
                  {version}
                </span>
                {isOverdue && (
                  <span
                    role="status"
                    aria-live="polite"
                    className="inline-flex items-center rounded-md border border-red-300 bg-red-50 px-3 py-1 text-body-sm font-medium text-red-800"
                  >
                    Review overdue — please review this page
                  </span>
                )}
              </div>

              <h1 id="page-title" className="mb-3 text-heading-3xl font-bold text-text">
                {title}
              </h1>

              <p className="text-body-lg text-text-muted">{summary}</p>

              <dl className="mt-4 grid grid-cols-1 gap-4 text-body-sm sm:grid-cols-2">
                <div>
                  <dt className="font-medium text-text">Owner</dt>
                  <dd className="mt-1 text-text-muted">{owner}</dd>
                </div>
                <div>
                  <dt className="font-medium text-text">Last Reviewed</dt>
                  <dd className="mt-1 text-text-muted">
                    <time dateTime={lastReviewed}>{formatDate(lastReviewed, locale)}</time>
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-medium text-text">Next Review Due</dt>
                  <dd className="mt-1 text-text-muted">
                    <time dateTime={nextReviewDue}>{formatDate(nextReviewDue, locale)}</time>
                  </dd>
                </div>
              </dl>
            </header>

            {/* Policy content */}
            <article className="prose prose-lg max-w-none text-text">{children}</article>
          </main>

          {/* Sidebar with table of contents */}
          {toc && toc.length > 0 && (
            <aside className="mt-8 md:mt-0" aria-labelledby="toc-heading">
              <nav
                className="sticky top-8 rounded-lg border border-gray-200 bg-surface-secondary p-6"
                aria-label="Table of contents"
              >
                <h2 id="toc-heading" className="mb-4 text-heading-sm font-semibold text-text">
                  On This Page
                </h2>
                <ol className="space-y-2 text-body-sm">
                  {toc.map((item) => (
                    <li
                      key={item.id}
                      className={item.level === 3 ? 'ml-4' : ''}
                      style={{ listStyleType: 'none' }}
                    >
                      <a
                        href={`#${item.id}`}
                        className="block rounded-md px-2 py-1 text-text-muted transition-colors hover:bg-surface hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-surface-secondary px-4 py-6">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-body-sm text-text-muted">
            Policy version {metadata.version} • Last reviewed{' '}
            {formatDate(metadata.lastReviewed, locale)}
          </p>
        </div>
      </footer>
    </div>
  );
}
