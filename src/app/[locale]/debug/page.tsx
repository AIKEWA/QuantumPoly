'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocaleStore } from '@/stores/useLocaleStore';
import { resetI18nCookies } from '@/utils/resetI18nCookies';
import { getCookie } from '@/utils/cookies';

export default function DebugPage() {
  const params = useParams();
  const { locale } = useLocaleStore();
  const [cookies, setCookies] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Get all cookies
    const allCookies: Record<string, string> = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      allCookies[name] = value;
    });
    setCookies(allCookies);
  }, []);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">i18n Debug Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Locale Information</h2>
          <div className="space-y-2">
            <p><strong>URL Locale Parameter:</strong> {params.locale}</p>
            <p><strong>Store Locale:</strong> {locale}</p>
            <p><strong>Cookie Locale:</strong> {getCookie('preferred-locale')}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">All Cookies</h2>
          <div className="space-y-1">
            {Object.entries(cookies).map(([name, value]) => (
              <p key={name}>
                <strong>{name}:</strong> {value}
              </p>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Actions</h2>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={() => {
            resetI18nCookies();
            setTimeout(() => {
              window.location.reload();
            }, 500);
          }}
        >
          Reset i18n Cookies and Reload
        </button>
      </div>
    </div>
  );
} 