# 🌍 QuantumPoly Internationalization (i18n) Guide

## Overview

QuantumPoly implements a comprehensive internationalization system using `next-intl` that supports multiple languages with seamless user experience, accessibility compliance, and maintainable code architecture.

### Supported Languages

- **🇺🇸 English (en)** - Default locale
- **🇩🇪 German (de)** - Deutsch
- **🇹🇷 Turkish (tr)** - Türkçe

---

## 🚀 Quick Start

### Basic Usage in Components

```tsx
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('hero');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
    </div>
  );
}
```

### Using the Language Switcher

```tsx
import LanguageSwitcher from '@/components/LanguageSwitcher';

export function Header() {
  return (
    <header>
      <nav>
        {/* Your navigation items */}
        <LanguageSwitcher
          variant="compact"
          showFlags={true}
          ariaLabel="Change language"
        />
      </nav>
    </header>
  );
}
```

---

## 📁 File Structure

```
src/
├── app/
│   └── [locale]/
│       ├── layout.tsx          # Internationalized layout
│       └── page.tsx            # Internationalized pages
├── components/
│   ├── LanguageSwitcher.tsx    # Language switching component
│   └── ...                     # Other components using i18n
├── locales/
│   ├── en.json                 # English translations
│   ├── de.json                 # German translations
│   └── tr.json                 # Turkish translations
├── middleware.ts               # Route handling and locale detection
└── types/
    └── components.ts           # TypeScript interfaces for i18n props

i18n.ts                        # Main configuration file
next.config.mjs                 # Next.js configuration with i18n plugin
```

---

## ⚙️ Configuration

### Core Configuration (`i18n.ts`)

```typescript
import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'de', 'tr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export default getRequestConfig(async ({ locale }) => {
  // Load messages for the current locale
  const messages = (await import(`./messages/${locale}.json`)).default;

  return {
    messages,
    timeZone: 'Europe/Berlin',
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        },
      },
    },
  };
});
```

### Middleware (`src/middleware.ts`)

```typescript
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '../i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
  localePrefix: 'as-needed', // Only add prefix for non-default locales
});

export const config = {
  matcher: ['/', '/(de|tr)/:path*', '/((?!_next|_vercel|.*\\..*).*)'],
};
```

---

## 📝 Translation Files

### Structure Example (`messages/en.json`)

```json
{
  "nav": {
    "home": "Home",
    "about": "About",
    "vision": "Vision",
    "contact": "Contact",
    "language": "Language"
  },
  "hero": {
    "title": "QuantumPoly",
    "subtitle": "Merging AI with Sustainable Innovation",
    "cta": "Join the Future",
    "scrollIndicator": "Scroll down to learn more"
  },
  "common": {
    "loading": "Loading...",
    "error": "Something went wrong",
    "retry": "Try again"
  },
  "language": {
    "switchTo": "Switch to {language}",
    "current": "Current language: {language}",
    "available": "Available languages"
  }
}
```

### Variable Interpolation

```json
{
  "welcome": "Welcome, {name}!",
  "itemCount": "You have {count} items"
}
```

Usage in components:

```tsx
const t = useTranslations();

// Simple interpolation
t('welcome', { name: 'John' }); // "Welcome, John!"

// Numeric interpolation
t('itemCount', { count: 5 }); // "You have 5 items"
```

---

## 🧩 Components

### LanguageSwitcher Component

#### Props Interface

```typescript
interface LanguageSwitcherProps {
  /** Additional CSS classes */
  className?: string;
  /** Variant styling: 'compact' for header, 'full' for footer */
  variant?: 'compact' | 'full';
  /** Show flags alongside language names */
  showFlags?: boolean;
  /** Custom aria-label for the dropdown */
  ariaLabel?: string;
}
```

#### Variants

##### Compact Variant (For Headers)

```tsx
<LanguageSwitcher
  variant="compact"
  showFlags={true}
  className="fixed right-4 top-4"
/>
```

##### Full Variant (For Settings/Footer)

```tsx
<LanguageSwitcher
  variant="full"
  showFlags={true}
  ariaLabel="Select your preferred language"
/>
```

#### Features

- **Accessibility**: WCAG 2.1 AA compliant with full keyboard navigation
- **Persistence**: Saves language preference to localStorage
- **Smooth Transitions**: Animated dropdown with loading states
- **Mobile Friendly**: Responsive design for all screen sizes
- **Screen Reader Support**: Comprehensive ARIA labels and announcements

### Component i18n Integration

#### Making Components Internationalized

```typescript
// Before (hardcoded text)
interface HeroProps {
  title: string;
  subtitle: string;
}

// After (i18n ready)
interface HeroProps {
  title?: string;        // Optional - uses translation if not provided
  subtitle?: string;     // Optional - uses translation if not provided
}

export function Hero({ title, subtitle }: HeroProps) {
  const t = useTranslations('hero');

  const displayTitle = title || t('title');
  const displaySubtitle = subtitle || t('subtitle');

  return (
    <div>
      <h1>{displayTitle}</h1>
      <p>{displaySubtitle}</p>
    </div>
  );
}
```

