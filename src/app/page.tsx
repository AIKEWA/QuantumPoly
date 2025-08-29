/**
 * @fileoverview Main home page component
 * @module app/page
 */

import Hero from '../components/Hero';
import About from '../components/About';
import Vision from '../components/Vision';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';

/**
 * Home Page Component
 *
 * The main landing page that orchestrates all major UI components
 * with proper internationalization, accessibility, and user experience.
 *
 * Features:
 * - Server-side rendering compatible
 * - Semantic HTML structure
 * - Accessibility optimized
 * - Responsive design
 * - Component composition with props
 */
export default function Home() {
  // REVIEW: Consider adding locale detection and i18n here
  // FEEDBACK: Should we add structured data for SEO?

  // NOTE: Avoid passing event handlers from Server Components to Client Components

  // NOTE: Avoid passing event handlers from Server Components to Client Components

  return (
    <>
      {/* Main content area */}
      <main className="flex min-h-screen flex-col">
        {/* Hero Section */}
        <Hero
          title="QuantumPoly"
          subtitle="Merging Artificial Intelligence with Sustainable Innovation and Metaverse Futures"
          ctaText="Join the Future"
          scrollIndicatorLabel="Scroll down to learn more about QuantumPoly"
        />

        {/* About Section */}
        <About
          title="About QuantumPoly"
          content={[
            'QuantumPoly is a visionary AI startup rethinking the future. Our mission is to align advanced machine intelligence with ecological sustainability and immersive digital realities.',
            'We combine cutting-edge quantum computing principles with sustainable AI practices to create transformative solutions for the next generation of technology.',
          ]}
          visualAltText="Futuristic brain visualization representing AI and quantum computing integration"
        />

        {/* Vision Section */}
        <Vision
          title="Our Vision"
          pillars={[
            {
              icon: '🌐',
              title: 'Artificial Intelligence',
              description:
                'Advanced neural networks and quantum algorithms to augment human potential responsibly and ethically.',
            },
            {
              icon: '🌱',
              title: 'Sustainability',
              description:
                'Every innovation supports planetary health, ensuring that technological progress sustains our environment.',
            },
            {
              icon: '🕶️',
              title: 'Metaverse Integration',
              description:
                'Creating immersive, inclusive digital experiences that bridge the gap between virtual and physical realities.',
            },
          ]}
        />

        {/* Newsletter Section */}
        <Newsletter
          title="Stay Connected"
          description="Sign up for updates on our journey into the future."
          emailPlaceholder="Enter your email"
          subscribeText="Subscribe"
          privacyText="We respect your privacy. Unsubscribe at any time."
        />

        {/* Footer Section */}
        <Footer
          brandName="QuantumPoly"
          copyrightText={`© ${new Date().getFullYear()} QuantumPoly. All rights reserved.`}
          tagline="Building the future, responsibly."
          socialLinks={[
            {
              icon: <span>🐦</span>, // In real app, use actual icons
              label: 'Follow us on Twitter',
              href: '#',
              platform: 'Twitter',
            },
            {
              icon: <span>💼</span>,
              label: 'Connect with us on LinkedIn',
              href: '#',
              platform: 'LinkedIn',
            },
            {
              icon: <span>🐙</span>,
              label: 'View our code on GitHub',
              href: '#',
              platform: 'GitHub',
            },
            {
              icon: <span>🎮</span>,
              label: 'Join our Discord community',
              href: '#',
              platform: 'Discord',
            },
          ]}
        />
      </main>
    </>
  );
}
