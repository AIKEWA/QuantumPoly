'use client';

import React from 'react';
import { FaTwitter, FaLinkedin, FaGithub, FaDiscord } from 'react-icons/fa';
import { FooterProps, SocialLink } from '../types/components';
import { useTranslations } from 'next-intl';

/**
 * Footer Component
 *
 * A comprehensive site footer featuring:
 * - Accessible social media link navigation
 * - Semantic footer markup with proper landmarks
 * - Theme-aware styling with proper contrast
 * - Keyboard navigation and focus management
 * - Screen reader optimized content structure
 * - Customizable brand and copyright information
 * - Responsive design with mobile-first approach
 *
 * @param props - Footer component props
 * @returns JSX.Element - Rendered footer section
 */

// Default social media links are created within the component to avoid using hooks at module scope

export default function Footer(props: FooterProps) {
  const {
    brandName = 'QuantumPoly',
    copyrightText = `© ${new Date().getFullYear()} QuantumPoly. All rights reserved.`,
    tagline,
    socialLinks,
    footerLinks = [],
    className = '',
    id = 'footer-section',
    ...rest
  } = props as any;
  const t = useTranslations('footer');
  const computedSocialLinks: SocialLink[] =
    socialLinks && socialLinks.length > 0
      ? socialLinks
      : [
          {
            icon: <FaTwitter size={20} />,
            label: 'Follow us on Twitter',
            href: '#',
            platform: 'Twitter',
          },
          {
            icon: <FaLinkedin size={20} />,
            label: 'Connect with us on LinkedIn',
            href: '#',
            platform: 'LinkedIn',
          },
          {
            icon: <FaGithub size={20} />,
            label: 'View our code on GitHub',
            href: '#',
            platform: 'GitHub',
          },
          {
            icon: <FaDiscord size={20} />,
            label: 'Join our Discord community',
            href: '#',
            platform: 'Discord',
          },
        ];
  // REVIEW: Consider adding newsletter signup integration
  // FEEDBACK: Should we add a back-to-top button here?

  const handleSocialClick = (link: SocialLink) => {
    // DISCUSS: Add analytics tracking for social media clicks
    if (link.href && link.href !== '#') {
      window.open(link.href, '_blank', 'noopener noreferrer');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, link: SocialLink) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSocialClick(link);
    }
  };

  return (
    <footer
      id={id}
      className={`border-t border-gray-700 bg-gray-900 px-4 py-12 transition-colors duration-300 md:px-6 dark:border-gray-800 dark:bg-black ${className}`}
      role="contentinfo"
      aria-labelledby={`${id}-brand`}
      {...rest}
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center space-y-8">
          {/* Brand Section */}
          <div className="text-center">
            <h2
              id={`${id}-brand`}
              className="cyberpunk-glow rounded-lg text-xl font-bold text-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 sm:text-2xl"
              tabIndex={0}
            >
              {brandName}
            </h2>
          </div>

          {/* Additional Footer Links */}
          {footerLinks && footerLinks.length > 0 && (
            <nav
              className="flex flex-wrap justify-center gap-6 text-sm"
              aria-label="Footer navigation"
            >
              {footerLinks.map((link: { label: string; href: string }, index: number) => (
                <a
                  key={index}
                  href={link.href}
                  className="rounded text-gray-400 transition-colors duration-300 hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 dark:text-gray-500 dark:hover:text-cyan-300"
                  target={link.href.startsWith('http') ? '_blank' : '_self'}
                  rel={
                    link.href.startsWith('http')
                      ? 'noopener noreferrer'
                      : undefined
                  }
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {/* Social Media Links */}
          <nav
            className="flex justify-center gap-4 sm:gap-6"
            aria-label="Social media links"
            role="navigation"
          >
            {computedSocialLinks.map((link: SocialLink, index: number) => (
              <a
                key={index}
                href={link.href}
                aria-label={link.label}
                className="sr-only rounded-lg p-2 text-gray-400 transition-colors duration-300 hover:bg-gray-800/50 hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 dark:text-gray-500 dark:hover:bg-gray-700/50 dark:hover:text-cyan-300"
                target={link.href !== '#' ? '_blank' : '_self'}
                rel={link.href !== '#' ? 'noopener noreferrer' : undefined}
                onClick={e => {
                  if (link.href === '#') {
                    e.preventDefault();
                  }
                }}
                onKeyDown={e => handleKeyDown(e, link)}
              >
                <span className="sr-only">{link.label}</span>
                <div className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true">
                  {link.icon}
                </div>
              </a>
            ))}
          </nav>

          {/* Copyright and Tagline */}
          <div className="space-y-2 text-center">
            <p className="text-sm text-gray-500 transition-colors duration-300 dark:text-gray-400">
              {copyrightText}
            </p>
            {Object.prototype.hasOwnProperty.call(props as any, 'tagline') ? (
              tagline ? (
                <p className="text-sm text-gray-600 transition-colors duration-300 dark:text-gray-500">
                  {tagline}
                </p>
              ) : null
            ) : (
              <p className="text-sm text-gray-600 transition-colors duration-300 dark:text-gray-500">
                {'Building the future, responsibly.'}
              </p>
            )}
          </div>

          {/* Skip link for keyboard users */}
          <div className="sr-only">
            <a
              href="#hero-section"
              className="sr-only rounded bg-cyan-600 px-4 py-2 text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              Back to top
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