---

## 🔗 Routing

### URL Structure

- **English (default)**: `/`, `/about`, `/vision`
- **German**: `/de`, `/de/about`, `/de/vision`
- **Turkish**: `/tr`, `/tr/about`, `/tr/vision`

### Navigation Between Locales

```tsx
import { Link } from 'next/link';
import { useLocale } from 'next-intl';

export function Navigation() {
  const locale = useLocale();

  return (
    <nav>
      <Link href="/" locale={locale}>
        Home
      </Link>
      <Link href="/about" locale={locale}>
        About
      </Link>
      <Link href="/vision" locale={locale}>
        Vision
      </Link>
    </nav>
  );
}
```

### Programmatic Navigation

```tsx
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export function MyComponent() {
  const router = useRouter();
  const locale = useLocale();

  const navigateToAbout = () => {
    const path = locale === 'en' ? '/about' : `/${locale}/about`;
    router.push(path);
  };

  return <button onClick={navigateToAbout}>Go to About</button>;
}
```

---

## 🧪 Testing

### Component Testing with i18n

```tsx
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import MyComponent from './MyComponent';

const mockMessages = {
  hero: {
    title: 'Test Title',
    subtitle: 'Test Subtitle',
  },
};

function TestWrapper({ children, locale = 'en' }) {
  return (
    <NextIntlClientProvider locale={locale} messages={mockMessages}>
      {children}
    </NextIntlClientProvider>
  );
}

test('renders with translations', () => {
  render(
    <TestWrapper>
      <MyComponent />
    </TestWrapper>
  );

  expect(screen.getByText('Test Title')).toBeInTheDocument();
});
```

### Running i18n Tests

```bash
# Run all tests
npm test

# Run i18n specific tests
npm test -- __tests__/utils/i18n.test.ts
npm test -- __tests__/components/LanguageSwitcher.test.tsx

# Run with coverage
npm run test:coverage
```

---

## 📚 Adding New Languages

### Step 1: Update Configuration

```typescript
// i18n.ts
export const locales = ['en', 'de', 'tr', 'fr'] as const; // Add 'fr'

// Add to locale names
export const localeNames: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  tr: 'Türkçe',
  fr: 'Français', // Add French
};

// Add flag emoji
export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  de: '🇩🇪',
  tr: '🇹🇷',
  fr: '🇫🇷', // Add French flag
};
```

### Step 2: Create Translation File

Create `messages/fr.json` with the same structure as existing files:

```json
{
  "nav": {
    "home": "Accueil",
    "about": "À propos",
    "vision": "Vision",
    "contact": "Contact",
    "language": "Langue"
  },
  "hero": {
    "title": "QuantumPoly",
    "subtitle": "Fusionner l'IA avec l'Innovation Durable",
    "cta": "Rejoignez l'Avenir",
    "scrollIndicator": "Faites défiler vers le bas pour en savoir plus"
  }
  // ... continue with all sections
}
```

### Step 3: Update Middleware

```typescript
// src/middleware.ts
export const config = {
  matcher: [
    '/',
    '/(de|tr|fr)/:path*', // Add 'fr'
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
};
```

### Step 4: Test New Language

```bash
# Run tests to ensure consistency
npm test

# Test in browser
npm run dev
# Navigate to /fr to test French locale
```

---

## 🎨 Advanced Usage

### Custom Formatters

```typescript
// In your component
import { useFormatter } from 'next-intl';

export function MyComponent() {
  const format = useFormatter();

  const date = new Date();
  const price = 99.99;

  return (
    <div>
      <p>Date: {format.dateTime(date, 'short')}</p>
      <p>Price: {format.number(price, {
        style: 'currency',
        currency: 'EUR'
      })}</p>
    </div>
  );
}
```

### Pluralization

```json
{
  "messages": {
    "zero": "No messages",
    "one": "One message",
    "other": "{count} messages"
  }
}
```

```tsx
const t = useTranslations();

// Usage
t('messages', { count: 0 }); // "No messages"
t('messages', { count: 1 }); // "One message"
t('messages', { count: 5 }); // "5 messages"
```

### Rich Text Formatting

```json
{
  "richText": "Visit our <link>website</link> for more info"
}
```

```tsx
const t = useTranslations();

t.rich('richText', {
  link: chunks => <a href="/website">{chunks}</a>,
});
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Hydration Mismatches

**Problem**: Server and client render different content

**Solution**:

```tsx
// Use suppressHydrationWarning for dynamic content
<body suppressHydrationWarning={true}>{children}</body>
```

#### 2. Missing Translations

**Problem**: Translation key not found

**Solution**:

```tsx
const t = useTranslations();

// Provide fallback
const text = t('key', 'Default fallback text');

