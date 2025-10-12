import type { Preview } from '@storybook/react';
import { NextIntlClientProvider } from 'next-intl';
import React from 'react';

import deMessages from '../src/locales/de/index';
import enMessages from '../src/locales/en/index';
import trMessages from '../src/locales/tr/index';
import '../src/styles/globals.css';

// Message registry for all locales
const messages = {
  en: enMessages,
  de: deMessages,
  tr: trMessages,
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#0a0a0a',
        },
      ],
    },
  },
  globalTypes: {
    locale: {
      description: 'Internationalization locale',
      defaultValue: 'en',
      toolbar: {
        title: 'Locale',
        icon: 'globe',
        items: [
          { value: 'en', title: 'English' },
          { value: 'de', title: 'Deutsch' },
          { value: 'tr', title: 'Türkçe' },
        ],
        dynamicTitle: true,
      },
    },
    darkMode: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const locale = context.globals.locale || 'en';
      
      return (
        <NextIntlClientProvider locale={locale} messages={messages[locale as keyof typeof messages]}>
          <Story />
        </NextIntlClientProvider>
      );
    },
  ],
};

// eslint-disable-next-line import/no-default-export -- Required by Storybook
export default preview;

