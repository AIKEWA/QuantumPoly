# 🌟 QuantumPoly i18n Usage Examples

## Overview

This document provides practical examples for implementing internationalization in your QuantumPoly components and pages. Each example includes complete code snippets and best practices.

---

## 🚀 Getting Started Examples

### Basic Component with Translations

```tsx
// components/WelcomeMessage.tsx
'use client';

import { useTranslations } from 'next-intl';

interface WelcomeMessageProps {
  userName?: string;
  className?: string;
}

export default function WelcomeMessage({
  userName,
  className = '',
}: WelcomeMessageProps) {
  const t = useTranslations('welcome');

  return (
    <div className={`rounded-lg bg-blue-50 p-4 ${className}`}>
      <h2 className="text-xl font-bold text-blue-900">{t('title')}</h2>
      <p className="text-blue-700">
        {userName
          ? t('messageWithName', { name: userName })
          : t('messageDefault')}
      </p>
    </div>
  );
}
```

**Translation Files:**

```json
// locales/en.json
{
  "welcome": {
    "title": "Welcome to QuantumPoly",
    "messageWithName": "Hello {name}, welcome to the future of technology!",
    "messageDefault": "Welcome to the future of technology!"
  }
}

// locales/de.json
{
  "welcome": {
    "title": "Willkommen bei QuantumPoly",
    "messageWithName": "Hallo {name}, willkommen in der Zukunft der Technologie!",
    "messageDefault": "Willkommen in der Zukunft der Technologie!"
  }
}

// locales/tr.json
{
  "welcome": {
    "title": "QuantumPoly'ye Hoş Geldiniz",
    "messageWithName": "Merhaba {name}, teknolojinin geleceğine hoş geldiniz!",
    "messageDefault": "Teknolojinin geleceğine hoş geldiniz!"
  }
}
```

---

## 🗂️ Advanced Component Examples

### Product Card with Internationalized Content

