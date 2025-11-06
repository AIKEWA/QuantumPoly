import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ReactNode } from 'react';

import { PlausibleAnalytics } from '@/components/analytics/PlausibleAnalytics';
import { VercelAnalytics } from '@/components/analytics/VercelAnalytics';
import { ConsentManager } from '@/components/consent/ConsentManager';
import { isValidLocale, getLocaleDirection, type Locale } from '@/i18n';

import { ANALYTICS_CONFIG } from '../../../config/analytics.mjs';
import '../../styles/globals.css';

// Optimize font loading with next/font
// display: 'swap' prevents FOIT (Flash of Invisible Text)
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'de' },
    { locale: 'tr' },
    { locale: 'es' },
    { locale: 'fr' },
    { locale: 'it' },
  ];
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const messages = await getMessages();
  const metadata = messages.common?.metadata as { title: string; description: string };

  return {
    title: metadata?.title || 'QuantumPoly',
    description: metadata?.description || 'QuantumPoly - The Future, Now',
    keywords: 'AI, Quantum Computing, Metaverse, Sustainability',
    robots: 'index, follow',
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        de: '/de',
        tr: '/tr',
        es: '/es',
        fr: '/fr',
        it: '/it',
      },
    },
  };
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const messages = await getMessages();

  // Defensive check: warn if messages are missing
  if (!messages || Object.keys(messages).length === 0) {
    console.error(`⚠️ Missing messages for locale: ${locale}`);
  }

  const direction = getLocaleDirection(locale as Locale);

  // Determine which analytics providers to load
  const loadVercel = ANALYTICS_CONFIG.provider === 'vercel' || ANALYTICS_CONFIG.provider === 'both';
  const loadPlausible = ANALYTICS_CONFIG.provider === 'plausible' || ANALYTICS_CONFIG.provider === 'both';

  return (
    <html lang={locale} dir={direction} className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <ConsentManager locale={locale} />
          {loadVercel && <VercelAnalytics />}
          {loadPlausible && (
            <PlausibleAnalytics
              domain={ANALYTICS_CONFIG.plausible.domain}
              apiHost={ANALYTICS_CONFIG.plausible.apiHost}
              trackLocalhost={ANALYTICS_CONFIG.plausible.trackLocalhost}
            />
          )}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
