import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QuantumPoly - The Future, Now',
  description: 'QuantumPoly blends AI, Sustainability, and the Metaverse into a visionary future.',
  keywords: 'AI, Quantum Computing, Metaverse, Sustainability',
  robots: 'index, follow',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
} 