import { useTranslations } from 'next-intl';

export const metadata = {
  title: 'Impressum - QuantumPoly',
};

export default function Impressum() {
  return (
    <main className="flex flex-col min-h-screen py-12 px-4 md:px-6 max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Impressum (Legal Notice)</h1>
      
      <section className="mb-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Company Information</h2>
        <p className="mb-2">QuantumPoly GmbH</p>
        <p className="mb-2">Musterstraße 123</p>
        <p className="mb-2">10115 Berlin</p>
        <p className="mb-2">Germany</p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Contact</h2>
        <p className="mb-2">Email: info@quantumpoly.com</p>
        <p className="mb-2">Phone: +49 123 4567890</p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Legal Representatives</h2>
        <p className="mb-2">CEO: Max Mustermann</p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Registration</h2>
        <p className="mb-2">Commercial Register: Amtsgericht Berlin-Charlottenburg</p>
        <p className="mb-2">Registration Number: HRB 123456</p>
        <p className="mb-2">VAT ID: DE123456789</p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Responsible for Content</h2>
        <p className="mb-2">Max Mustermann</p>
        <p className="mb-2">Address as above</p>
      </section>
    </main>
  );
} 