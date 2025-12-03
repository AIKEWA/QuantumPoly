import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { isValidLocale, locales } from '@/i18n';

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamic = 'force-static';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  const t = await getTranslations('feedback');

  return {
    title: `${t('title')} | QuantumPoly`,
    description: t('description'),
    robots: 'index, follow',
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      locale: locale,
    },
    alternates: {
      canonical: `/${locale}/feedback`,
      languages: {
        en: '/en/feedback',
        de: '/de/feedback',
        tr: '/tr/feedback',
        es: '/es/feedback',
        fr: '/fr/feedback',
        it: '/it/feedback',
      },
    },
  };
}

export default async function FeedbackPage({ params }: Props) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  return <FeedbackForm />;
}