```tsx
// components/ProductCard.tsx
'use client';

import { useTranslations, useFormatter } from 'next-intl';

interface Product {
  id: string;
  nameKey: string;
  descriptionKey: string;
  price: number;
  currency: string;
  image: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  className?: string;
}

export default function ProductCard({
  product,
  onAddToCart,
  className = '',
}: ProductCardProps) {
  const t = useTranslations('products');
  const common = useTranslations('common');
  const format = useFormatter();

  const handleAddToCart = () => {
    onAddToCart?.(product.id);
  };

  const formattedPrice = format.number(product.price, {
    style: 'currency',
    currency: product.currency,
  });

  return (
    <div
      className={`overflow-hidden rounded-lg bg-white shadow-md ${className}`}
    >
      <img
        src={product.image}
        alt={t(`${product.nameKey}.imageAlt`)}
        className="h-48 w-full object-cover"
      />

      <div className="p-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          {t(`${product.nameKey}.title`)}
        </h3>

        <p className="mb-3 text-gray-600">
          {t(`${product.descriptionKey}.description`)}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-green-600">
            {formattedPrice}
          </span>

          <button
            onClick={handleAddToCart}
            className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            aria-label={t('addToCart', {
              productName: t(`${product.nameKey}.title`),
            })}
          >
            {common('addToCart')}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Form with Validation Messages

```tsx
// components/ContactForm.tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export default function ContactForm() {
  const t = useTranslations('contact.form');
  const errors = useTranslations('contact.errors');

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = errors('nameRequired');
    } else if (formData.name.length < 2) {
      newErrors.name = errors('nameTooShort');
    }

    if (!formData.email.trim()) {
      newErrors.email = errors('emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = errors('emailInvalid');
    }

    if (!formData.message.trim()) {
      newErrors.message = errors('messageRequired');
    } else if (formData.message.length < 10) {
      newErrors.message = errors('messageTooShort');
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));

      // Clear error when user starts typing
      if (formErrors[field]) {
        setFormErrors(prev => ({ ...prev, [field]: undefined }));
      }
    };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4">
      <h2 className="mb-6 text-center text-2xl font-bold">{t('title')}</h2>

      {/* Name Field */}
      <div>
        <label
          htmlFor="name"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {t('nameLabel')}
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={handleChange('name')}
          placeholder={t('namePlaceholder')}
          className={`w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
            formErrors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          aria-invalid={!!formErrors.name}
          aria-describedby={formErrors.name ? 'name-error' : undefined}
        />
        {formErrors.name && (
          <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
            {formErrors.name}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {t('emailLabel')}
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          placeholder={t('emailPlaceholder')}
          className={`w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
            formErrors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          aria-invalid={!!formErrors.email}
          aria-describedby={formErrors.email ? 'email-error' : undefined}
        />
        {formErrors.email && (
          <p
            id="email-error"
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {formErrors.email}
          </p>
        )}
      </div>

      {/* Message Field */}
      <div>
        <label
          htmlFor="message"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {t('messageLabel')}
        </label>
        <textarea
          id="message"
          value={formData.message}
          onChange={handleChange('message')}
          placeholder={t('messagePlaceholder')}
          rows={4}
          className={`w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
            formErrors.message ? 'border-red-500' : 'border-gray-300'
          }`}
          aria-invalid={!!formErrors.message}
          aria-describedby={formErrors.message ? 'message-error' : undefined}
        />
        {formErrors.message && (
          <p
            id="message-error"
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {formErrors.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {isSubmitting ? t('submitting') : t('submitButton')}
      </button>

      {/* Status Messages */}
      {submitStatus === 'success' && (
        <div
          className="rounded border border-green-400 bg-green-100 p-3 text-green-700"
          role="alert"
        >
          {t('successMessage')}
        </div>
      )}

      {submitStatus === 'error' && (
        <div
          className="rounded border border-red-400 bg-red-100 p-3 text-red-700"
          role="alert"
        >
          {t('errorMessage')}
        </div>
      )}
    </form>
  );
}
```

---

## 📱 Navigation Examples

### Internationalized Navigation Bar

```tsx
// components/Navigation.tsx
'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';

interface NavItem {
  key: string;
  href: string;
  external?: boolean;
}

export default function Navigation() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { key: 'home', href: '/' },
    { key: 'about', href: '/about' },
    { key: 'vision', href: '/vision' },
    { key: 'contact', href: '/contact' },
  ];

  const getLocalizedHref = (href: string) => {
    if (locale === 'en') return href;
    return `/${locale}${href}`;
  };

  return (
    <nav
      className="bg-gray-900 text-white"
      role="navigation"
      aria-label={t('mainNavigation')}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href={getLocalizedHref('/')}
            className="text-xl font-bold transition-colors hover:text-cyan-400"
            aria-label={t('logoAlt')}
          >
            QuantumPoly
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-8 md:flex">
            {navItems.map(item => (
              <Link
                key={item.key}
                href={getLocalizedHref(item.href)}
                className="transition-colors hover:text-cyan-400"
                {...(item.external && {
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  'aria-label': t('externalLink', { link: t(item.key) }),
                })}
              >
                {t(item.key)}
              </Link>
            ))}

            <LanguageSwitcher
              variant="compact"
              showFlags={true}
              ariaLabel={t('changeLanguage')}
            />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="rounded-md p-2 transition-colors hover:bg-gray-700 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={t('toggleMobileMenu')}
          >
            <span className="sr-only">{t('toggleMobileMenu')}</span>
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            id="mobile-menu"
            className="border-t border-gray-700 pb-3 pt-4 md:hidden"
          >
            <div className="space-y-3">
              {navItems.map(item => (
                <Link
                  key={item.key}
                  href={getLocalizedHref(item.href)}
                  className="block rounded px-3 py-2 transition-colors hover:bg-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                  {...(item.external && {
                    target: '_blank',
                    rel: 'noopener noreferrer',
                  })}
                >
                  {t(item.key)}
                </Link>
              ))}

              <div className="px-3 py-2">
                <LanguageSwitcher
                  variant="full"
                  showFlags={true}
                  ariaLabel={t('changeLanguage')}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
