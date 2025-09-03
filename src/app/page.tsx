'use client';

import Hero from '../components/Hero';
import About from '../components/About';
import Vision from '../components/Vision';
import NewsletterForm from '../components/NewsletterForm';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <Hero
        title="Welcome to QuantumPoly"
        subtitle="Leading the future of ethical AI"
        ctaLabel="Get Started"
        headingLevel={1}
        onCtaClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
      />
      <About
        title="About Us"
        body={<p>We build ethical AI systems that prioritize safety, transparency, and human values.</p>}
        headingLevel={2}
      />
      <Vision
        title="Our Vision"
        headingLevel={2}
        pillars={[
          { title: 'Safety', description: 'Built-in accessibility and secure design.' },
          { title: 'Scale', description: 'Cloud-native architecture for global reach.' },
          { title: 'Openness', description: 'Prop-driven internationalization and open standards.' },
        ]}
      />
      <NewsletterForm
        title="Stay in the Loop"
        emailLabel="Email Address"
        emailPlaceholder="you@example.com"
        submitLabel="Subscribe"
        successMessage="Thanks for subscribing!"
        errorMessage="Please enter a valid email."
      />
      <Footer
        brand="QuantumPoly"
        tagline="Building the Future Responsibly"
        copyright="© 2025 QuantumPoly"
        socialLinks={[
          { label: 'GitHub', href: 'https://github.com/quantumpoly' },
          { label: 'Twitter', href: 'https://twitter.com/quantumpoly' },
        ]}
        headingLevel={2}
      />
    </main>
  );
} 