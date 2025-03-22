import { useState, useEffect } from 'react';

type ConsentOptions = {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
};

type ConsentState = {
  hasConsented: boolean;
  options: ConsentOptions;
};

type UseConsentReturn = {
  consentState: ConsentState;
  acceptAll: () => void;
  acceptEssentialOnly: () => void;
  updateConsent: (options: Partial<ConsentOptions>) => void;
  showBanner: boolean;
  setShowBanner: (show: boolean) => void;
};

const defaultConsent: ConsentState = {
  hasConsented: false,
  options: {
    essential: false,
    analytics: false,
    marketing: false,
  },
};

export const useConsent = (): UseConsentReturn => {
  const [consentState, setConsentState] = useState<ConsentState>(defaultConsent);
  const [showBanner, setShowBanner] = useState<boolean>(true);

  useEffect(() => {
    const storedConsent = localStorage.getItem('cookie-consent');
    
    if (storedConsent) {
      try {
        const parsedConsent = JSON.parse(storedConsent);
        setConsentState(parsedConsent);
        setShowBanner(false);
      } catch (error) {
        console.error('Error parsing stored consent:', error);
        localStorage.removeItem('cookie-consent');
      }
    }
  }, []);

  const saveConsent = (newState: ConsentState) => {
    localStorage.setItem('cookie-consent', JSON.stringify(newState));
    setConsentState(newState);
    setShowBanner(false);
  };

  const acceptAll = () => {
    saveConsent({
      hasConsented: true,
      options: {
        essential: true,
        analytics: true,
        marketing: true,
      },
    });
  };

  const acceptEssentialOnly = () => {
    saveConsent({
      hasConsented: true,
      options: {
        essential: true,
        analytics: false,
        marketing: false,
      },
    });
  };

  const updateConsent = (options: Partial<ConsentOptions>) => {
    saveConsent({
      hasConsented: true,
      options: { ...consentState.options, ...options },
    });
  };

  return {
    consentState,
    acceptAll,
    acceptEssentialOnly,
    updateConsent,
    showBanner,
    setShowBanner,
  };
}; 