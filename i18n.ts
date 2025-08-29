// Canonical i18n re-exports and Next-Intl request config

import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export {
  locales,
  defaultLocale,
  localeNames,
  localeFlags,
  type Locale,
  isValidLocale,
  getTextDirection,
  i18n,
  type I18n,
  type Dict,
} from './src/i18n/index';

// Default export required by next-intl for message loading per request
export default getRequestConfig(async ({ locale }) => {
  // Validate at the edge
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const supported = (await import('./src/i18n/index')).locales;
  if (!locale || !supported.includes(locale as any)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`./src/locales/${locale}.json`)).default,
    timeZone: 'Europe/Berlin',
  };
});
