# Internationalization (i18n) Guide

## Overview

QuantumPoly uses [next-intl](https://next-intl-docs.vercel.app/) for internationalization, supporting English (default), German, and Turkish. This guide covers how to work with translations, add new languages, and maintain i18n consistency across the codebase.

## Architecture

### Supported Locales

- **en** (English) - Default locale
- **de** (Deutsch/German)
- **tr** (Türkçe/Turkish)

### Directory Structure

```
src/
├── i18n.ts                  # next-intl configuration
├── middleware.ts            # Locale detection and routing
├── app/
│   └── [locale]/           # Locale-aware pages
│       ├── layout.tsx      # Root layout with i18n provider
│       └── page.tsx        # Home page with translations
├── components/
│   └── LanguageSwitcher.tsx # Language selector component
└── locales/
    ├── en/                 # English translations
    │   ├── hero.json
    │   ├── about.json
    │   ├── vision.json
    │   ├── newsletter.json
    │   ├── footer.json
    │   ├── common.json
    │   └── index.ts
    ├── de/                 # German translations
    │   └── [same structure]
    └── tr/                 # Turkish translations
        └── [same structure]
```

## Adding a New Language

### Step 1: Create Translation Files

1. Create a new directory in `src/locales/` with the locale code (e.g., `fr` for French):

```bash
mkdir -p src/locales/fr
```

2. Copy the JSON structure from an existing locale:

```bash
cp src/locales/en/*.json src/locales/fr/
```

3. Create an `index.ts` file:

```typescript
// src/locales/fr/index.ts
import about from './about.json';
import common from './common.json';
import footer from './footer.json';
import hero from './hero.json';
import newsletter from './newsletter.json';
import vision from './vision.json';

// eslint-disable-next-line import/no-default-export -- Required by next-intl
export default {
  hero,
  about,
  vision,
  newsletter,
  footer,
  common,
};
```

### Step 2: Update i18n Configuration

Add the new locale to `src/i18n.ts`:

```typescript
// Add to locales array
export const locales = ['en', 'de', 'tr', 'fr'] as const;

// Add to locale labels
export const localeLabels: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  tr: 'Türkçe',
  fr: 'Français', // Add new label
};
```

### Step 3: Update Layout

Add the new locale to static params in `src/app/[locale]/layout.tsx`:

```typescript
export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'de' },
    { locale: 'tr' },
    { locale: 'fr' }, // Add new locale
  ];
}
```

### Step 4: Update Storybook (Optional)

Add the new locale to Storybook preview in `.storybook/preview.tsx`:

```typescript
import frMessages from '../src/locales/fr/index';

const messages = {
  en: enMessages,
  de: deMessages,
  tr: trMessages,
  fr: frMessages, // Add new messages
};

// Update toolbar items
globalTypes: {
  locale: {
    toolbar: {
      items: [
        { value: 'en', title: 'English' },
        { value: 'de', title: 'Deutsch' },
        { value: 'tr', title: 'Türkçe' },
        { value: 'fr', title: 'Français' }, // Add new item
      ],
    },
  },
}
```

### Step 5: Translate Content

Translate all JSON files in `src/locales/fr/` to French, maintaining the exact same key structure as other locales.

### Step 6: Build and Test

```bash
npm run build        # Verify build works for all locales
npm run test         # Ensure tests pass
npm run storybook    # Check Storybook locale switcher
```

## Adding New Translation Keys

### Step 1: Identify the Namespace

Determine which JSON file the new key belongs to:

- `hero.json` - Hero section content
- `about.json` - About section content
- `vision.json` - Vision section content
- `newsletter.json` - Newsletter form labels
- `footer.json` - Footer content
- `common.json` - Shared content (metadata, language names)

### Step 2: Add the Key to All Locales

**Important**: Add the key with the same structure to **all** locale files to maintain consistency.

Example - Adding a new hero subtitle:

```json
// src/locales/en/hero.json
{
  "title": "Welcome to QuantumPoly",
  "subtitle": "Leading the future of ethical AI",
  "secondarySubtitle": "Innovation with responsibility", // New key
  "ctaLabel": "Get Started"
}
```

```json
// src/locales/de/hero.json
{
  "title": "Willkommen bei QuantumPoly",
  "subtitle": "Die Zukunft ethischer KI gestalten",
  "secondarySubtitle": "Innovation mit Verantwortung", // New key (translated)
  "ctaLabel": "Jetzt starten"
}
```

```json
// src/locales/tr/hero.json
{
  "title": "QuantumPoly'ye Hoş Geldiniz",
  "subtitle": "Etik yapay zekanın geleceğine öncülük ediyoruz",
  "secondarySubtitle": "Sorumlulukla inovasyon", // New key (translated)
  "ctaLabel": "Başlayın"
}
```

### Step 3: Use the New Key in Components

```typescript
import { useTranslations } from 'next-intl';

export function Hero() {
  const t = useTranslations('hero');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
      <p>{t('secondarySubtitle')}</p> {/* New key usage */}
    </div>
  );
}
```

### Nested Keys

For complex structures, use dot notation:

```json
// src/locales/en/common.json
{
  "navigation": {
    "home": "Home",
    "about": "About",
    "contact": {
      "email": "Email Us",
      "phone": "Call Us"
    }
  }
}
```

```typescript
const t = useTranslations('common');
t('navigation.home');           // "Home"
t('navigation.contact.email');  // "Email Us"
```

## Component i18n Patterns

### Server Components

Use `getTranslations` from `next-intl/server`:

```typescript
import { getTranslations } from 'next-intl/server';

export default async function ServerComponent() {
  const t = await getTranslations('hero');
  
  return <h1>{t('title')}</h1>;
}
```

### Client Components

Use `useTranslations` hook:

```typescript
'use client';

import { useTranslations } from 'next-intl';

export function ClientComponent() {
  const t = useTranslations('hero');
  
  return <h1>{t('title')}</h1>;
}
```

### Multiple Namespaces

```typescript
export function MultiNamespaceComponent() {
  const tHero = useTranslations('hero');
  const tCommon = useTranslations('common');
  
  return (
    <>
      <h1>{tHero('title')}</h1>
      <button>{tCommon('navigation.home')}</button>
    </>
  );
}
```

### Dynamic Values

Use template strings for dynamic content:

```json
{
  "greeting": "Hello, {name}!",
  "itemCount": "You have {count} items"
}
```

```typescript
t('greeting', { name: 'Alice' });        // "Hello, Alice!"
t('itemCount', { count: 5 });            // "You have 5 items"
```

## Testing Translated Components

### Unit Tests

Wrap components with `NextIntlClientProvider` and provide test messages:

```typescript
import { NextIntlClientProvider } from 'next-intl';
import { render } from '@testing-library/react';
import enMessages from '@/locales/en/index';

function renderWithI18n(component: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      {component}
    </NextIntlClientProvider>
  );
}

test('renders translated title', () => {
  const { getByText } = renderWithI18n(<Hero />);
  expect(getByText('Welcome to QuantumPoly')).toBeInTheDocument();
});
```

### Testing Multiple Locales

```typescript
import deMessages from '@/locales/de/index';

test('renders German translation', () => {
  const { getByText } = render(
    <NextIntlClientProvider locale="de" messages={deMessages}>
      <Hero />
    </NextIntlClientProvider>
  );
  expect(getByText('Willkommen bei QuantumPoly')).toBeInTheDocument();
});
```

## Common Pitfalls

### 1. Missing Keys

**Problem**: Key exists in one locale but not others.

**Solution**: Always add new keys to all locale files simultaneously. Use TypeScript for compile-time validation.

### 2. Inconsistent Structure

**Problem**: Different JSON structures across locales.

**Solution**: Use the exact same key structure. Consider using a validation script (see Validation section below).

### 3. Hardcoded Strings

**Problem**: Text is hardcoded instead of using translations.

**Solution**: Always use `t()` for user-visible strings. Search for hardcoded strings during code review.

### 4. Client/Server Mismatch

**Problem**: Using `useTranslations` in server components or `getTranslations` in client components.

**Solution**: Use `getTranslations` for Server Components, `useTranslations` for Client Components.

## Validation Script (Future Enhancement)

Create `scripts/validate-translations.ts`:

```typescript
// Validates that all locales have the same keys
// Run with: npm run validate:translations
```

Add to `package.json`:

```json
{
  "scripts": {
    "validate:translations": "ts-node scripts/validate-translations.ts"
  }
}
```

## Locale Detection Flow

1. **Middleware** (`src/middleware.ts`) detects locale from:
   - URL path (`/en`, `/de`, `/tr`)
   - Accept-Language header (browser preference)
   - Cookie (user preference)

2. **Default Fallback**: If no locale detected → redirect to `/en`

3. **URL Structure**: All routes are prefixed with locale (`/en/about`, `/de/about`)

## Accessibility Considerations

- **Language Attribute**: Each page has correct `lang` attribute (`<html lang="de">`)
- **LanguageSwitcher**: Accessible with keyboard navigation, ARIA labels, screen reader support
- **Focus Management**: Locale switching preserves user context

## Performance

- **Static Generation**: All locales pre-rendered at build time
- **Code Splitting**: Each locale's messages loaded on demand
- **Middleware**: Efficient locale detection with minimal overhead

## References

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js i18n Routing](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [ADR-005: Internationalization Architecture](./adr/ADR-005-internationalization-architecture.md)
- [WCAG 2.1 Language Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/language-of-page.html)

## Support

For questions or issues related to i18n:

1. Check this guide and ADR-005
2. Review existing component i18n patterns
3. Consult the next-intl documentation
4. Contact the frontend architecture team

