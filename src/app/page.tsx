import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { defaultLocale } from '../i18n';

export default function RootFallbackPage() {
  // This is a fallback page that renders when the middleware redirection
  // fails to redirect the user from / to /{locale}
  
  // Get the preferred locale from cookie if available
  const cookieStore = cookies();
  const preferredLocale = cookieStore.get('preferred-locale')?.value || defaultLocale;
  
  // Redirect to the locale-specific home page
  redirect(`/${preferredLocale}`);
  
  // This return is never reached due to the redirect above
  // but is required for TypeScript
  return null;
} 