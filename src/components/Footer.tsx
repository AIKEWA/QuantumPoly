/**
 * Footer component
 *
 * ADR: Prop-driven social links chosen over fixed markup for i18n and extensibility.
 *
 * A semantic, accessible, and themeable site footer. All user-visible strings are supplied
 * via props to enable internationalisation and customisation. No low-level markup is
 * hard-coded; instead, callers fully control labels and text content. The component
 * supports an optional advanced `socialSlot` override for bespoke layouts while still
 * exposing a simple API for common use-cases.
 */

import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';

import { LanguageSwitcher } from './LanguageSwitcher';

export type SocialLink = {
  /** Accessible label (visually hidden) & link text */
  label: string;
  /** Destination */
  href: string;
};

export type PolicyLink = {
  /** Accessible label for policy link */
  label: string;
  /** Destination (internal route) */
  href: string;
};

export interface FooterProps {
  /** Brand or site title */
  brand: string;
  /** Optional tagline displayed beneath the brand */
  tagline?: string;
  /** Copyright notice (already localised) */
  copyright: string;
  /** Optional array of social links */
  socialLinks?: SocialLink[];
  /** Optional array of policy/trust links */
  policyLinks?: PolicyLink[];
  /** ARIA label for policy navigation (localised) */
  policyNavLabel?: string;
  /** Heading level for the brand element (defaults to 2) */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Tailwind utility class extension */
  className?: string;
  /** Slot to completely override the social links layout */
  socialSlot?: React.ReactNode;
}

const Heading = ({
  level,
  children,
}: {
  level: FooterProps['headingLevel'];
  children: React.ReactNode;
}) => {
  const Tag = `h${level}` as unknown as keyof JSX.IntrinsicElements;
  return <Tag className="text-2xl font-bold text-cyan-400 dark:text-cyan-300">{children}</Tag>;
};

export function Footer({
  brand,
  tagline,
  copyright,
  socialLinks,
  policyLinks,
  policyNavLabel,
  headingLevel = 2,
  className,
  socialSlot,
}: FooterProps) {
  const renderSocialLinks = () => {
    if (socialSlot) return socialSlot;
    if (!socialLinks?.length) return null;

    return (
      <nav aria-label="Social links" className="mb-8">
        <ul className="flex justify-center gap-6">
          {socialLinks.map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                aria-label={`${label} (opens in new tab)`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm text-gray-500 transition-colors hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 dark:text-gray-400 dark:hover:text-cyan-300 dark:focus:ring-cyan-300"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  };

  const renderPolicyLinks = () => {
    if (!policyLinks?.length) return null;

    return (
      <nav aria-label={policyNavLabel || 'Trust and legal'} className="mb-6">
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {policyLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="rounded-sm text-sm text-gray-600 transition-colors hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 dark:text-gray-400 dark:hover:text-cyan-300 dark:focus:ring-cyan-300"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    );
  };

  return (
    <footer
      role="contentinfo"
      aria-labelledby={`footer-brand-${brand.replace(/\s+/g, '-').toLowerCase()}`}
      className={clsx(
        'bg-gray-50 px-4 py-12 text-gray-700 md:px-6 dark:bg-gray-900 dark:text-gray-300',
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
        <div id={`footer-brand-${brand.replace(/\s+/g, '-').toLowerCase()}`}>
          <Heading level={headingLevel}>{brand}</Heading>
        </div>

        {tagline && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{tagline}</p>}

        {renderSocialLinks()}

        {renderPolicyLinks()}

        <div className="mb-4 flex justify-center">
          <LanguageSwitcher />
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-400">{copyright}</p>
      </div>
    </footer>
  );
}
