/**
 * Internationalized Root Layout for QuantumPoly
 *
 * This layout provides the foundation for our internationalized Next.js application.
 * It wraps all pages with the necessary i18n providers and ensures proper locale handling.
 *
 * @module Layout
 * @version 2.0.0
 * @author QuantumPoly Development Team
 */

import '@/styles/globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { locales, type Locale, getTextDirection } from '../../../i18n';

/**
 * Props interface for the RootLayout component
 */
interface RootLayoutProps {
  children: ReactNode;
  params: {
    locale: string;
  };
}

/**
 * Generate metadata for each locale
 *
 * This function creates localized metadata for better SEO and social sharing.
 * It uses the translation system to provide appropriate titles and descriptions.
 */
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  // Validate locale parameter
  if (!locales.includes(locale as Locale)) {
    return notFound();
  }

  const t = await getTranslations({ locale, namespace: 'hero' });

  return {
    title: {
      template: '%s | QuantumPoly',
      default: t('title'),
    },
    description: t('subtitle'),
    keywords: [
      'AI',
      'Quantum Computing',
      'Metaverse',
      'Sustainability',
      'Innovation',
      'Artificial Intelligence',
      'Technology',
      'Future',
      'Digital Transformation',
    ],
    authors: [{ name: 'QuantumPoly Team' }],
    creator: 'QuantumPoly',
    publisher: 'QuantumPoly',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'QuantumPoly',
      title: t('title'),
      description: t('subtitle'),
      locale: locale,
      alternateLocale: locales.filter(l => l !== locale),
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('subtitle'),
      creator: '@quantumpoly',
    },
    alternates: {
      canonical: `/${locale === 'en' ? '' : locale}`,
      languages: Object.fromEntries(
        locales.map(l => [l, `/${l === 'en' ? '' : l}`])
      ),
    },
  };
}

/**
 * Generate static parameters for all supported locales
 *
 * This enables static generation for all locale variants of the application.
 */
export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

/**
 * Root Layout Component
 *
 * Provides the HTML structure and i18n context for the entire application.
 * Handles locale validation, message loading, and proper HTML attributes.
 */
export default async function RootLayout({
  children,
  params: { locale },
}: RootLayoutProps) {
  // Validate the incoming locale parameter
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;

  // FEEDBACK: Monitor message loading performance across different locales
  let messages;
  try {
    messages = await getMessages();
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    notFound();
  }

  // Get text direction for proper RTL support
  const direction = getTextDirection(typedLocale);

  return (
    <html lang={locale} dir={direction} className="scroll-smooth">
      <head>
        {/* Preload critical fonts for better performance */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* Favicon and icons */}
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#0891b2" />
        <meta name="msapplication-TileColor" content="#0891b2" />

        {/* Viewport configuration */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />

        {/* Additional SEO meta tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      </head>

      <body
        className={`min-h-screen bg-white font-sans text-gray-900 antialiased selection:bg-cyan-500/20 dark:bg-gray-900 dark:text-gray-100`}
        suppressHydrationWarning={true}
      >
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
          timeZone="Europe/Berlin"
        >
          {/* Skip to main content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only z-50 rounded-lg bg-cyan-600 px-4 py-2 text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            Skip to main content
          </a>

          {/* Main application content */}
          <div id="app-root" className="relative">
            {children}
          </div>

          {/* Live region for screen reader announcements */}
          <div
            id="screen-reader-announcements"
            className="sr-only"
            aria-live="polite"
            aria-atomic="true"
          />

          {/* Global loading indicator */}
          <div
            id="global-loading"
            className="fixed left-0 top-0 z-50 h-1 w-full origin-left scale-x-0 transform bg-gradient-to-r from-cyan-500 to-blue-500 transition-transform duration-300"
            aria-hidden="true"
          />
        </NextIntlClientProvider>

        {/* Theme and preference detection script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Set initial theme based on user preference or system setting
              (function() {
                const theme = localStorage.getItem('theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.toggle('dark', theme === 'dark');
                
                // Set initial language preference if not already set
                const preferredLang = localStorage.getItem('preferred-language');
                if (!preferredLang) {
                  localStorage.setItem('preferred-language', '${locale}');
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}

// REVIEW: Consider adding service worker registration for offline support
// DISCUSS: Should we implement custom loading states for language switching?
// FEEDBACK: Monitor Core Web Vitals impact of i18n implementation
