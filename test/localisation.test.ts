import de from '../src/locales/de';
import en from '../src/locales/en';
import es from '../src/locales/es';
import fr from '../src/locales/fr';
import it from '../src/locales/it';
import tr from '../src/locales/tr';

// Define the type for locale export to avoid TS errors
type LocaleExport = {
  feedback: {
    title: string;
    description: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

describe('Localisation Exports', () => {
  const locales: Record<string, LocaleExport> = {
    de: de as unknown as LocaleExport,
    en: en as unknown as LocaleExport,
    es: es as unknown as LocaleExport,
    fr: fr as unknown as LocaleExport,
    it: it as unknown as LocaleExport,
    tr: tr as unknown as LocaleExport
  };

  const namespaces = ['feedback', 'common', 'footer', 'hero'];

  Object.entries(locales).forEach(([lang, exports]) => {
    describe(`Locale: ${lang}`, () => {
      it('should export the feedback namespace', () => {
        expect(exports).toHaveProperty('feedback');
        expect(exports.feedback).toBeDefined();
        // Check if content is loaded (not empty)
        expect(Object.keys(exports.feedback).length).toBeGreaterThan(0);
      });

      it('should have key feedback properties', () => {
         expect(exports.feedback).toHaveProperty('title');
         expect(exports.feedback).toHaveProperty('description');
      });

      namespaces.forEach((ns) => {
        it(`should export ${ns} namespace`, () => {
          expect(exports).toHaveProperty(ns);
        });
      });
    });
  });
});

