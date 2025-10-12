'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ChangeEvent, useTransition } from 'react';

import { Locale, locales } from '@/i18n';

export type LanguageSwitcherProps = {
  /**
   * Additional CSS classes to apply to the select element
   */
  className?: string;
};

/**
 * LanguageSwitcher component for switching between supported locales
 *
 * Accessible dropdown with ARIA labeling, keyboard navigation,
 * and current language indication. Preserves URL path during locale switching.
 */
export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const t = useTranslations('common.language');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value as Locale;

    startTransition(() => {
      // Remove the current locale from the pathname
      const pathnameWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

      // Navigate to the new locale with the same path
      router.replace(`/${nextLocale}${pathnameWithoutLocale}`);
    });
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <label htmlFor="language-switcher" className="sr-only">
        {t('switchLanguage')}
      </label>
      <select
        id="language-switcher"
        name="locale"
        value={locale}
        onChange={handleLocaleChange}
        disabled={isPending}
        aria-label={t('switchLanguage')}
        data-testid="language-switcher"
        className="
          appearance-none rounded-md border border-gray-300 bg-white px-4 py-2 pr-8
          text-sm font-medium text-gray-700
          hover:bg-gray-50
          focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-50
          dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700
        "
      >
        {locales.map((loc) => (
          <option key={loc} value={loc} data-locale={loc}>
            {t(loc)}
          </option>
        ))}
      </select>
      {/* Custom dropdown arrow */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <svg
          className="h-4 w-4 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
}

