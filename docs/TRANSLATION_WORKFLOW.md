# Translation Workflow Guide

## Overview

This document outlines the complete workflow for managing translations in the QuantumPoly platform, from adding new locales to maintaining existing ones.

---

## Table of Contents

1. [Adding a New Locale](#adding-a-new-locale)
2. [Translation Process](#translation-process)
3. [Quality Assurance](#quality-assurance)
4. [Validation & Testing](#validation--testing)
5. [Deployment](#deployment)
6. [Maintenance](#maintenance)

---

## Adding a New Locale

### Automated Scaffolding

Use the `add-locale` script to automatically create the necessary files:

```bash
npm run add-locale -- --locale <code> --label "<name>"
```

**Examples:**

```bash
# Add Portuguese
npm run add-locale -- --locale pt --label "Português"

# Add Japanese
npm run add-locale -- --locale ja --label "日本語"

# Add Arabic (RTL)
npm run add-locale -- --locale ar --label "العربية" --rtl
```

### What Gets Created

The script automatically:

1. Creates `src/locales/<locale>/` directory
2. Copies all JSON files from English locale
3. Marks strings with `[NEEDS_TRANSLATION]` prefix
4. Updates `src/i18n.ts` with new locale
5. Updates `src/middleware.ts` matcher
6. Generates `index.ts` export file

### Manual Steps After Scaffolding

1. **Update Layout**
   
   Edit `src/app/[locale]/layout.tsx`:
   
   ```typescript
   export function generateStaticParams() {
     return [
       { locale: 'en' },
       { locale: 'de' },
       // ... existing locales
       { locale: 'pt' }, // Add new locale
     ];
   }
   ```

2. **Update Storybook** (Optional)
   
   Edit `.storybook/preview.tsx`:
   
   ```typescript
   import ptMessages from '../src/locales/pt/index';
   
   const messages = {
     en: enMessages,
     de: deMessages,
     // ... existing locales
     pt: ptMessages, // Add new locale
   };
   
   // Update toolbar
   globalTypes: {
     locale: {
       toolbar: {
         items: [
           { value: 'en', title: 'English' },
           // ... existing locales
           { value: 'pt', title: 'Português' }, // Add new locale
         ],
       },
     },
   }
   ```

3. **Update Locale Config**
   
   Edit `src/lib/locale-config.ts`:
   
   ```typescript
   export const localeSettings: Record<Locale, LocaleSettings> = {
     // ... existing locales
     pt: {
       currency: 'EUR',
       firstDayOfWeek: 1, // Monday
       dateFormat: 'DD/MM/YYYY',
       timezone: 'Europe/Lisbon',
       measurementSystem: 'metric',
     },
   };
   ```

---

## Translation Process

### Workflow Stages

```
1. Scaffolding → 2. Translation → 3. Review → 4. Validation → 5. Production
```

### Stage 1: Scaffolding (Automated)

- Run `add-locale` script
- Verify file structure
- Commit scaffold to feature branch

### Stage 2: Translation (Manual or Service)

**Option A: Professional Translation Service**

1. Export English JSON files
2. Send to translation service (Lokalise, Crowdin, etc.)
3. Receive translated files
4. Replace `[NEEDS_TRANSLATION]` content

**Option B: Manual Translation**

1. Open each JSON file in `src/locales/<locale>/`
2. Replace `[NEEDS_TRANSLATION] <English text>` with proper translation
3. Maintain exact key structure
4. Preserve placeholders like `{name}`, `{count}`

**Translation Guidelines:**

- **DO** maintain JSON structure exactly
- **DO** preserve format placeholders (`{variable}`)
- **DO** preserve HTML tags if present
- **DO** adapt text length naturally (don't force exact length)
- **DON'T** translate brand names (QuantumPoly)
- **DON'T** translate technical terms unless appropriate
- **DON'T** change key names
- **DON'T** remove or add keys

**Example:**

```json
// ❌ WRONG
{
  "title": "[NEEDS_TRANSLATION] Welcome to QuantumPoly"
}

// ✅ CORRECT (German)
{
  "title": "Willkommen bei QuantumPoly"
}
```

### Stage 3: Review (Native Speaker)

**Visual Review in Storybook:**

1. Start Storybook: `npm run storybook`
2. Use locale switcher to view new language
3. Check each component story
4. Verify:
   - Text is not truncated
   - Layout is not broken
   - Meaning is preserved
   - Tone is appropriate
   - Grammar is correct

**Review Checklist:**

- [ ] All `[NEEDS_TRANSLATION]` markers removed
- [ ] No English text remaining (unless intentional)
- [ ] Placeholders intact (`{name}`, `{count}`, etc.)
- [ ] Proper capitalization for locale
- [ ] Appropriate formality level
- [ ] Technical terms handled correctly
- [ ] Cultural adaptations made where needed
- [ ] No text overflow in UI

### Stage 4: Validation (Automated)

Run validation before committing:

```bash
# Validate translation structure
npm run validate:translations

# Run tests
npm run test

# Type check
npm run type-check

# Build check
npm run build
```

**Validation catches:**

- Missing keys
- Extra keys
- Format string mismatches
- JSON syntax errors
- Structural inconsistencies

### Stage 5: Production (Deployment)

1. Create pull request with translations
2. CI runs automated validation
3. Team reviews changes
4. Merge to main branch
5. Deploy to production

---

## Quality Assurance

### Automated QA

**CI Pipeline checks:**

- Translation key completeness
- JSON syntax validation
- Format string consistency
- Build success for all locales
- E2E tests pass in all locales

**Manual QA Checklist:**

- [ ] Visual review in Storybook
- [ ] Test in development environment
- [ ] Check on mobile devices
- [ ] Verify SEO meta tags
- [ ] Test form submissions
- [ ] Check error messages
- [ ] Verify accessibility (screen readers)

### Translation Quality Criteria

**Accuracy:**
- Meaning is preserved
- Technical terms correct
- Context appropriate

**Completeness:**
- All strings translated
- No placeholders remaining
- All UI elements covered

**Consistency:**
- Terminology consistent throughout
- Tone matches brand voice
- Formatting follows locale conventions

**Usability:**
- Text fits in UI components
- No truncation or overflow
- Natural reading flow
- Culturally appropriate

---

## Validation & Testing

### Automated Validation

```bash
# Run full validation suite
npm run validate:translations

# Test specific locale
npm run test -- --testNamePattern="de"

# E2E tests for i18n
npm run test:e2e:i18n
```

### Pseudo-Localization Testing

Generate pseudo-locale for QA:

```bash
npm run generate:pseudo-locale
```

Pseudo-locale helps identify:

- Text truncation issues
- Hardcoded strings
- Layout problems with longer text
- Missing translations

**To test pseudo-locale:**

1. Temporarily add `'qps'` to locales array in `src/i18n.ts`
2. Visit `http://localhost:3000/qps`
3. Look for:
   - Text wrapped in `[brackets]` → properly translated
   - Normal text → hardcoded string (needs fixing)
   - Overflowing text → layout issue

### E2E Test Coverage

Playwright tests verify:

- **Routing:** URL locale handling
- **Switching:** Language switcher functionality
- **Persistence:** Locale remembered across sessions
- **Content:** Proper translation display
- **SEO:** Correct meta tags and hreflang

Run tests:

```bash
# All E2E tests
npm run test:e2e

# i18n-specific tests
npm run test:e2e:i18n

# Interactive mode
npm run test:e2e:ui
```

---

## Deployment

### Pre-Deployment Checklist

- [ ] All translations validated
- [ ] CI pipeline passes
- [ ] Visual QA completed
- [ ] E2E tests pass
- [ ] Build succeeds for all locales
- [ ] Team approval received

### Deployment Process

1. **Merge PR** to main branch
2. **CI builds** application
3. **Automated tests** run
4. **Deploy** to staging
5. **Smoke test** new locale
6. **Deploy** to production

### Post-Deployment Verification

```bash
# Check production URLs
curl https://quantumpoly.com/pt
curl https://quantumpoly.com/pt/ -I

# Verify hreflang tags
curl -s https://quantumpoly.com/pt | grep hreflang

# Check meta tags
curl -s https://quantumpoly.com/pt | grep 'og:locale'
```

---

## Maintenance

### Regular Maintenance Tasks

**Monthly:**
- Review translation quality feedback
- Update outdated translations
- Check for new strings needing translation

**Quarterly:**
- Audit all locales for completeness
- Review cultural appropriateness
- Update locale-specific settings

**Annual:**
- Comprehensive translation review
- Native speaker audit
- Competitive analysis

### Updating Existing Translations

When updating content:

1. Update English source (`src/locales/en/*.json`)
2. Mark changed strings in other locales with `[NEEDS_UPDATE]`
3. Follow translation process
4. Validate changes

**Example workflow:**

```json
// src/locales/en/hero.json
{
  "title": "Welcome to the New QuantumPoly" // Updated
}

// src/locales/de/hero.json (before update)
{
  "title": "Willkommen bei QuantumPoly" // Outdated
}

// src/locales/de/hero.json (after marking)
{
  "title": "[NEEDS_UPDATE] Willkommen bei QuantumPoly"
}

// src/locales/de/hero.json (after translation)
{
  "title": "Willkommen beim neuen QuantumPoly"
}
```

### Adding New Translation Keys

When adding new features:

1. Add keys to English locale first
2. Run `validate:translations` to identify missing keys
3. Add corresponding keys to all other locales
4. Follow translation process

### Deprecating Locales

If removing a locale:

1. Remove from `src/i18n.ts` locales array
2. Remove from middleware matcher
3. Remove from layout `generateStaticParams`
4. Update documentation
5. Consider redirect strategy

---

## Tools & Resources

### Internal Tools

- `npm run add-locale` - Scaffold new locale
- `npm run validate:translations` - Validate translations
- `npm run generate:pseudo-locale` - Generate QA locale
- `npm run test:i18n-keys` - Test formatters

### External Services

**Translation Management Systems:**
- [Lokalise](https://lokalise.com/) - TMS with API
- [Crowdin](https://crowdin.com/) - Collaborative translation
- [Phrase](https://phrase.com/) - Enterprise TMS

**Translation Services:**
- Professional human translators
- Native speaker reviewers
- Cultural consultants

### Reference Materials

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [W3C Internationalization](https://www.w3.org/International/)

---

## Troubleshooting

### Common Issues

**Issue: Translation validation fails**

```bash
Error: Missing key 'hero.title' in de locale
```

**Solution:** Add missing key to the specified locale.

---

**Issue: Build fails for specific locale**

```bash
Error: Cannot find module './locales/pt/index.ts'
```

**Solution:** Ensure `index.ts` exists and exports all messages.

---

**Issue: Text truncated in UI**

**Solution:**
1. Use pseudo-locale to identify truncation
2. Adjust component layout
3. Use logical properties for RTL support
4. Allow dynamic text wrapping

---

**Issue: Format placeholders not working**

```json
// ❌ Wrong
{ "greeting": "Hello, name!" }

// ✅ Correct
{ "greeting": "Hello, {name}!" }
```

---

## Contact & Support

For translation questions or issues:

1. Check this guide
2. Review [I18N_GUIDE.md](./I18N_GUIDE.md)
3. Check [ADR-005](./adr/ADR-005-internationalization-architecture.md)
4. Contact frontend architecture team

---

**Last Updated:** 2025-10-12
**Maintained By:** Frontend Architecture Team

