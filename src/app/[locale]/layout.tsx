import '../globals.css';
import { locales } from '@/i18n';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'QuantumPoly - The Future, Now',
  description: 'QuantumPoly blends AI, Sustainability, and the Metaverse into a visionary future.',
};

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate that the incoming locale is supported
  if (!locales.includes(locale as any)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-white text-black">
        <header className="p-4 border-b">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-xl font-bold">QuantumPoly</h1>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
} 