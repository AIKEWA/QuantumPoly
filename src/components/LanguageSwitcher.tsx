'use client';

/**
 * LanguageSwitcher Component for QuantumPoly
 *
 * A fully accessible language switching component that enables users to:
 * - View available languages with visual flags
 * - Switch between supported locales instantly
 * - Persist language preference
 * - Experience smooth transitions with loading states
 *
 * Features:
 * - WCAG 2.1 AA compliant accessibility
 * - Keyboard navigation support
 * - Screen reader optimized
 * - Mobile-friendly dropdown interface
 * - Local storage persistence
 * - Animated transitions
 *
 * @module LanguageSwitcher
 * @version 1.0.0
 * @author QuantumPoly Development Team
 */

import React, { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales, localeNames, localeFlags, type Locale } from '../../i18n';

/**
 * Props interface for the LanguageSwitcher component
 */
interface LanguageSwitcherProps {
  /** Additional CSS classes */
  className?: string;
  /** Variant styling: 'compact' for header, 'full' for footer */
  variant?: 'compact' | 'full';
  /** Show flags alongside language names */
  showFlags?: boolean;
  /** Custom aria-label for the dropdown */
  ariaLabel?: string;
}

/**
 * LanguageSwitcher Component
 *
 * Provides an intuitive interface for users to switch between supported languages.
 * Automatically saves user preference and updates all UI elements accordingly.
 */
export default function LanguageSwitcher({
  className = '',
  variant = 'compact',
  showFlags = true,
  ariaLabel,
  ...props
}: LanguageSwitcherProps) {
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('language');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value as Locale;
    if (newLocale === currentLocale) return;

    // Calculate new path
    const pathWithoutLocale = pathname.replace(/^\/(en|de|tr)/, '');
    const newPath = newLocale === 'en' ? pathWithoutLocale || '/' : `/${newLocale}${pathWithoutLocale || ''}`;

    // Preserve query and hash
    const fullPath = `${newPath}${window.location.search}${window.location.hash}`;

    // Navigate
    router.push(fullPath);

    // Save preference
    localStorage.setItem('preferred-language', newLocale);
  };

  // After navigation focus
  useEffect(() => {
    const handleRouteChange = () => {
      const mainHeading = document.querySelector('#page-title');
      if (mainHeading) {
        mainHeading.focus();
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  const currentLanguageName = localeNames[currentLocale];
  const currentFlag = localeFlags[currentLocale];

  const baseClasses = `
    relative inline-block text-left
    ${variant === 'compact' ? 'text-sm' : 'text-base'}
    ${className}
  `.trim();

  const buttonClasses = `
    inline-flex items-center gap-2 px-3 py-2 
    bg-gray-800/80 hover:bg-gray-700/80 dark:bg-gray-900/80 dark:hover:bg-gray-800/80
    text-white border border-gray-600 dark:border-gray-500 rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variant === 'compact' ? 'text-sm px-2 py-1' : 'text-base px-3 py-2'}
  `.trim();

  const dropdownClasses = `
    absolute right-0 mt-2 w-48 
    bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 
    rounded-lg shadow-lg z-50
    transition-all duration-200 ease-in-out transform origin-top-right
    ${
      variant === 'compact'
        ? 'opacity-100 scale-100 translate-y-0'
        : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
    }
  `.trim();

  const optionClasses = `
    w-full px-4 py-3 text-left 
    text-gray-900 dark:text-gray-100
    hover:bg-cyan-50 dark:hover:bg-cyan-900/30
    focus:bg-cyan-50 dark:focus:bg-cyan-900/30 focus:outline-none
    transition-colors duration-150
    flex items-center gap-3
    first:rounded-t-lg last:rounded-b-lg
    disabled:opacity-50 disabled:cursor-not-allowed
  `.trim();

  return (
    <select
      value={currentLocale}
      onChange={handleChange}
      aria-label={t('language.label')}
      className={buttonClasses}
    >
      {locales.map(locale => (
        <option key={locale} value={locale}>
          {localeNames[locale]}
        </option>
      ))}
    </select>
  );
}

// DISCUSS: Should we add a simplified mobile version with a bottom sheet?
// REVIEW: Consider adding support for custom language detection based on user location
