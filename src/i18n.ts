import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// These values should match the ones in next-intl.config.js
export const locales = ['en', 'de', 'tr'];
export const defaultLocale = 'en';

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
}); 