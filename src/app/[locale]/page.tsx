import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { getTranslations } from 'next-intl/server';

import { About } from '@/components/About';
import { CodeIntelligence } from '@/components/CodeIntelligence';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { Vision } from '@/components/Vision';
import { isValidLocale } from '@/i18n';

// Dynamic imports for client-only interactive components
// SSR disabled: these components are client-side only and below-the-fold
// This reduces initial JS bundle and improves FCP/LCP
const NewsletterForm = dynamic(
  () => import('@/components/NewsletterForm').then((mod) => ({ default: mod.NewsletterForm })),
  {
    ssr: false,
    loading: () => (
      <section className="mx-auto w-full max-w-xl px-4 py-20">
        <div className="mx-auto mb-6 h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mb-4 h-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </section>
    ),
  },
);

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const tHero = await getTranslations('hero');
  const tAbout = await getTranslations('about');

  return {
    title: `QuantumPoly - ${tHero('subtitle')}`,
    description: tAbout('body'),
    openGraph: {
      title: `QuantumPoly - ${tHero('subtitle')}`,
      description: tAbout('body'),
      type: 'website',
      locale: locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: `QuantumPoly - ${tHero('subtitle')}`,
      description: tAbout('body'),
    },
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

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const tHero = await getTranslations('hero');
  const tAbout = await getTranslations('about');
  const tVision = await getTranslations('vision');
  const tNewsletter = await getTranslations('newsletter');
  const tFooter = await getTranslations('footer');

  // tCommon unused
  // const tCommon = await getTranslations('common');

  return (
    <main className="flex min-h-screen flex-col">
      <Hero
        title={tHero('title')}
        subtitle={tHero('subtitle')}
        ctaLabel={tHero('ctaLabel')}
        headingLevel={1}
      />
      <About title={tAbout('title')} body={<p>{tAbout('body')}</p>} headingLevel={2} />
      <CodeIntelligence
        title="Code Intelligence Suite"
        description="Our advanced suite of tools for automated governance, verification, and optimization."
        features={[
          {
            title: 'Multi-Language Stability',
            description: 'Automated benchmarking across Python, JavaScript, and Rust environments.',
          },
          {
            title: 'Ethical Governance',
            description: 'Real-time ledger tracking and transparency verification.',
          },
          {
            title: 'Automated Optimization',
            description: 'Continuous performance monitoring and self-healing capabilities.',
          },
        ]}
        headingLevel={2}
      />
      <Vision
        title={tVision('title')}
        headingLevel={2}
        pillars={[
          {
            title: tVision('pillars.safety.title'),
            description: tVision('pillars.safety.description'),
          },
          {
            title: tVision('pillars.scale.title'),
            description: tVision('pillars.scale.description'),
          },
          {
            title: tVision('pillars.openness.title'),
            description: tVision('pillars.openness.description'),
          },
        ]}
      />
      <NewsletterForm
        title={tNewsletter('title')}
        emailLabel={tNewsletter('emailLabel')}
        emailPlaceholder={tNewsletter('emailPlaceholder')}
        submitLabel={tNewsletter('submitLabel')}
        successMessage={tNewsletter('successMessage')}
        errorMessage={tNewsletter('errorMessage')}
      />
      <Footer
        brand={tFooter('brand')}
        tagline={tFooter('tagline')}
        copyright={tFooter('copyright')}
        socialLinks={[
          { label: tFooter('socialLinks.github'), href: 'https://github.com/quantumpoly' },
          { label: tFooter('socialLinks.twitter'), href: 'https://twitter.com/quantumpoly' },
        ]}
        policyLinks={[
          { label: tFooter('ethics'), href: `/${locale}/ethics` },
          { label: tFooter('privacy'), href: `/${locale}/privacy` },
          { label: tFooter('imprint'), href: `/${locale}/imprint` },
          { label: tFooter('gep'), href: `/${locale}/gep` },
          { label: tFooter('accessibility'), href: `/${locale}/accessibility` },
          { label: tFooter('contact'), href: `/${locale}/contact` },
          { label: tFooter('governance'), href: `/${locale}/governance` },
          { label: tFooter('blog'), href: `/${locale}/blog` },
        ]}
        policyNavLabel={tFooter('trustNav')}
        headingLevel={2}
      />
    </main>
  );
}