```

---

## 🔄 State Management Examples

### Shopping Cart with i18n

```tsx
// hooks/useCart.ts
import { create } from 'zustand';
import { useTranslations } from 'next-intl';

interface CartItem {
  id: string;
  nameKey: string;
  price: number;
  quantity: number;
  currency: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: item =>
    set(state => {
      const existingItem = state.items.find(i => i.id === item.id);
      if (existingItem) {
        return {
          items: state.items.map(i =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity: 1 }] };
    }),

  removeItem: id =>
    set(state => ({
      items: state.items.filter(item => item.id !== id),
    })),

  updateQuantity: (id, quantity) =>
    set(state => ({
      items:
        quantity === 0
          ? state.items.filter(item => item.id !== id)
          : state.items.map(item =>
              item.id === id ? { ...item, quantity } : item
            ),
    })),

  clearCart: () => set({ items: [] }),

  getTotalItems: () =>
    get().items.reduce((total, item) => total + item.quantity, 0),

  getTotalPrice: () =>
    get().items.reduce((total, item) => total + item.price * item.quantity, 0),
}));

// components/CartSummary.tsx
export function CartSummary() {
  const t = useTranslations('cart');
  const format = useFormatter();
  const { items, getTotalItems, getTotalPrice } = useCartStore();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  if (totalItems === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">{t('empty')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold">{t('summary')}</h2>

      <div className="mb-4 space-y-2">
        <div className="flex justify-between">
          <span>{t('totalItems')}</span>
          <span>{totalItems}</span>
        </div>

        <div className="flex justify-between border-t pt-2 text-lg font-semibold">
          <span>{t('total')}</span>
          <span>
            {format.number(totalPrice, {
              style: 'currency',
              currency: 'EUR',
            })}
          </span>
        </div>
      </div>

      <button className="w-full rounded bg-blue-600 py-2 text-white transition-colors hover:bg-blue-700">
        {t('checkout')}
      </button>
    </div>
  );
}
```

---

## 🧪 Testing Examples

### Component Testing with i18n

```tsx
// __tests__/components/WelcomeMessage.test.tsx
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import WelcomeMessage from '../../components/WelcomeMessage';

const mockMessages = {
  welcome: {
    title: 'Welcome to QuantumPoly',
    messageWithName: 'Hello {name}, welcome to the future!',
    messageDefault: 'Welcome to the future!',
  },
};

function TestWrapper({
  children,
  locale = 'en',
}: {
  children: React.ReactNode;
  locale?: string;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={mockMessages}>
      {children}
    </NextIntlClientProvider>
  );
}

describe('WelcomeMessage', () => {
  it('displays default message when no username provided', () => {
    render(
      <TestWrapper>
        <WelcomeMessage />
      </TestWrapper>
    );

    expect(screen.getByText('Welcome to QuantumPoly')).toBeInTheDocument();
    expect(screen.getByText('Welcome to the future!')).toBeInTheDocument();
  });

  it('displays personalized message with username', () => {
    render(
      <TestWrapper>
        <WelcomeMessage userName="John" />
      </TestWrapper>
    );

    expect(
      screen.getByText('Hello John, welcome to the future!')
    ).toBeInTheDocument();
  });

  it('works with different locales', () => {
    const germanMessages = {
      welcome: {
        title: 'Willkommen bei QuantumPoly',
        messageDefault: 'Willkommen in der Zukunft!',
      },
    };

    render(
      <NextIntlClientProvider locale="de" messages={germanMessages}>
        <WelcomeMessage />
      </NextIntlClientProvider>
    );

    expect(screen.getByText('Willkommen bei QuantumPoly')).toBeInTheDocument();
  });
});
```

### Integration Testing

```tsx
// __tests__/integration/language-switching.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import Navigation from '../../components/Navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/',
}));

