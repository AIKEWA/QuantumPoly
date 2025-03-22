'use client';

import { useTranslations } from 'next-intl';
import { useLocaleStore } from '@/stores/useLocaleStore';
import { usePathname, useRouter } from 'next/navigation';
import { locales } from '@/i18n';

export default function LanguageSwitcher() {
  const t = useTranslations('LanguageSwitcher');
  const { locale, setLocale } = useLocaleStore();
  const pathname = usePathname();
  const router = useRouter();

  const handleLocaleChange = (newLocale: string) => {
    // Don't do anything if the locale hasn't changed
    if (newLocale === locale) {
      return;
    }
    
    setLocale(newLocale);
    
    // Extract the path without the locale prefix
    const pathWithoutLocale = pathname.split('/').slice(2).join('/');
    const newPath = `/${newLocale}/${pathWithoutLocale}`;
    
    router.push(newPath);
  };

  return (
    <div className="relative group">
      <button className="flex items-center space-x-1 text-sm">
        <span>{locale.toUpperCase()}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className="absolute right-0 mt-2 py-2 w-24 bg-white dark:bg-gray-800 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
        {locales.map((l) => (
          <button
            key={l}
            className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
              l === locale ? 'text-cyan-500' : ''
            }`}
            onClick={() => handleLocaleChange(l)}
          >
            {l === 'en' ? 'English' : l === 'de' ? 'Deutsch' : l === 'tr' ? 'Türkçe' : l}
          </button>
        ))}
      </div>
    </div>
  );
} 