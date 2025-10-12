# Internationalization (i18n)

This directory contains translation files for the QuantumPoly website.

## Structure

```
locales/
├── en/                 # English (default)
│   ├── hero.json
│   ├── about.json
│   ├── vision.json
│   ├── newsletter.json
│   ├── footer.json
│   ├── common.json
│   └── index.ts
├── de/                 # German
│   └── [same structure]
└── tr/                 # Turkish
    └── [same structure]
```

## Supported Locales

- **en**: English (default)
- **de**: German (Deutsch)
- **tr**: Turkish (Türkçe)

## Adding a New Language

1. Create a new directory with the locale code (e.g., `es` for Spanish)
2. Copy all JSON files from an existing locale directory
3. Translate the content in each file
4. Create an `index.ts` file that exports all translations
5. Update `src/i18n.ts` to include the new locale in the `locales` array
6. Add the locale label to the `localeLabels` object

## Adding New Translation Keys

1. Add the key to the appropriate JSON file in **all** locale directories
2. Ensure the key structure is identical across all locales
3. Run translation validation: `npm run validate:translations` (once implemented)

## File Descriptions

- **hero.json**: Hero section translations (title, subtitle, CTA)
- **about.json**: About section translations
- **vision.json**: Vision section with pillars
- **newsletter.json**: Newsletter form labels and messages
- **footer.json**: Footer content and social links
- **common.json**: Shared translations (language names, metadata)

## Usage in Components

```typescript
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('hero');
  return <h1>{t('title')}</h1>;
}
```

## Type Safety

Translation keys are type-checked at compile time. If you use an invalid key, TypeScript will show an error.

## Testing Translations

All components should be tested with multiple locales to ensure proper rendering and layout.