const messages = {
  en: {
    nav: {
      home: 'Home',
      about: 'About',
      changeLanguage: 'Change language',
    },
  },
  de: {
    nav: {
      home: 'Startseite',
      about: 'Über uns',
      changeLanguage: 'Sprache ändern',
    },
  },
};

describe('Language Switching Integration', () => {
  it('updates navigation text when language changes', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <NextIntlClientProvider locale="en" messages={messages.en}>
        <Navigation />
      </NextIntlClientProvider>
    );

    // Check English text
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();

    // Simulate language change to German
    rerender(
      <NextIntlClientProvider locale="de" messages={messages.de}>
        <Navigation />
      </NextIntlClientProvider>
    );

    // Check German text
    expect(screen.getByText('Startseite')).toBeInTheDocument();
    expect(screen.getByText('Über uns')).toBeInTheDocument();
  });
});
```

---

## 🎨 Styling Examples

### Responsive Text with i18n

```tsx
// components/ResponsiveHeading.tsx
'use client';

import { useTranslations, useLocale } from 'next-intl';

interface ResponsiveHeadingProps {
  messageKey: string;
  namespace?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export default function ResponsiveHeading({
  messageKey,
  namespace = 'common',
  level = 1,
  className = '',
}: ResponsiveHeadingProps) {
  const t = useTranslations(namespace);
  const locale = useLocale();

  // Adjust text size based on locale
  const getTextSizeClasses = () => {
    // German and Turkish tend to be longer
    const isLongerLanguage = ['de', 'tr'].includes(locale);

    const baseSizes = {
      1: isLongerLanguage
        ? 'text-2xl sm:text-3xl md:text-4xl'
        : 'text-3xl sm:text-4xl md:text-5xl',
      2: isLongerLanguage
        ? 'text-xl sm:text-2xl md:text-3xl'
        : 'text-2xl sm:text-3xl md:text-4xl',
      3: isLongerLanguage
        ? 'text-lg sm:text-xl md:text-2xl'
        : 'text-xl sm:text-2xl md:text-3xl',
      4: isLongerLanguage
        ? 'text-base sm:text-lg md:text-xl'
        : 'text-lg sm:text-xl md:text-2xl',
      5: isLongerLanguage
        ? 'text-sm sm:text-base md:text-lg'
        : 'text-base sm:text-lg md:text-xl',
      6: isLongerLanguage
        ? 'text-xs sm:text-sm md:text-base'
        : 'text-sm sm:text-base md:text-lg',
    };

    return baseSizes[level];
  };

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag className={`font-bold ${getTextSizeClasses()} ${className}`}>
      {t(messageKey)}
    </Tag>
  );
}
```

### Theme-aware i18n Components

```tsx
// components/ThemedAlert.tsx
'use client';

import { useTranslations } from 'next-intl';

