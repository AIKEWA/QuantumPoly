import { getTranslations } from 'next-intl/server';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import components with fallbacks
const Hero = dynamic(() => import('@/components/Hero'), {
  loading: () => <div className="h-96 bg-gradient-to-r from-cyan-400 to-purple-500 animate-pulse"></div>,
});

const About = dynamic(() => import('@/components/About'), {
  loading: () => <div className="h-64 m-4 bg-gray-100 dark:bg-gray-800 animate-pulse"></div>,
});

const Vision = dynamic(() => import('@/components/Vision'), {
  loading: () => <div className="h-64 m-4 bg-gray-100 dark:bg-gray-800 animate-pulse"></div>,
});

const Newsletter = dynamic(() => import('@/components/Newsletter'), {
  loading: () => <div className="h-48 m-4 bg-gray-100 dark:bg-gray-800 animate-pulse"></div>,
});

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    title: `QuantumPoly - The Future, Now`,
    description: 'QuantumPoly blends AI, Sustainability, and the Metaverse into a visionary future.',
  };
}

export default function LocalizedPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  return (
    <main className="flex flex-col min-h-screen p-4">
      <h1 className="text-2xl font-bold">Welcome to QuantumPoly</h1>
      <p className="mt-2">Current locale: {locale}</p>
    </main>
  );
} 