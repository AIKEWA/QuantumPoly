import { useTranslations } from 'next-intl';

export const metadata = {
  title: 'Datenschutz - QuantumPoly',
};

export default function Datenschutz() {
  return (
    <main className="flex flex-col min-h-screen py-12 px-4 md:px-6 max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Datenschutz (Privacy Policy)</h1>
      
      <section className="mb-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">1. Data Controller</h2>
        <p className="mb-4">
          QuantumPoly GmbH<br />
          Musterstraße 123<br />
          10115 Berlin<br />
          Germany<br />
          Email: privacy@quantumpoly.com
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">2. What Data We Collect</h2>
        <p className="mb-4">
          We may collect the following types of personal data:
        </p>
        <ul className="list-disc ml-6 mb-4 space-y-2">
          <li>Contact information (name, email address, phone number)</li>
          <li>Technical data (IP address, browser type and version, operating system)</li>
          <li>Usage data (pages visited, time spent on site, actions taken)</li>
          <li>Cookie data (preferences, analytics, marketing)</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">3. How We Use Your Data</h2>
        <p className="mb-4">
          We use your personal data for the following purposes:
        </p>
        <ul className="list-disc ml-6 mb-4 space-y-2">
          <li>To provide and improve our services</li>
          <li>To communicate with you about our services</li>
          <li>To analyze how our website is used</li>
          <li>To comply with legal obligations</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">4. Your Rights</h2>
        <p className="mb-4">
          Under the GDPR, you have the following rights:
        </p>
        <ul className="list-disc ml-6 mb-4 space-y-2">
          <li>Right to access your personal data</li>
          <li>Right to rectification of inaccurate data</li>
          <li>Right to erasure (right to be forgotten)</li>
          <li>Right to restriction of processing</li>
          <li>Right to data portability</li>
          <li>Right to object to processing</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">5. Cookies</h2>
        <p className="mb-4">
          We use cookies to improve your browsing experience, analyze site traffic, and personalize content.
          You can control cookies through your browser settings and our cookie consent banner.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">6. Contact</h2>
        <p className="mb-4">
          If you have any questions about this privacy policy or our data practices, please contact us at privacy@quantumpoly.com.
        </p>
      </section>
    </main>
  );
} 