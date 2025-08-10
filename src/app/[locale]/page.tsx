/**
 * Internationalized Home Page for QuantumPoly
 *
 * The main landing page that showcases our quantum computing, AI, and sustainability
 * innovations. This page is fully internationalized and optimized for performance.
 *
 * @module HomePage
 * @version 2.0.0
 * @author QuantumPoly Development Team
 */

import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { Locale } from '../../../i18n';

// Import components (these will be updated to use translations)
import Hero from '../../components/Hero';
import About from '../../components/About';
import Vision from '../../components/Vision';
import Newsletter from '../../components/Newsletter';
import Footer from '../../components/Footer';
import LanguageSwitcher from '../../components/LanguageSwitcher';

/**
 * Props interface for the HomePage component
 */
interface HomePageProps {
  params: {
    locale: Locale;
  };
}

/**
 * Generate localized metadata for the home page
 */
export async function generateMetadata({
  params: { locale },
}: HomePageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'hero' });

  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

/**
 * Home Page Component
 *
 * Renders the complete landing page with all sections, using internationalized
 * content based on the current locale.
 */
export default async function HomePage({ params: { locale } }: HomePageProps) {
  // Load translations for this page
  const heroT = await getTranslations('hero');
  const aboutT = await getTranslations('about');
  const visionT = await getTranslations('vision');
  const newsletterT = await getTranslations('newsletter');

  return (
    <main id="main-content" className="min-h-screen" role="main">
      {/* Language switcher positioned in top-right corner */}
      <div className="fixed right-4 top-4 z-40">
        <LanguageSwitcher
          variant="compact"
          showFlags={true}
          ariaLabel="Change language"
        />
      </div>

      {/* Hero Section */}
      <Hero
        title={heroT('title')}
        subtitle={heroT('subtitle')}
        ctaText={heroT('cta')}
        scrollIndicatorLabel={heroT('scrollIndicator')}
        onCtaClick={() => {
          // Scroll to about section
          const aboutSection = document.querySelector('#about-section');
          aboutSection?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* About Section */}
      <About
        title={aboutT('title')}
        description={aboutT('description')}
        id="about-section"
      />

      {/* Vision Section */}
      <Vision title={visionT('title')} description={visionT('description')} />

      {/* Newsletter Section */}
      <Newsletter
        title={newsletterT('title')}
        description={newsletterT('description')}
        placeholder={newsletterT('placeholder')}
        subscribeText={newsletterT('subscribe')}
        successMessage={newsletterT('success')}
        errorMessage={newsletterT('error')}
        privacyNote={newsletterT('privacy')}
      />

      {/* Footer */}
      <Footer />
    </main>
  );
}

// FEEDBACK: Monitor page performance with internationalized content
// REVIEW: Consider lazy loading non-critical sections for better performance
// DISCUSS: Should we add breadcrumbs for better navigation?
