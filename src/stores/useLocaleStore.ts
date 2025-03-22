import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { locales, defaultLocale } from '../i18n';
import { setCookie, getCookie } from '../utils/cookies';

const LOCALE_COOKIE_NAME = 'preferred-locale';

type LocaleState = {
  locale: string;
  setLocale: (locale: string) => void;
};

// Initialize with cookie value if available
const getInitialLocale = (): string => {
  if (typeof window !== 'undefined') {
    const cookieLocale = getCookie(LOCALE_COOKIE_NAME);
    if (cookieLocale && locales.includes(cookieLocale)) {
      return cookieLocale;
    }
  }
  return defaultLocale;
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: getInitialLocale(),
      setLocale: (locale) => {
        if (locales.includes(locale)) {
          set({ locale });
          
          // Also store in cookie for server-side access
          if (typeof window !== 'undefined') {
            setCookie(LOCALE_COOKIE_NAME, locale);
            // Remove the page reload, let the router handle navigation
            // window.location.href = `/${locale}`;
          }
        }
      },
    }),
    {
      name: 'locale-storage',
    }
  )
); 