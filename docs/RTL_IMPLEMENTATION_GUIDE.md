# RTL Implementation Guide

## Overview

This guide provides comprehensive instructions for implementing and maintaining Right-to-Left (RTL) language support in the QuantumPoly platform. While the current platform serves LTR languages, this infrastructure prepares for future RTL language support (Arabic, Hebrew, Farsi).

---

## Table of Contents

1. [Understanding RTL](#understanding-rtl)
2. [Current Infrastructure](#current-infrastructure)
3. [CSS Logical Properties](#css-logical-properties)
4. [Component Adaptations](#component-adaptations)
5. [Testing RTL Layouts](#testing-rtl-layouts)
6. [Common Pitfalls](#common-pitfalls)
7. [Adding an RTL Locale](#adding-an-rtl-locale)

---

## Understanding RTL

### What is RTL?

Right-to-Left (RTL) languages include Arabic (ar), Hebrew (he), Farsi/Persian (fa), and Urdu (ur). These languages are written and read from right to left, requiring mirrored layouts.

### RTL vs LTR Differences

| Aspect | LTR (English) | RTL (Arabic) |
|--------|--------------|--------------|
| Reading direction | Left → Right | Right → Left |
| Text alignment | Left-aligned | Right-aligned |
| Navigation | Left to right | Right to left |
| Scrollbars | Right side | Left side |
| Form layouts | Label-left, input-right | Label-right, input-left |
| Icons | Point right | Point left (mirrored) |

### Bidirectional Text

Some content mixes RTL and LTR (e.g., Arabic text with English names):

```html
<!-- Arabic text with English brand name -->
<p>مرحبا بك في QuantumPoly</p>
```

Use the `<bdi>` (Bidirectional Isolate) tag for user-generated content:

```html
<p>المستخدم: <bdi>{username}</bdi></p>
```

---

## Current Infrastructure

### Directory Configuration

The platform uses the `dir` attribute on the `<html>` element:

```typescript
// src/i18n.ts
export const localeDirections: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  de: 'ltr',
  tr: 'ltr',
  es: 'ltr',
  fr: 'ltr',
  it: 'ltr',
  // Future RTL languages:
  // ar: 'rtl',
  // he: 'rtl',
  // fa: 'rtl',
};

export function getLocaleDirection(locale: Locale): 'ltr' | 'rtl' {
  return localeDirections[locale] || 'ltr';
}
```

### Layout Integration

```typescript
// src/app/[locale]/layout.tsx
const direction = getLocaleDirection(locale as Locale);

return (
  <html lang={locale} dir={direction}>
    <body>
      {/* Content automatically adapts to direction */}
    </body>
  </html>
);
```

### Browser Support

Modern browsers automatically handle RTL when `dir="rtl"` is set:

- Text flows right-to-left
- Scrollbars move to left side
- Default text alignment becomes right
- Flexbox and Grid reverse automatically

---

## CSS Logical Properties

### Why Logical Properties?

Physical properties (`left`, `right`, `top`, `bottom`) don't adapt to text direction. Logical properties (`inline-start`, `inline-end`, `block-start`, `block-end`) automatically adjust.

### Migration Guide

#### Margins and Padding

```css
/* ❌ Physical properties (direction-dependent) */
.element {
  margin-left: 1rem;
  margin-right: 2rem;
  padding-left: 1rem;
}

/* ✅ Logical properties (direction-agnostic) */
.element {
  margin-inline-start: 1rem;
  margin-inline-end: 2rem;
  padding-inline-start: 1rem;
}
```

#### Borders

```css
/* ❌ Physical */
.element {
  border-left: 1px solid black;
  border-right: 2px solid gray;
}

/* ✅ Logical */
.element {
  border-inline-start: 1px solid black;
  border-inline-end: 2px solid gray;
}
```

#### Positioning

```css
/* ❌ Physical */
.element {
  position: absolute;
  left: 0;
  right: auto;
}

/* ✅ Logical */
.element {
  position: absolute;
  inset-inline-start: 0;
  inset-inline-end: auto;
}
```

#### Text Alignment

```css
/* ❌ Physical */
.element {
  text-align: left;
}

/* ✅ Logical */
.element {
  text-align: start;
}
```

### Tailwind CSS Logical Properties

The project uses `tailwindcss-logical` plugin:

```javascript
// tailwind.config.js
module.exports = {
  plugins: [
    require('tailwindcss-logical'),
  ],
};
```

**Available utilities:**

```html
<!-- Margins -->
<div class="ms-4">  <!-- margin-inline-start -->
<div class="me-4">  <!-- margin-inline-end -->
<div class="mb-4">  <!-- margin-block-start -->
<div class="mt-4">  <!-- margin-block-end -->

<!-- Padding -->
<div class="ps-4">  <!-- padding-inline-start -->
<div class="pe-4">  <!-- padding-inline-end -->

<!-- Borders -->
<div class="border-is">  <!-- border-inline-start -->
<div class="border-ie">  <!-- border-inline-end -->

<!-- Positioning -->
<div class="start-0">  <!-- inset-inline-start: 0 -->
<div class="end-0">    <!-- inset-inline-end: 0 -->
```

**Legacy Tailwind (until migration):**

```html
<!-- For RTL-safe styling, use these patterns -->
<div class="ml-4 rtl:mr-4 rtl:ml-0">  <!-- Manual RTL adjustment -->
<div class="text-left rtl:text-right">  <!-- Direction-aware alignment -->
```

### Property Mapping Reference

| Physical | Logical | Description |
|----------|---------|-------------|
| `margin-left` | `margin-inline-start` | Start of inline direction |
| `margin-right` | `margin-inline-end` | End of inline direction |
| `margin-top` | `margin-block-start` | Start of block direction |
| `margin-bottom` | `margin-block-end` | End of block direction |
| `padding-left` | `padding-inline-start` | Start padding |
| `padding-right` | `padding-inline-end` | End padding |
| `border-left` | `border-inline-start` | Start border |
| `border-right` | `border-inline-end` | End border |
| `left` | `inset-inline-start` | Start position |
| `right` | `inset-inline-end` | End position |
| `text-align: left` | `text-align: start` | Align to start |
| `text-align: right` | `text-align: end` | Align to end |

---

## Component Adaptations

### Icons and Images

#### Directional Icons

Icons that indicate direction should flip in RTL:

```tsx
// ❌ Hardcoded direction
<ArrowRightIcon className="ml-2" />

// ✅ Direction-aware
<ArrowRightIcon className="ms-2 rtl:scale-x-[-1]" />
```

**Icons that should flip:**
- Arrows (→, ←)
- Chevrons (›, ‹)
- Next/Previous indicators
- Undo/Redo icons
- Navigation icons

**Icons that should NOT flip:**
- Logos
- Checkmarks
- Close (×) icons
- Symmetric icons
- Media controls (play/pause)

#### Images with Text

```tsx
// Use separate images for RTL if they contain directional text
const heroImage = locale === 'ar' 
  ? '/images/hero-rtl.png' 
  : '/images/hero-ltr.png';

<Image src={heroImage} alt={t('hero.imageAlt')} />
```

### Forms

#### Input and Label Layouts

```tsx
// ✅ Flexbox adapts automatically with dir attribute
<div className="flex items-center gap-4">
  <label htmlFor="email">{t('email')}</label>
  <input id="email" type="email" />
</div>
```

#### Placeholder Alignment

```css
/* Input placeholders inherit text direction */
input::placeholder {
  text-align: start; /* Not left or right */
}
```

### Navigation

#### Horizontal Navigation

```tsx
// ✅ Flexbox reverses automatically in RTL
<nav className="flex gap-4">
  <a href="/home">{t('nav.home')}</a>
  <a href="/about">{t('nav.about')}</a>
  <a href="/contact">{t('nav.contact')}</a>
</nav>
```

#### Breadcrumbs

```tsx
// Use logical separator that adapts to direction
<nav aria-label="Breadcrumb">
  <ol className="flex items-center">
    <li>Home</li>
    <li className="before:content-['/'] before:mx-2">About</li>
    <li className="before:content-['/'] before:mx-2">Team</li>
  </ol>
</nav>

// Or use pseudo-element with rotation
<style>
  [dir="rtl"] .breadcrumb-separator {
    transform: rotate(180deg);
  }
</style>
```

### Animations

#### Slide Animations

```tsx
// Direction-aware animations
const slideVariants = {
  enter: (direction: 'ltr' | 'rtl') => ({
    x: direction === 'ltr' ? 1000 : -1000,
  }),
  center: {
    x: 0,
  },
  exit: (direction: 'ltr' | 'rtl') => ({
    x: direction === 'ltr' ? -1000 : 1000,
  }),
};

// Usage with framer-motion
<motion.div
  custom={direction}
  variants={slideVariants}
  initial="enter"
  animate="center"
  exit="exit"
/>
```

### Shadows

#### Directional Shadows

```css
/* ❌ Hardcoded shadow direction */
.card {
  box-shadow: 5px 5px 10px rgba(0,0,0,0.1);
}

/* ✅ Symmetric shadow (works in both directions) */
.card {
  box-shadow: 0 5px 10px rgba(0,0,0,0.1);
}

/* ✅ RTL-aware shadow */
.card {
  box-shadow: 5px 5px 10px rgba(0,0,0,0.1);
}

[dir="rtl"] .card {
  box-shadow: -5px 5px 10px rgba(0,0,0,0.1);
}
```

---

## Testing RTL Layouts

### Manual Testing

#### Browser DevTools

```javascript
// In browser console
document.documentElement.setAttribute('dir', 'rtl');

// Reset
document.documentElement.setAttribute('dir', 'ltr');
```

#### Temporary Locale

Add a test RTL locale:

```typescript
// src/i18n.ts (temporarily)
export const locales = ['en', 'de', 'tr', 'ar-test'] as const;

export const localeDirections: Record<Locale, 'ltr' | 'rtl'> = {
  // ... existing
  'ar-test': 'rtl',
};
```

### Automated Testing

#### Playwright RTL Tests

```typescript
// e2e/i18n/rtl-layout.spec.ts
test('layout adapts to RTL', async ({ page }) => {
  await page.goto('/ar');
  
  // Check dir attribute
  const dir = await page.getAttribute('html', 'dir');
  expect(dir).toBe('rtl');
  
  // Check no horizontal overflow
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  expect(overflow).toBe(false);
});
```

#### Visual Regression Tests

Use Percy, Chromatic, or similar:

```bash
# Take screenshots of RTL layouts
npm run test:visual -- --grep="RTL"
```

### QA Checklist

When testing RTL:

- [ ] Text flows right-to-left
- [ ] Navigation is mirrored
- [ ] Forms are right-aligned
- [ ] Icons are appropriately flipped
- [ ] Animations move in correct direction
- [ ] Shadows point correctly
- [ ] No horizontal scrollbar
- [ ] No overlapping elements
- [ ] Tooltips appear on correct side
- [ ] Modals are centered
- [ ] Dropdowns align correctly
- [ ] Scrollbars on left side
- [ ] Focus indicators visible

---

## Common Pitfalls

### Pitfall 1: Hardcoded Directions

```tsx
// ❌ Wrong
<div className="float-left">...</div>

// ✅ Correct
<div className="float-start">...</div>
```

### Pitfall 2: Transform Translations

```css
/* ❌ Wrong - breaks RTL */
.element {
  transform: translateX(100px);
}

/* ✅ Correct - use logical approach */
.element {
  transform: translateX(var(--offset));
}

[dir="ltr"] {
  --offset: 100px;
}

[dir="rtl"] {
  --offset: -100px;
}
```

### Pitfall 3: Absolute Positioning

```css
/* ❌ Wrong */
.tooltip {
  position: absolute;
  left: 100%;
}

/* ✅ Correct */
.tooltip {
  position: absolute;
  inset-inline-start: 100%;
}
```

### Pitfall 4: Flexbox Order

```css
/* ❌ Wrong - explicit order breaks RTL */
.first {
  order: 1;
}

.second {
  order: 2;
}

/* ✅ Correct - let flex-direction handle it */
.container {
  display: flex;
  flex-direction: row; /* Automatically reverses in RTL */
}
```

### Pitfall 5: Text Truncation

```tsx
// ❌ Wrong - assumes LTR truncation
<div className="truncate">Long text here...</div>

// ✅ Correct - works in both directions
<div className="truncate overflow-hidden">
  {text}
</div>
```

### Pitfall 6: Grid Columns

```css
/* ❌ Wrong - explicit column positions */
.item {
  grid-column: 1 / 3;
}

/* ✅ Correct - use auto-placement */
.item {
  grid-column: span 2;
}
```

---

## Adding an RTL Locale

### Step-by-Step Process

1. **Use Add Locale Script with RTL Flag**

```bash
npm run add-locale -- --locale ar --label "العربية" --rtl
```

2. **Verify Direction Configuration**

Check `src/i18n.ts`:

```typescript
export const localeDirections: Record<Locale, 'ltr' | 'rtl'> = {
  // ... existing locales
  ar: 'rtl',
};
```

3. **Add Locale-Specific Settings**

Update `src/lib/locale-config.ts`:

```typescript
ar: {
  currency: 'SAR', // Saudi Riyal
  firstDayOfWeek: 6, // Saturday in Arab countries
  dateFormat: 'DD/MM/YYYY',
  timezone: 'Asia/Riyadh',
  measurementSystem: 'metric',
},
```

4. **Test RTL Layout**

```bash
npm run dev
# Visit http://localhost:3000/ar
```

5. **Run Automated Tests**

```bash
npm run test:e2e:i18n
npm run validate:translations
```

6. **Visual QA**

- Check in Storybook
- Test on mobile devices
- Verify in multiple browsers
- Check with screen readers

### RTL-Specific Translation Notes

**Numbers:**
- Arabic numerals: ٠ ١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩
- Western numerals in RTL: use `<bdi>` tags

**Punctuation:**
- Question marks: ؟ (Arabic), ? (Latin)
- Commas: ، (Arabic), , (Latin)
- Semicolons: ؛ (Arabic), ; (Latin)

**Bidirectional Text:**

```html
<!-- Mixing RTL and LTR -->
<p dir="rtl">
  التطبيق: <bdi>QuantumPoly</bdi>
</p>
```

---

## Resources

### Documentation

- [MDN: CSS Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties)
- [W3C: Structural markup and right-to-left text](https://www.w3.org/International/questions/qa-html-dir)
- [Material Design: Bidirectionality](https://m3.material.io/foundations/layout/applying-layout/bidirectionality)

### Tools

- [RTL CSS Converter](https://rtlcss.com/)
- [Bidirectional Text Visualizer](https://www.w3.org/International/tools/direction)
- Browser DevTools (inspect computed styles)

### Testing

- Chrome DevTools RTL emulation
- Firefox Responsive Design Mode
- [axe DevTools](https://www.deque.com/axe/devtools/) for accessibility

---

**Last Updated:** 2025-10-12
**Maintained By:** Frontend Architecture Team

