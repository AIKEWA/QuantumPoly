# Formatting Guide

## Overview

This guide covers locale-aware formatting of dates, numbers, currencies, and other locale-sensitive data in the QuantumPoly platform. All formatting utilities are centralized in `src/lib/i18n-formatters.ts` and use the native JavaScript `Intl` API for zero-dependency, standards-compliant formatting.

---

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Date & Time Formatting](#date--time-formatting)
3. [Number Formatting](#number-formatting)
4. [Currency Formatting](#currency-formatting)
5. [List Formatting](#list-formatting)
6. [Relative Time](#relative-time)
7. [Locale Configuration](#locale-configuration)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Core Concepts

### The Intl API

The JavaScript `Intl` object provides language-sensitive formatting without external dependencies. It's supported in all modern browsers and Node.js.

**Benefits:**
- **Zero dependencies** - Built into JavaScript
- **Standards-compliant** - Follows Unicode CLDR
- **Automatic locale handling** - Adapts to user's locale
- **Comprehensive** - Dates, numbers, lists, pluralization

### Formatting Philosophy

1. **Centralized** - All formatters in one module
2. **Type-safe** - TypeScript definitions included
3. **Consistent** - Same API patterns across formatters
4. **Extensible** - Easy to add custom formatters
5. **Testable** - Pure functions, easy to test

### Usage Pattern

```typescript
import { useLocale } from 'next-intl';
import { formatDate, formatCurrency } from '@/lib/i18n-formatters';

export function Component() {
  const locale = useLocale();
  
  const formattedDate = formatDate(new Date(), locale);
  const formattedPrice = formatCurrency(99.99, locale, 'USD');
  
  return (
    <div>
      <time>{formattedDate}</time>
      <span>{formattedPrice}</span>
    </div>
  );
}
```

---

## Date & Time Formatting

### Basic Date Formatting

```typescript
import { formatDate } from '@/lib/i18n-formatters';

// Long date format (default)
formatDate(new Date('2024-01-15'), 'en'); 
// → "January 15, 2024"

formatDate(new Date('2024-01-15'), 'de'); 
// → "15. Januar 2024"

formatDate(new Date('2024-01-15'), 'fr'); 
// → "15 janvier 2024"
```

### Custom Date Options

```typescript
// Short date
formatDate(new Date(), 'en', { dateStyle: 'short' });
// → "1/15/24"

// Medium date
formatDate(new Date(), 'en', { dateStyle: 'medium' });
// → "Jan 15, 2024"

// Full date
formatDate(new Date(), 'en', { dateStyle: 'full' });
// → "Monday, January 15, 2024"

// Custom format
formatDate(new Date(), 'en', {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  weekday: 'short'
});
// → "Mon, January 15, 2024"
```

### Date and Time

```typescript
import { formatDateTime } from '@/lib/i18n-formatters';

// Default (long date + short time)
formatDateTime(new Date(), 'en');
// → "January 15, 2024 at 3:45 PM"

formatDateTime(new Date(), 'de');
// → "15. Januar 2024 um 15:45"

// Custom format
formatDateTime(new Date(), 'en', {
  dateStyle: 'medium',
  timeStyle: 'long'
});
// → "Jan 15, 2024, 3:45:30 PM EST"
```

### Time Only

```typescript
import { formatTime } from '@/lib/i18n-formatters';

formatTime(new Date('2024-01-15T15:45:00'), 'en');
// → "3:45 PM"

formatTime(new Date('2024-01-15T15:45:00'), 'de');
// → "15:45"

formatTime(new Date('2024-01-15T15:45:00'), 'tr');
// → "15:45"
```

### Date Ranges

```typescript
import { formatDateRange } from '@/lib/i18n-formatters';

const start = new Date('2024-01-01');
const end = new Date('2024-01-15');

formatDateRange(start, end, 'en');
// → "Jan 1 – 15, 2024"

formatDateRange(start, end, 'de');
// → "1.–15. Jan. 2024"

// Custom format
formatDateRange(start, end, 'en', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
// → "January 1 – 15, 2024"
```

### Relative Time

```typescript
import { formatRelativeTime } from '@/lib/i18n-formatters';

// Yesterday
const yesterday = new Date(Date.now() - 86400000);
formatRelativeTime(yesterday, 'en');
// → "yesterday"

formatRelativeTime(yesterday, 'de');
// → "gestern"

// In 3 hours
const futureDate = new Date(Date.now() + 3 * 3600000);
formatRelativeTime(futureDate, 'en');
// → "in 3 hours"

formatRelativeTime(futureDate, 'es');
// → "dentro de 3 horas"

// Custom options
formatRelativeTime(yesterday, 'en', { numeric: 'always' });
// → "1 day ago" (instead of "yesterday")
```

---

## Number Formatting

### Basic Number Formatting

```typescript
import { formatNumber } from '@/lib/i18n-formatters';

// English (US)
formatNumber(1234.56, 'en');
// → "1,234.56"

// German
formatNumber(1234.56, 'de');
// → "1.234,56"

// French
formatNumber(1234.56, 'fr');
// → "1 234,56"

// Turkish
formatNumber(1234.56, 'tr');
// → "1.234,56"
```

### Decimal Precision

```typescript
formatNumber(1234.5678, 'en', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
// → "1,234.57"

formatNumber(100, 'en', {
  minimumFractionDigits: 2
});
// → "100.00"
```

### Compact Notation

```typescript
import { formatCompactNumber } from '@/lib/i18n-formatters';

// English
formatCompactNumber(1234, 'en');
// → "1.2K"

formatCompactNumber(1234567, 'en');
// → "1.2M"

formatCompactNumber(1234567890, 'en');
// → "1.2B"

// German
formatCompactNumber(1234567, 'de');
// → "1,2 Mio."

// Custom options
formatCompactNumber(1234, 'en', {
  notation: 'compact',
  compactDisplay: 'long'
});
// → "1.2 thousand"
```

### Percentages

```typescript
import { formatPercent } from '@/lib/i18n-formatters';

formatPercent(0.1556, 'en');
// → "15.56%"

formatPercent(0.1556, 'de');
// → "15,56 %"

formatPercent(0.1556, 'fr');
// → "15,56 %"

// Custom precision
formatPercent(0.5, 'en', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});
// → "50%"
```

### Number Ranges

```typescript
import { formatNumberRange } from '@/lib/i18n-formatters';

formatNumberRange(1, 10, 'en');
// → "1–10"

formatNumberRange(1000, 5000, 'de');
// → "1.000–5.000"

formatNumberRange(1.5, 2.5, 'en', {
  minimumFractionDigits: 1
});
// → "1.5–2.5"
```

### Ordinal Numbers

```typescript
import { formatOrdinal } from '@/lib/i18n-formatters';

// English (fully supported)
formatOrdinal(1, 'en');   // → "1st"
formatOrdinal(2, 'en');   // → "2nd"
formatOrdinal(3, 'en');   // → "3rd"
formatOrdinal(4, 'en');   // → "4th"
formatOrdinal(21, 'en');  // → "21st"
formatOrdinal(22, 'en');  // → "22nd"

// Other locales (returns number only)
formatOrdinal(1, 'de');   // → "1"
formatOrdinal(1, 'es');   // → "1"
```

---

## Currency Formatting

### Basic Currency

```typescript
import { formatCurrency } from '@/lib/i18n-formatters';

// US Dollars
formatCurrency(99.99, 'en', 'USD');
// → "$99.99"

// Euros (German)
formatCurrency(99.99, 'de', 'EUR');
// → "99,99 €"

// Turkish Lira
formatCurrency(99.99, 'tr', 'TRY');
// → "₺99,99"

// British Pounds
formatCurrency(99.99, 'en', 'GBP');
// → "£99.99"
```

### Currency Display Options

```typescript
// Symbol (default)
formatCurrency(99.99, 'en', 'USD', {
  currencyDisplay: 'symbol'
});
// → "$99.99"

// Code
formatCurrency(99.99, 'en', 'USD', {
  currencyDisplay: 'code'
});
// → "USD 99.99"

// Name
formatCurrency(99.99, 'en', 'USD', {
  currencyDisplay: 'name'
});
// → "99.99 US dollars"

// Narrow symbol
formatCurrency(99.99, 'en', 'CAD', {
  currencyDisplay: 'narrowSymbol'
});
// → "$99.99" (instead of CA$)
```

### Currency Precision

```typescript
// No decimal places (e.g., Japanese Yen)
formatCurrency(1000, 'ja', 'JPY', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});
// → "¥1,000"

// Three decimal places
formatCurrency(99.999, 'en', 'BTC', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3
});
// → "BTC 99.999"
```

### Default Currency per Locale

```typescript
import { getLocaleCurrency } from '@/lib/locale-config';
import { formatCurrency } from '@/lib/i18n-formatters';

const locale = 'de';
const defaultCurrency = getLocaleCurrency(locale); // 'EUR'

formatCurrency(99.99, locale, defaultCurrency);
// → "99,99 €"
```

### Locale Configuration

```typescript
// src/lib/locale-config.ts
export const localeSettings: Record<Locale, LocaleSettings> = {
  en: { currency: 'USD', ... },
  de: { currency: 'EUR', ... },
  tr: { currency: 'TRY', ... },
  es: { currency: 'EUR', ... },
  fr: { currency: 'EUR', ... },
  it: { currency: 'EUR', ... },
};
```

---

## List Formatting

### Conjunction Lists

```typescript
import { formatList } from '@/lib/i18n-formatters';

const items = ['apples', 'oranges', 'bananas'];

// English
formatList(items, 'en');
// → "apples, oranges, and bananas"

// German
formatList(['Äpfel', 'Orangen', 'Bananen'], 'de');
// → "Äpfel, Orangen und Bananen"

// Spanish
formatList(['manzanas', 'naranjas', 'plátanos'], 'es');
// → "manzanas, naranjas y plátanos"
```

### Disjunction Lists

```typescript
formatList(['A', 'B', 'C'], 'en', {
  type: 'disjunction'
});
// → "A, B, or C"

formatList(['A', 'B', 'C'], 'de', {
  type: 'disjunction'
});
// → "A, B oder C"
```

### Short Format

```typescript
formatList(['red', 'green', 'blue'], 'en', {
  style: 'short'
});
// → "red, green, & blue"
```

### Two Elements

```typescript
formatList(['A', 'B'], 'en');
// → "A and B"

formatList(['A', 'B'], 'de');
// → "A und B"
```

---

## Additional Utilities

### File Size Formatting

```typescript
import { formatFileSize } from '@/lib/i18n-formatters';

formatFileSize(0, 'en');
// → "0 Bytes"

formatFileSize(1024, 'en');
// → "1.00 KB"

formatFileSize(1048576, 'en');
// → "1.00 MB"

formatFileSize(1073741824, 'en');
// → "1.00 GB"

// Custom decimal places
formatFileSize(1536, 'en', 1);
// → "1.5 KB"

// German (with locale-specific number format)
formatFileSize(1048576, 'de');
// → "1,00 MB"
```

---

## Locale Configuration

### Getting Locale Settings

```typescript
import {
  getLocaleSettings,
  getLocaleCurrency,
  getLocaleFirstDayOfWeek,
  getLocaleDateFormat,
  getLocaleTimezone,
  getLocaleMeasurementSystem,
} from '@/lib/locale-config';

// Get all settings
const settings = getLocaleSettings('de');
// {
//   currency: 'EUR',
//   firstDayOfWeek: 1,
//   dateFormat: 'DD.MM.YYYY',
//   timezone: 'Europe/Berlin',
//   measurementSystem: 'metric'
// }

// Get specific setting
const currency = getLocaleCurrency('fr'); // 'EUR'
const firstDay = getLocaleFirstDayOfWeek('en'); // 0 (Sunday)
const dateFormat = getLocaleDateFormat('de'); // 'DD.MM.YYYY'
const timezone = getLocaleTimezone('tr'); // 'Europe/Istanbul'
const system = getLocaleMeasurementSystem('en'); // 'imperial'
```

### Currency Symbols

```typescript
import { getCurrencySymbol } from '@/lib/locale-config';

getCurrencySymbol('USD'); // '$'
getCurrencySymbol('EUR'); // '€'
getCurrencySymbol('GBP'); // '£'
getCurrencySymbol('JPY'); // '¥'
getCurrencySymbol('TRY'); // '₺'
```

---

## Best Practices

### 1. Always Use Locale Parameter

```typescript
// ❌ Bad - Uses browser default
new Intl.NumberFormat().format(1234);

// ✅ Good - Explicit locale
formatNumber(1234, locale);
```

### 2. Get Locale from Hook

```typescript
import { useLocale } from 'next-intl';

export function Component() {
  const locale = useLocale();
  
  // Use locale in formatters
  const formatted = formatCurrency(100, locale, 'USD');
}
```

### 3. Server Component Pattern

```typescript
import { getLocale } from 'next-intl/server';

export default async function ServerComponent() {
  const locale = await getLocale();
  
  const formatted = formatDate(new Date(), locale);
  
  return <div>{formatted}</div>;
}
```

### 4. Memoize Expensive Formatting

```typescript
import { useMemo } from 'react';
import { useLocale } from 'next-intl';

export function Component({ data }) {
  const locale = useLocale();
  
  const formattedItems = useMemo(() => {
    return data.map(item => ({
      ...item,
      price: formatCurrency(item.price, locale, 'USD'),
      date: formatDate(item.date, locale),
    }));
  }, [data, locale]);
  
  return <List items={formattedItems} />;
}
```

### 5. Type Safety

```typescript
// Define type for formatted data
interface FormattedProduct {
  name: string;
  price: string; // Formatted, not number
  date: string;  // Formatted, not Date
}

// Type-safe formatting
function formatProduct(product: Product, locale: Locale): FormattedProduct {
  return {
    name: product.name,
    price: formatCurrency(product.price, locale, 'USD'),
    date: formatDate(product.createdAt, locale),
  };
}
```

### 6. Avoid Client-Side Date Parsing

```typescript
// ❌ Bad - Parsing in client code
const date = new Date('2024-01-15'); // Ambiguous format

// ✅ Good - Use ISO strings from API
const date = new Date('2024-01-15T00:00:00Z');

// ✅ Better - Format on server
export default async function ServerComponent() {
  const data = await fetchData();
  const formatted = formatDate(new Date(data.date), await getLocale());
  return <div>{formatted}</div>;
}
```

### 7. Consistent Option Objects

```typescript
// Define reusable format options
const CURRENCY_OPTIONS: Intl.NumberFormatOptions = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

// Use consistently
formatCurrency(amount, locale, 'USD', CURRENCY_OPTIONS);
formatDate(date, locale, DATE_OPTIONS);
```

---

## Troubleshooting

### Issue: Incorrect Thousands Separator

**Problem:**
```typescript
formatNumber(1234, 'de'); // Shows "1,234" instead of "1.234"
```

**Solution:** Ensure locale is correct and browser/Node.js version supports it.

---

### Issue: Currency Symbol Not Showing

**Problem:**
```typescript
formatCurrency(100, 'en', 'XYZ'); // Shows "XYZ 100" instead of symbol
```

**Solution:** Use standard ISO 4217 currency codes. Unknown codes fall back to code display.

---

### Issue: Date Timezone Confusion

**Problem:** Dates showing wrong day due to timezone conversion.

**Solution:**
```typescript
// If dealing with date-only (no time)
const date = new Date('2024-01-15T12:00:00Z'); // Noon UTC

// Or format with explicit timezone
formatDate(date, locale, {
  timeZone: 'UTC',
  dateStyle: 'long'
});
```

---

### Issue: RTL Number Display

**Problem:** Numbers not aligned correctly in RTL locales.

**Solution:** Numbers automatically align correctly. Ensure `dir="rtl"` is set on `<html>`.

---

### Issue: Inconsistent Formatting Across Browsers

**Problem:** Safari shows different format than Chrome.

**Solution:** This is expected. Each browser uses its own locale data. Test in target browsers and accept minor differences.

---

## Resources

### Documentation

- [MDN: Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
- [ECMAScript Intl API Specification](https://tc39.es/ecma402/)
- [Unicode CLDR](https://cldr.unicode.org/)

### Tools

- [Intl Explorer](https://intl-explorer.com/) - Interactive Intl API playground
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

### Testing

```bash
# Run formatter tests
npm run test:i18n-keys

# Test with specific locale
NODE_ICU_DATA=node_modules/full-icu npm test
```

---

**Last Updated:** 2025-10-12
**Maintained By:** Frontend Architecture Team

