import { getRequestConfig } from 'next-intl/server';
import { locales } from '../src/i18n/index';
import { notFound } from 'next/navigation';

// Thin re-export that defers to canonical locales and messages
export default getRequestConfig(async ({ locale }) => {
  if (!locale || !(locales as readonly string[]).includes(locale)) {
    notFound();
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
