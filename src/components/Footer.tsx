"use client";

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

import React from "react";
import clsx from "clsx";

export type SocialLink = {
  /** Accessible label (visually hidden) & link text */
  label: string;
  /** Destination */
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
  /** Heading level for the brand element (defaults to 2) */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Tailwind utility class extension */
  className?: string;
  /** Slot to completely override the social links layout */
  socialSlot?: React.ReactNode;
}

const Heading = ({ level, children }: { level: FooterProps["headingLevel"]; children: React.ReactNode }) => {
  const Tag = (`h${level}` as unknown) as keyof JSX.IntrinsicElements;
  return <Tag className="text-2xl font-bold text-cyan-400 dark:text-cyan-300">{children}</Tag>;
};

export default function Footer({
  brand,
  tagline,
  copyright,
  socialLinks,
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
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-cyan-400 dark:text-gray-400 dark:hover:text-cyan-300 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 dark:focus:ring-cyan-300 rounded-sm"
              >
                {label}
                <span className="sr-only"> (opens in new tab)</span>
              </a>
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
      className={clsx("py-12 px-4 md:px-6 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300", className)}
    >
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
        <div id={`footer-brand-${brand.replace(/\s+/g, '-').toLowerCase()}`}>
          <Heading level={headingLevel}>{brand}</Heading>
        </div>

        {tagline && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{tagline}</p>}

        {renderSocialLinks()}

        <p className="text-xs text-gray-500 dark:text-gray-500">{copyright}</p>
      </div>
    </footer>
  );
} 