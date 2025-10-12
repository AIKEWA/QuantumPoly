# ADR-005: Internationalization Architecture with next-intl

## Status
**Accepted** - 2025-09-11

## Context

The QuantumPoly website needs comprehensive internationalization (i18n) support to serve a global audience effectively. As outlined in the MASTERPLAN.md Block 3, we require a robust i18n architecture that supports multiple languages (initially `en`, `de`, `tr`) with proper routing, content management, and type safety.

Current state analysis:
- Project currently has no active i18n implementation
- `src/locales/` directory exists but is empty (prepared structure only)
- Next.js App Router is used, requiring modern i18n patterns
- Component architecture is modular and ready for i18n integration

## Decision

We will implement internationalization using **next-intl** as the primary i18n solution with the following architecture:

### 1. Library Choice: next-intl

**Rationale:**
- Native Next.js App Router support with `[locale]` dynamic routing
- TypeScript-first approach with compile-time type safety
- Server component compatibility and RSC support
- Efficient message loading and caching
- Rich formatting capabilities (pluralization, number/date formatting)
- Active maintenance and community adoption

### 2. Routing Strategy: Locale Prefix

**Implementation:**
- Dynamic route structure: `app/[locale]/page.tsx`
- Supported locales: `en` (default), `de`, `tr`
- URL patterns: `/en`, `/de`, `/tr`
- Middleware-based locale detection and redirect logic

### 3. Content Architecture

**Message Organization:**
```
src/locales/
├── en/
│   ├── hero.json
│   ├── about.json
│   ├── vision.json
│   ├── newsletter.json
│   ├── footer.json
│   └── common.json
├── de/
│   └── [same structure]
└── tr/
    └── [same structure]
```

**Namespace Strategy:**
- Component-based namespaces for maintainability
- `common.json` for shared UI strings (buttons, errors, etc.)
- Nested JSON structures for complex content hierarchies

### 4. Type Safety Implementation

**Compile-time Validation:**
- TypeScript definitions generated from message files
- Strict key validation preventing runtime errors
- IDE autocompletion for translation keys
- CI checks for translation completeness across locales

### 5. Component Integration Pattern

**Hook-based Access:**
```typescript
import { useTranslations } from 'next-intl';

export function Hero() {
  const t = useTranslations('hero');
  return <h1>{t('title')}</h1>;
}
```

**Server Component Support:**
- `getTranslations` for RSC compatibility
- Message hydration optimization
- Static generation support for all locales

### 6. Language Switching Component

**LanguageSwitcher Requirements:**
- Accessible dropdown with ARIA labeling
- Keyboard navigation support
- Focus management for screen readers
- Smooth route transitions
- Current language indication

## Implementation Plan

### Phase 1: Foundation (High Priority)
1. **next-intl Setup**
   - Install and configure next-intl
   - Set up middleware for locale routing
   - Configure `next.config.js` for locale handling

2. **Message Architecture**
   - Create initial message files for existing components
   - Implement namespace structure
   - Set up TypeScript integration

3. **Component Migration**
   - Update Hero component with i18n
   - Migrate About, Vision, NewsletterForm, Footer
   - Test all components with multiple locales

### Phase 2: Enhancement (Medium Priority)
1. **LanguageSwitcher Component**
   - Accessible design implementation
   - Integration with navigation
   - URL preservation logic

2. **Advanced Features**
   - Pluralization rules
   - Number/date formatting per locale
   - Rich text support in messages

### Phase 3: Quality Assurance (Medium Priority)
1. **Testing Strategy**
   - Unit tests for all translated components
   - Integration tests for locale switching
   - Accessibility testing for multi-language support

2. **CI Integration**
   - Translation key validation
   - Locale completeness checks
   - Build verification for all locales

## Technical Specifications

### Middleware Configuration
- Locale detection based on Accept-Language header
- Cookie-based preference persistence
- Fallback logic: browser → cookie → default (en)

### Message Loading Strategy
- Static import for build-time optimization
- Lazy loading for large message files
- Caching strategy for improved performance

### SEO Considerations
- `hreflang` meta tags for all locale variants
- Sitemap generation with locale-specific URLs
- robots.txt configuration for international SEO

## Quality Gates

### Development Requirements
- [ ] TypeScript strict mode compatibility
- [ ] Zero ESLint warnings for i18n patterns
- [ ] All components tested with multiple locales
- [ ] Storybook stories for each language variant

### Accessibility Requirements
- [ ] WCAG 2.1 AA compliance for language switching
- [ ] Screen reader compatibility testing
- [ ] Keyboard navigation for all i18n components
- [ ] Focus management during locale changes

### Performance Requirements
- [ ] No increase in First Contentful Paint (FCP)
- [ ] Lighthouse scores maintained ≥90
- [ ] Bundle size analysis for locale-specific chunks
- [ ] Static generation verification for all locales

## Migration Strategy

### Backward Compatibility
- Current URL structure (`/`) remains functional
- Gradual component migration without breaking changes
- Feature flags for phased rollout if needed

### Content Migration
- Extract existing hardcoded strings systematically
- Maintain content parity across all initial locales
- Prepare templates for future language additions

## Documentation Requirements

1. **Developer Guide**: Message file management, key naming conventions
2. **Content Guide**: Translation workflow, review process
3. **Component Guide**: i18n patterns, best practices
4. **Deployment Guide**: Locale-specific build configuration

## Consequences

### Positive
- **Global Accessibility**: Serves international audience effectively
- **Maintainable Content**: Centralized translation management
- **Type Safety**: Compile-time validation prevents runtime i18n errors
- **Developer Experience**: Clear patterns for component internationalization
- **SEO Benefits**: Improved international search visibility

### Negative
- **Initial Complexity**: Learning curve for next-intl patterns
- **Bundle Size**: Additional JavaScript for i18n runtime
- **Build Time**: Increased compilation time for multiple locales
- **Maintenance Overhead**: Translation key management across components

### Mitigation Strategies
- Comprehensive documentation and examples
- Automated testing for translation completeness
- CI integration for early error detection
- Gradual team training on i18n best practices

## References

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [MASTERPLAN.md Block 3 Requirements](../MASTERPLAN.md)
- [Web Content Accessibility Guidelines 2.1](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Decision Date**: 2025-09-11
**Responsible**: A.I.K (Aykut Aydin) 
**Review Date**: 2025-12-11 (Quarterly)
