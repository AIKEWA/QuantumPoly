'use client';

import { useTranslations } from 'next-intl';

export default function About() {
  const t = useTranslations('About');
  
  return (
    <section className="py-20 px-4 md:px-6 bg-white dark:bg-gray-900" id="about">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 order-2 md:order-1">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-500">
              {t('title')}
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              {t('description')}
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                <div className="w-12 h-12 mb-4 flex items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900">
                  <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Quantum Computing</h3>
              </div>
              
              <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                <div className="w-12 h-12 mb-4 flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Blockchain</h3>
              </div>
            </div>
          </div>
          
          <div className="flex-1 order-1 md:order-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-purple-500 rounded-xl transform rotate-3"></div>
              <div className="relative bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 