'use client';

import { useTranslations } from 'next-intl';

export default function Hero() {
  const t = useTranslations('Hero');
  
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 md:px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-transparent opacity-50 z-0"></div>
      
      <div className="z-10 max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-bold mb-4 cyberpunk-glow bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
          {t('title')}
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
        
        <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-medium hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 transform hover:scale-105 cyberpunk-border">
          {t('button')}
        </button>
      </div>
      
      <div className="absolute bottom-10 left-0 right-0 flex justify-center">
        <div className="animate-bounce">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-10 w-10 text-cyan-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 14l-7 7m0 0l-7-7m7 7V3" 
            />
          </svg>
        </div>
      </div>
    </section>
  );
} 