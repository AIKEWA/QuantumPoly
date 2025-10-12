import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ReactNode } from 'react';

import { isValidLocale, getLocaleDirection, type Locale } from '@/i18n';
import '../../styles/globals.css';

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

  return (
    <html lang={locale} dir={direction}>
      <body className="min-h-screen font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

