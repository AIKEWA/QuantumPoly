import dynamic from 'next/dynamic';
import { getTranslations } from 'next-intl/server';

import { About } from '@/components/About';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { Vision } from '@/components/Vision';

// Dynamic imports for client-only interactive components
// SSR disabled: these components are client-side only and below-the-fold
// This reduces initial JS bundle and improves FCP/LCP
const NewsletterForm = dynamic(
  () => import('@/components/NewsletterForm').then((mod) => ({ default: mod.NewsletterForm })),
  {
    ssr: false,
    loading: () => (
      <section className="mx-auto w-full max-w-xl px-4 py-12">
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

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const tHero = await getTranslations('hero');
  const tAbout = await getTranslations('about');
  const tVision = await getTranslations('vision');
  const tNewsletter = await getTranslations('newsletter');
  const tFooter = await getTranslations('footer');

  return (
    <main className="flex min-h-screen flex-col">
      <Hero
        title={tHero('title')}
        subtitle={tHero('subtitle')}
        ctaLabel={tHero('ctaLabel')}
        headingLevel={1}
      />
      <About title={tAbout('title')} body={<p>{tAbout('body')}</p>} headingLevel={2} />
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
        ]}
        policyNavLabel={tFooter('trustNav')}
        headingLevel={2}
      />
    </main>
  );
}
