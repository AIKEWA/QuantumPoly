import { useTranslations } from 'next-intl';

import { About } from '@/components/About';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { NewsletterForm } from '@/components/NewsletterForm';
import { Vision } from '@/components/Vision';

export default function Home() {
  const tHero = useTranslations('hero');
  const tAbout = useTranslations('about');
  const tVision = useTranslations('vision');
  const tNewsletter = useTranslations('newsletter');
  const tFooter = useTranslations('footer');

  return (
    <main className="flex min-h-screen flex-col">
      <Hero
        title={tHero('title')}
        subtitle={tHero('subtitle')}
        ctaLabel={tHero('ctaLabel')}
        headingLevel={1}
      />
      <About
        title={tAbout('title')}
        body={<p>{tAbout('body')}</p>}
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
        headingLevel={2}
      />
    </main>
  );
}