interface ThemedAlertProps {
  type: 'success' | 'warning' | 'error' | 'info';
  messageKey: string;
  namespace?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export default function ThemedAlert({
  type,
  messageKey,
  namespace = 'alerts',
  dismissible = false,
  onDismiss,
}: ThemedAlertProps) {
  const t = useTranslations(namespace);
  const common = useTranslations('common');

  const getThemeClasses = () => {
    const themes = {
      success:
        'bg-green-50 border-green-400 text-green-800 dark:bg-green-900/20 dark:border-green-600 dark:text-green-200',
      warning:
        'bg-yellow-50 border-yellow-400 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-600 dark:text-yellow-200',
      error:
        'bg-red-50 border-red-400 text-red-800 dark:bg-red-900/20 dark:border-red-600 dark:text-red-200',
      info: 'bg-blue-50 border-blue-400 text-blue-800 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-200',
    };

    return themes[type];
  };

  const getIcon = () => {
    const icons = {
      success: '✓',
      warning: '⚠',
      error: '✗',
      info: 'ℹ',
    };

    return icons[type];
  };

  return (
    <div
      className={`flex items-start space-x-3 rounded-lg border p-4 ${getThemeClasses()}`}
      role="alert"
      aria-live="polite"
    >
      <span className="text-xl" aria-hidden="true">
        {getIcon()}
      </span>

      <div className="flex-1">
        <p className="font-medium">{t(messageKey)}</p>
      </div>

      {dismissible && (
        <button
          onClick={onDismiss}
          className="transition-opacity hover:opacity-70"
          aria-label={common('close')}
        >
          <span className="text-lg" aria-hidden="true">
            ×
          </span>
        </button>
      )}
    </div>
  );
}
```

---

## 🚀 Performance Examples

### Lazy Loading with i18n

```tsx
// components/LazySection.tsx
'use client';

import { Suspense, lazy } from 'react';
import { useTranslations } from 'next-intl';

// Lazy load heavy components
const HeavyChart = lazy(() => import('./HeavyChart'));
const HeavyDataTable = lazy(() => import('./HeavyDataTable'));

interface LazySectionProps {
  sectionType: 'chart' | 'table';
  className?: string;
}

export default function LazySection({
  sectionType,
  className = '',
}: LazySectionProps) {
  const t = useTranslations('common');

  const LoadingFallback = () => (
    <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <p className="text-gray-600">{t('loading')}</p>
      </div>
    </div>
  );

  return (
    <div className={className}>
      <Suspense fallback={<LoadingFallback />}>
        {sectionType === 'chart' ? <HeavyChart /> : <HeavyDataTable />}
      </Suspense>
    </div>
  );
}
```

### Memoized Translation Component

```tsx
// components/OptimizedTranslation.tsx
'use client';

import { memo, useMemo } from 'react';
import { useTranslations } from 'next-intl';

interface OptimizedTranslationProps {
  messageKey: string;
  namespace: string;
  values?: Record<string, any>;
  className?: string;
}

const OptimizedTranslation = memo(function OptimizedTranslation({
  messageKey,
  namespace,
  values,
  className = '',
}: OptimizedTranslationProps) {
  const t = useTranslations(namespace);

  const translatedText = useMemo(() => {
    return t(messageKey, values);
  }, [t, messageKey, values]);

  return <span className={className}>{translatedText}</span>;
});

export default OptimizedTranslation;
```

---

## 📱 Mobile-First Examples

### Touch-Friendly Language Switcher

```tsx
// components/MobileLanguageSwitcher.tsx
'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { locales, localeNames, localeFlags } from '../../i18n';

export default function MobileLanguageSwitcher() {
  const t = useTranslations('language');
  const currentLocale = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex touch-manipulation items-center space-x-2 rounded-lg bg-gray-100 p-3"
        aria-label={t('available')}
      >
        <span className="text-lg">
          {localeFlags[currentLocale as keyof typeof localeFlags]}
        </span>
        <span className="font-medium">
          {localeNames[currentLocale as keyof typeof localeNames]}
        </span>
      </button>

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transform rounded-t-2xl bg-white shadow-xl transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'} `}
      >
        <div className="p-6">
          <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-gray-300"></div>

          <h3 className="mb-6 text-center text-lg font-semibold">
            {t('available')}
          </h3>

          <div className="space-y-3">
            {locales.map(locale => (
              <button
                key={locale}
                onClick={() => {
                  // Handle language change
                  setIsOpen(false);
                }}
                className="flex w-full touch-manipulation items-center space-x-4 rounded-lg p-4 hover:bg-gray-50"
              >
                <span className="text-2xl">{localeFlags[locale]}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium">{localeNames[locale]}</div>
                  <div className="text-sm text-gray-500">
                    {locale.toUpperCase()}
                  </div>
                </div>
                {locale === currentLocale && (
                  <span className="text-blue-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
```

---

This comprehensive examples guide should help you implement internationalization effectively throughout your QuantumPoly application. Each example is production-ready and follows best practices for accessibility, performance, and user experience.