// Or check if key exists
if (t.has('optional.key')) {
  return t('optional.key');
}
```

#### 3. Route Not Found

**Problem**: Navigation to locale route fails

**Solution**: Check middleware configuration and ensure all locales are included in the matcher pattern.

#### 4. Performance Issues

**Problem**: Large translation files slowing down the app

**Solution**:

- Split translation files by feature
- Use namespace loading
- Implement lazy loading for non-critical translations

### Debugging

#### Enable Debug Mode

```typescript
// next.config.mjs
const nextConfig = {
  // Enable i18n debugging in development
  experimental: {
    i18nDebug: process.env.NODE_ENV === 'development',
  },
};
```

#### Translation Loading Debugging

```typescript
// i18n.ts
export default getRequestConfig(async ({ locale }) => {
  try {
    const messages = (await import(`./messages/${locale}.json`)).default;
    console.log(`Loaded ${locale} translations:`, Object.keys(messages));
    return { messages };
  } catch (error) {
    console.error(`Failed to load translations for ${locale}:`, error);
    throw error;
  }
});
```

---

## 📊 Performance Considerations

### Bundle Size Optimization

- **Tree Shaking**: Only used translations are included in bundles
- **Code Splitting**: Translations loaded per route
- **Compression**: Enable gzip compression for translation files

### Loading Strategy

```typescript
// Preload critical translations
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Lazy load non-critical content
const LazyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>
});
```

### Caching

```typescript
// next.config.mjs
const nextConfig = {
  headers: async () => [
    {
      source: '/locales/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
};
```

---

## 🔒 Security

### Input Sanitization

```typescript
import { useTranslations } from 'next-intl';
import DOMPurify from 'dompurify';

export function SafeComponent() {
  const t = useTranslations();

  const richContent = t.rich('content', {
    strong: (chunks) => <strong>{chunks}</strong>
  });

  // For HTML content, sanitize first
  const htmlContent = DOMPurify.sanitize(t('htmlContent'));

  return (
    <div>
      {richContent}
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}
```

### Content Security Policy

```typescript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};
```

---

## 🤝 Contributing

### Translation Guidelines

1. **Consistency**: Use consistent terminology across all translations
2. **Context**: Provide context for translators when terms are ambiguous
3. **Length**: Consider UI space constraints for longer languages
4. **Cultural Sensitivity**: Ensure translations are culturally appropriate
5. **Testing**: Always test translations in context

### Adding New Features

1. **Update Types**: Add new translation keys to TypeScript interfaces
2. **Update Tests**: Add tests for new i18n functionality
3. **Update Documentation**: Document new features and usage patterns
4. **Translation Review**: Have native speakers review new translations

### Code Review Checklist

- [ ] All hardcoded strings moved to translation files
- [ ] TypeScript interfaces updated for new translation keys
- [ ] Tests added for new i18n functionality
- [ ] Accessibility attributes properly internationalized
- [ ] Error handling for missing translations
- [ ] Performance impact considered
- [ ] Documentation updated

---

## 📈 Monitoring & Analytics

### Translation Coverage

```bash
# Check translation completeness
npm run i18n:check

# Generate translation report
npm run i18n:report
```

### User Language Preferences

```typescript
// Analytics tracking for language switching
const trackLanguageChange = (from: string, to: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'language_change', {
      from_language: from,
      to_language: to,
      page_location: window.location.href,
    });
  }
};
```

### Performance Monitoring

```typescript
// Monitor translation loading performance
const measureTranslationLoad = async (locale: string) => {
  const start = performance.now();

  try {
    await import(`./messages/${locale}.json`);
    const end = performance.now();

    console.log(`Translation load time for ${locale}: ${end - start}ms`);
  } catch (error) {
    console.error(`Translation load failed for ${locale}:`, error);
  }
};
```

---

## 🎯 Best Practices

### 1. **Keep Translation Keys Organized**

```json
{
  "pages": {
    "home": {
      "hero": { ... },
      "about": { ... }
    },
    "contact": {
      "form": { ... },
      "info": { ... }
    }
  },
  "components": {
    "navigation": { ... },
    "footer": { ... }
  }
}
```

### 2. **Use Semantic Key Names**

```json
// Good
{
  "hero": {
    "title": "QuantumPoly",
    "callToAction": "Get Started"
  }
}

// Avoid
{
  "text1": "QuantumPoly",
  "button1": "Get Started"
}
```

### 3. **Handle Missing Translations Gracefully**

```tsx
const t = useTranslations();

const getText = (key: string, fallback?: string) => {
  try {
    return t(key);
  } catch {
    return fallback || key;
  }
};
```

### 4. **Optimize for Screen Readers**

```tsx
<LanguageSwitcher
  ariaLabel={t('accessibility.languageSelector')}
  variant="compact"
/>
```

### 5. **Test Across All Locales**

```bash
# Test each locale
npm run test -- --testNamePattern="i18n"

# Visual testing across locales
npm run storybook
```

---

## 📞 Support

For questions, issues, or contributions related to internationalization:

- **GitHub Issues**: [Create an issue](https://github.com/quantumpoly/quantumpoly/issues)
- **Documentation**: This guide and inline code comments
- **Team Contact**: development@quantumpoly.com

---

_Last Updated: 2024-12-19_
_Version: 2.0.0_
