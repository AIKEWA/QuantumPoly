/**
 * Next-intl configuration
 * 
 * This file configures the internationalization settings for next-intl.
 * It defines supported locales and the default locale.
 */

/** @type {import('next-intl').NextIntlConfig} */
module.exports = {
  // List of supported locales
  locales: ['en', 'de', 'tr'],
  
  // Default locale when none is specified
  defaultLocale: 'en',
  
  // Enable locale detection
  localeDetection: true
}; 