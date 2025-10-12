import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ReactNode } from 'react';

import { isValidLocale } from '@/i18n';
import '../../styles/globals.css';

type Props = {
  children: ReactNode;
  params: { locale: string };
};

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'de' }, { locale: 'tr' }];
}

export async function generateMetadata({ params }: Props) {
  const { locale } = params;

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
      },
    },
  };
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children, params }: Props) {
  const { locale } = params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-screen font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

