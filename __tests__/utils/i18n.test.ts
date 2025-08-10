/**
 * Test Suite for i18n Utilities
 *
 * Tests for internationalization configuration and utility functions
 * including locale validation, text direction, and configuration loading.
 *
 * @module i18n.test
 * @version 1.0.0
 * @author QuantumPoly Development Team
 */

import {
  locales,
  defaultLocale,
  localeNames,
  localeFlags,
  isValidLocale,
  getTextDirection,
  type Locale,
} from '../../i18n';

describe('i18n Configuration', () => {
  describe('Constants', () => {
    it('has correct supported locales', () => {
      expect(locales).toEqual(['en', 'de', 'tr']);
      expect(locales).toHaveLength(3);
    });

    it('has correct default locale', () => {
      expect(defaultLocale).toBe('en');
      expect(locales).toContain(defaultLocale);
    });

    it('has locale names for all supported locales', () => {
      expect(Object.keys(localeNames)).toEqual(locales);
      expect(localeNames.en).toBe('English');
      expect(localeNames.de).toBe('Deutsch');
      expect(localeNames.tr).toBe('Türkçe');
    });

    it('has locale flags for all supported locales', () => {
      expect(Object.keys(localeFlags)).toEqual(locales);
      expect(localeFlags.en).toBe('🇺🇸');
      expect(localeFlags.de).toBe('🇩🇪');
      expect(localeFlags.tr).toBe('🇹🇷');
    });
  });

  describe('isValidLocale', () => {
    it('returns true for supported locales', () => {
      expect(isValidLocale('en')).toBe(true);
      expect(isValidLocale('de')).toBe(true);
      expect(isValidLocale('tr')).toBe(true);
    });

    it('returns false for unsupported locales', () => {
      expect(isValidLocale('fr')).toBe(false);
      expect(isValidLocale('es')).toBe(false);
      expect(isValidLocale('invalid')).toBe(false);
      expect(isValidLocale('')).toBe(false);
    });

    it('handles edge cases', () => {
      expect(isValidLocale('EN')).toBe(false); // Case sensitive
      expect(isValidLocale('en-US')).toBe(false); // Full locale codes
      expect(isValidLocale(undefined as any)).toBe(false);
      expect(isValidLocale(null as any)).toBe(false);
    });
  });

  describe('getTextDirection', () => {
    it('returns ltr for all current supported locales', () => {
      expect(getTextDirection('en')).toBe('ltr');
      expect(getTextDirection('de')).toBe('ltr');
      expect(getTextDirection('tr')).toBe('ltr');
    });

    it('is prepared for future RTL language support', () => {
      // This test ensures the function exists and has the right signature
      // When RTL languages are added, this test should be updated
      const direction = getTextDirection('en');
      expect(direction).toBe('ltr');
      expect(['ltr', 'rtl']).toContain(direction);
    });
  });

  describe('Type Safety', () => {
    it('enforces Locale type correctly', () => {
      // This is a compile-time test to ensure TypeScript type safety
      const validLocale: Locale = 'en';
      expect(locales).toContain(validLocale);

      // These should cause TypeScript errors if uncommented:
      // const invalidLocale: Locale = 'fr'; // Should fail
      // const invalidLocale2: Locale = 'invalid'; // Should fail
    });

    it('has consistent typing across all exports', () => {
      // Ensure all locale-related objects use the same keys
      const localeKeys = Object.keys(localeNames) as Locale[];
      const flagKeys = Object.keys(localeFlags) as Locale[];

      expect(localeKeys.sort()).toEqual(locales.sort());
      expect(flagKeys.sort()).toEqual(locales.sort());
    });
  });
});

describe('Translation Message Loading', () => {
  describe('Message Files', () => {
    it('can load English messages', async () => {
      const messages = await import('../../src/locales/en.json');

      expect(messages).toBeDefined();
      expect(messages.nav).toBeDefined();
      expect(messages.hero).toBeDefined();
      expect(messages.about).toBeDefined();
      expect(messages.vision).toBeDefined();
      expect(messages.newsletter).toBeDefined();
      expect(messages.footer).toBeDefined();
      expect(messages.common).toBeDefined();
      expect(messages.language).toBeDefined();
    });

    it('can load German messages', async () => {
      const messages = await import('../../src/locales/de.json');

      expect(messages).toBeDefined();
      expect(messages.nav).toBeDefined();
      expect(messages.hero).toBeDefined();
    });

    it('can load Turkish messages', async () => {
      const messages = await import('../../src/locales/tr.json');

      expect(messages).toBeDefined();
      expect(messages.nav).toBeDefined();
      expect(messages.hero).toBeDefined();
    });
  });

  describe('Message Structure Consistency', () => {
    let enMessages: any;
    let deMessages: any;
    let trMessages: any;

    beforeAll(async () => {
      enMessages = await import('../../src/locales/en.json');
      deMessages = await import('../../src/locales/de.json');
      trMessages = await import('../../src/locales/tr.json');
    });

    it('has consistent top-level keys across all locales', () => {
      const enKeys = Object.keys(enMessages).sort();
      const deKeys = Object.keys(deMessages).sort();
      const trKeys = Object.keys(trMessages).sort();

      expect(deKeys).toEqual(enKeys);
      expect(trKeys).toEqual(enKeys);
    });

    it('has consistent nav section structure', () => {
      const enNavKeys = Object.keys(enMessages.nav).sort();
      const deNavKeys = Object.keys(deMessages.nav).sort();
      const trNavKeys = Object.keys(trMessages.nav).sort();

      expect(deNavKeys).toEqual(enNavKeys);
      expect(trNavKeys).toEqual(enNavKeys);
    });

    it('has consistent hero section structure', () => {
      const enHeroKeys = Object.keys(enMessages.hero).sort();
      const deHeroKeys = Object.keys(deMessages.hero).sort();
      const trHeroKeys = Object.keys(trMessages.hero).sort();

      expect(deHeroKeys).toEqual(enHeroKeys);
      expect(trHeroKeys).toEqual(enHeroKeys);
    });

    it('has non-empty translation values', () => {
      // Check that all translation values are non-empty strings
      const checkNonEmpty = (obj: any, path = ''): void => {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;

          if (typeof value === 'string') {
            expect(value.trim()).not.toBe('');
          } else if (typeof value === 'object' && value !== null) {
            checkNonEmpty(value, currentPath);
          }
        });
      };

      checkNonEmpty(enMessages);
      checkNonEmpty(deMessages);
      checkNonEmpty(trMessages);
    });
  });

  describe('Interpolation Support', () => {
    let enMessages: any;

    beforeAll(async () => {
      enMessages = await import('../../src/locales/en.json');
    });

    it('supports variable interpolation in language messages', () => {
      expect(enMessages.language.switchTo).toContain('{language}');
      expect(enMessages.language.current).toContain('{language}');
    });

    it('has consistent interpolation patterns across locales', async () => {
      const deMessages = await import('../../src/locales/de.json');
      const trMessages = await import('../../src/locales/tr.json');

      // Check that interpolation variables match across languages
      expect(deMessages.language.switchTo).toContain('{language}');
      expect(trMessages.language.switchTo).toContain('{language}');
    });
  });
});

// FEEDBACK: Monitor translation completeness and consistency in CI/CD
// REVIEW: Consider adding tests for message loading performance
// DISCUSS: Should we add automated translation quality checks?
