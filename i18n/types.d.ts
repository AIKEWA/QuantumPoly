// next-intl message typing based on our English locale
// Ensures `useTranslations` and related helpers are type-safe

import en from '../src/locales/en.json';

type Messages = typeof en;

declare global {
  // Augment global IntlMessages for next-intl v4 type inference
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface IntlMessages extends Messages {}
}

export {};


