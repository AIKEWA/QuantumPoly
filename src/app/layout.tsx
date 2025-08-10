/**
 * Legacy Root Layout - Redirects to Internationalized Layout
 *
 * This file maintains compatibility for any non-localized routes
 * and redirects users to the appropriate localized version.
 */

import { redirect } from 'next/navigation';
import { defaultLocale } from '../../i18n';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Redirect to the default locale
  redirect(`/${defaultLocale}`);
}
