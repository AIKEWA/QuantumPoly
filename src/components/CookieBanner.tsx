'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useConsent } from '@/hooks/useConsent';

export default function CookieBanner() {
  const t = useTranslations('CookieBanner');
  const { acceptAll, acceptEssentialOnly, showBanner, setShowBanner } = useConsent();
  const [showSettings, setShowSettings] = useState(false);

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 text-white p-4 md:p-6 backdrop-blur-sm border-t border-gray-700">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm md:text-base">{t('message')}</p>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <button
              onClick={acceptEssentialOnly}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              {t('decline')}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              {t('settings')}
            </button>
            <button
              onClick={acceptAll}
              className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors"
            >
              {t('accept')}
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Cookie Preferences</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="cookie-essential"
                  checked
                  disabled
                  className="mr-2"
                />
                <label htmlFor="cookie-essential" className="text-sm">
                  Essential (Required) - These cookies are necessary for the website to function
                  properly.
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="cookie-analytics"
                  className="mr-2"
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    // This would be connected to the real consent state in a full implementation
                  }}
                />
                <label htmlFor="cookie-analytics" className="text-sm">
                  Analytics - Help us improve by measuring how visitors interact with the website.
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="cookie-marketing"
                  className="mr-2"
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    // This would be connected to the real consent state in a full implementation
                  }}
                />
                <label htmlFor="cookie-marketing" className="text-sm">
                  Marketing - Allow us to provide personalized content and advertisements.
                </label>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    acceptAll();
                    setShowSettings(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 