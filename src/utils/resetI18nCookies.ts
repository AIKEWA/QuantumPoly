import { deleteCookie } from './cookies';

/**
 * Resets all i18n-related cookies that might cause redirect loops
 */
export function resetI18nCookies(): void {
  if (typeof window === 'undefined') return;
  
  // Delete all cookies that might be causing redirect issues
  deleteCookie('preferred-locale');
  deleteCookie('redirect-count');
  deleteCookie('NEXT_LOCALE');
  deleteCookie('i18n');
  
  // Optionally clear localStorage items too
  localStorage.removeItem('locale-storage');
  
  console.log('[i18n] Reset all i18n cookies and storage');
} 